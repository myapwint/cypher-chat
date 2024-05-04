import { Router } from 'express';
import { parseFormData } from '../utils/parsedata.js'
import { verifyToken } from '../utils/jwt.js';
import { createChat, getAllChats, getMyChats, getMyIndividualChats,updateChat, deleteChats, getAllUsersInChat, addUsersInChat,
         removeUsersFromChat, getMessages, sendMessage, deleteMessages, updateMessage }
         from '../controllers/chatController.js'
import { validateChat, validateMessage } from "../utils/validation.js";

const router = Router();

// chat management
router.post('/chats', verifyToken, parseFormData.single('media'), validateChat, createChat);            // tested ok
router.get('/chats', verifyToken, getAllChats);                                                         // tested ok
router.get('/chats/me', verifyToken, getMyChats);                                                       // tested ok
router.get('/chats/individual', verifyToken, getMyIndividualChats);                                             // tested ok
router.put('/chats/:chatId', verifyToken, parseFormData.single('media'), validateChat, updateChat);     // tested ok
router.delete('/chats', verifyToken, parseFormData.none(), deleteChats);                                // tested ok

router.get('/chats/:chatId/users', verifyToken, getAllUsersInChat);                                     // tested ok
router.put('/chats/:chatId/users', verifyToken, parseFormData.none(), addUsersInChat);                  // tested ok
router.delete('/chats/:chatId/users', verifyToken, parseFormData.none(), removeUsersFromChat);          // tested ok

// messaging
router.get('/chats/:chatId/messages', verifyToken, parseFormData.none(), getMessages);                                  // tested ok
router.post('/chats/:chatId/messages', verifyToken, parseFormData.single('media'), validateMessage, sendMessage);       // tested ok, fcm not tested yet
router.delete('/chats/:chatId/messages', verifyToken, parseFormData.none(), deleteMessages);                            // tested ok
router.put('/chats/:chatId/messages/:messageId', verifyToken, parseFormData.none(), validateMessage, updateMessage);    // tested ok

export default router;