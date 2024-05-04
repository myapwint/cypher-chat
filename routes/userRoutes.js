import { Router } from 'express';
import { parseFormData } from '../utils/parsedata.js'
import { verifyToken } from '../utils/jwt.js';
import { register, login, logout, getProfile, updateProfle,
         updatePassword, getStatus, updateStatus, getAllUsers, getUsers } from '../controllers/userController.js'
import { validateRegistration, validateProfileUpdate, validatePasswordUpdate,
         validateStatusUpdate, validateQuery} from "../utils/validation.js";

const router = Router();

// authentication
router.post('/login', parseFormData.none(), login); // tested ok
router.post('/logout', verifyToken, logout);        // tested ok

// user
router.post('/register', parseFormData.single('media'), validateRegistration, register);                        // tested ok
router.get('/users/me', verifyToken, getProfile);                                                               // tested ok
router.put('/users/me', verifyToken, parseFormData.single('media'), validateProfileUpdate, updateProfle);       // tested ok
router.put('/users/me/status', verifyToken, parseFormData.none(), validateStatusUpdate, updateStatus);          // tested ok
router.put('/users/me/password', verifyToken, parseFormData.none(), validatePasswordUpdate, updatePassword);    // tested ok

// other user
router.get('/users', verifyToken, getAllUsers);                     // tested ok
router.get('/users/search', verifyToken, validateQuery, getUsers);  // tested ok
router.get('/users/:userId', verifyToken, getProfile);              // tested ok
router.get('/users/:userId/status', verifyToken, getStatus);        // tested ok

export default router;