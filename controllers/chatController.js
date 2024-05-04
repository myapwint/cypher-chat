import Chat from '../models/chat.js';
import User  from '../models/user.js';
import Message  from '../models/message.js';
import { uploadToStorage, removeFile } from './mediaController.js';
import { messaging } from '../utils/firebase.js';

const updateOptions = { new: true,
                        runValidators: true,
                        upsert: false };

export const createChat = async(req, res) => {
    try {
        const newChat = { name: req.body.name,
                          type: req.body.type,
                          users: req.body.users,
                          createdBy: req._id
                        };

        if (req.file && req.file.mimetype.includes('image/')) {
            newChat.profilePicUrl = await uploadToStorage(req, res);
        }

        const createdChat = await Chat.create(newChat);

        if (!createdChat ) {
            return res.status(404).json({ status: "error", message:'Unable to create chat.' });
        } else{
            return res.status(200).json({ status: "success", message:'Chat is successfully created.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const getAllChats = async(req, res) => {
    try {
        const chats = await Chat.find({});
        const chatsInfos = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await Message.findOne({ chatId: chat._id })
                                                 .sort({ createdAt: -1 });

                if (!lastMessage) {
                    return {    chatId: chat._id,
                                name: chat.name,
                                profilePicUrl: chat.profilePicUrl,
                                lastMessage: null };
                } else {
                    return {    chatId: chat._id,
                                name: chat.name,
                                profilePicUrl: chat.profilePicUrl,
                                lastMessage: {  senderName: lastMessage.senderName,
                                                content: lastMessage.content,
                                                createdAt: lastMessage.createdAt,
                                                updatedAt: lastMessage.updatedAt,
                                                mediaType: lastMessage.mediaType,
                                                mediaUrl: lastMessage.mediaUrl
                                             }
                            };
                }
            })
        );

        return res.status(200).json({ status: "success", data: chatsInfos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const getMyChats = async(req, res) => {
    try {
        const chats = await Chat.find({users: { $in: req._id }});
        const chatsInfos = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await Message.findOne({ chatId: chat._id })
                                                 .sort({ createdAt: -1 });

                if (!lastMessage) {
                    return {    chatId: chat._id,
                                name: chat.name,
                                profilePicUrl: chat.profilePicUrl,
                                lastMessage: null };
                } else {
                    return {    chatId: chat._id,
                                name: chat.name,
                                profilePicUrl: chat.profilePicUrl,
                                lastMessage: {  senderName: lastMessage.senderName,
                                                content: lastMessage.content,
                                                createdAt: lastMessage.createdAt,
                                                updatedAt: lastMessage.updatedAt,
                                                mediaType: lastMessage.mediaType,
                                                mediaUrl: lastMessage.mediaUrl
                                             }
                            };
                }
            })
        );

        return res.status(200).json({ status: "success", data: chatsInfos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const getMyIndividualChats = async(req, res) => {
    try {
        const chats = await Chat.find({users: { $in: req._id },
                                                type: 'individual'});

        const otherUserIds = chats.map(chat => {
                                const otherUserId = chat.users.find(userId => userId.toString() !== req._id.toString());
                                return otherUserId;
                            });

        return res.status(200).json({ status: "success", userIds: otherUserIds });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const updateChat = async(req, res) =>{
    try {
        let newProfilePicUrl = '';

        if (req.file && req.file.mimetype.includes('image/')) {
            const currentChat = await Chat.findById({ _id: req.params.chatId });
            if(currentChat.profilePicUrl){
                removeFile(currentChat.profilePicUrl);
            }
            newProfilePicUrl = await uploadToStorage(req, res);
        }

        const updatedChat = await Chat.findOneAndUpdate({ _id: req.params.chatId },
                                                        { $set: { name: req.body.name,
                                                                  profilePicUrl: newProfilePicUrl,
                                                                  updatedAt: Date.now()}},
                                                        updateOptions);

        if (!updatedChat) {
            return res.status(404).json({ status: "error", message:'Unable to update chat.' });
        } else{
            return res.status(200).json({ status: "success", message:'Chat is successfully updated.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const deleteChats = async(req, res) =>{
    try {
        const messagesToDelete = await Message.find({chatId: { $in: req.body.chatIds }});
        messagesToDelete.map(async (message) => {   if(message.mediaUrl){
                                                        removeFile(message.mediaUrl);
                                                    }});

        await Message.deleteMany({ chatId: { $in: req.body.chatIds }});

        const chatToDelete = await Chat.find({ _id: { $in: req.body.chatIds }});
        chatToDelete.map(async (chat) => {  if(chat.profilePicUrl){
                                                removeFile(chat.profilePicUrl);
                                            }});

        const deleteChats = await Chat.deleteMany({ _id: { $in: req.body.chatIds }});

        if (deleteChats.deletedCount == 0) {
            return res.status(404).json({ status: "error", message:'Chat is not found' });
        } else{
            return res.status(200).json({ status: "success", message:`${deleteChats.deletedCount} chats are successfully deleted.`});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const getAllUsersInChat = async(req, res) =>{
    try {
        const currentChat = await Chat.findById({ _id: req.params.chatId });
        const userInfos = await Promise.all(
            currentChat.users.map(async (user) => {
                const userInfo = await User.findById({_id: user});
                    return {    name: userInfo.name,
                                profilePicUrl: userInfo.profilePicUrl,
                                status: userInfo.status
                            };
            })
        );

        return res.status(200).json({ status: "success", data: userInfos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const addUsersInChat = async(req, res) =>{
    try {
        const currentChat = await Chat.findById({ _id: req.params.chatId });
        let currentCount = currentChat.users.length;
        await Chat.findOneAndUpdate({ _id: req.params.chatId },
                                    { $push: { users: req.body.users}},
                                    { $set: { updatedAt: Date.now()}},
                                    updateOptions);
        const newChat = await Chat.findById({ _id: req.params.chatId });    // weird, need to query againn

        if (newChat.users.length == currentCount) {
            return res.status(404).json({ status: "error", message:'Unable to add users.' });
        } else{
            return res.status(200).json({ status: "success", message:'Users are successfully added to chat.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const removeUsersFromChat = async(req, res) =>{
    try {
        const currentChat = await Chat.findById({ _id: req.params.chatId });
        let currentCount = currentChat.users.length;
        await Chat.findOneAndUpdate({ _id: req.params.chatId },
                                    { $pull: { users: { $in: req.body.users }}},
                                    { $set: { updatedAt: Date.now()}},
                                    updateOptions);
        const newChat = await Chat.findById({ _id: req.params.chatId });    // weird, need to query againn

        if (newChat.users.length == currentCount) {
            return res.status(404).json({ status: "error", message:'Unable to remove users.' });
        } else{
            return res.status(200).json({ status: "success", message:'Users are successfully removed from chat.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const getMessages = async(req, res) =>{
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
                                      .sort({ createdAt: 1 })
                                      .limit(req.body.limit);

        if (!messages) {
            return res.status(404).json({ status: "error", message:'Messages are not found' });
        } else{
            return res.status(200).json({ status: "success", data: messages });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const sendMessage= async(req, res) =>{
    try {
        const sender = await User.findById({ _id: req._id });

        const newMessage = {    chatId: req.params.chatId,
                                senderName: sender.name,
                                content: req.body.content,
                                mediaType: req.body.mediaType
                            };

        if(newMessage.mediaType !== 'text'){
            if (req.file) {
                newMessage.mediaUrl = await uploadToStorage(req, res);
            }
        }

        const createdMessage = await Message.create(newMessage);

        if (!createdMessage ) {
            return res.status(404).json({ status: "error", message:'Unable to create message.' });
        } else{
            //const payload = await notificationSetup(req);
            //await sendFcmNotification(payload);
            return res.status(200).json({ status: "success", message:'Message is successfully created.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

const notificationSetup = async(req) => {
    const currentChat = await Chat.findById({ _id: req.params.chatId });
    const sender = await User.findById({ _id: req._id });
    let users = currentChat.users;
    users.pop(req._id);     // remove sender

    const userTokens = await Promise.all(
        users.map(async (user) => {
                    const userInfo = await User.findById({_id: user});
                    return userInfo.fcmToken;
                }));

        const payload = {
            notification: {
                title: `New Message from ${sender.name}`,
                body: req.body.content || req.body.mediaType
            },
            data: {
                messageId: createdMessage._id,
                chatId: req.params.chatId
            },
            tokens: userTokens
        };

    return payload;
}

const sendFcmNotification = async (payload) => {
    try {
        const message = await messaging.sendMulticast(payload);
        console.log('Notification sent successfully:', message);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

export const deleteMessages = async(req, res) =>{
    try {
        const messagesToDelete = await Message.find({   _id: { $in: req.body.messageIds },
                                                        chatId: req.params.chatId
                                                    });

        messagesToDelete.map((message) => { if(message.mediaUrl){
                                                removeFile(message.mediaUrl);
                                            }});

        const deleteMessages = await Message.deleteMany({   _id: { $in: req.body.messageIds },
                                                            chatId: req.params.chatId
                                                        });

        if (deleteMessages.deletedCount == 0) {
            return res.status(404).json({ status: "error", message:'No messages are found' });
        } else{
            return res.status(200).json({ status: "success", message:`${deleteMessages.deletedCount} messages are successfully deleted.`});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const updateMessage = async(req, res) =>{
    try {
        // updateMessage is for text only
        const updatedMessage = await Message.findOneAndUpdate({ _id: req.params.messageId },
                                                              { $set: { content: req.body.content,
                                                                        updatedAt: Date.now() }},
                                                              updateOptions);

        if (!updatedMessage) {
            return res.status(404).json({ status: "error", message:'Unable to update message.' });
        } else{
            return res.status(200).json({ status: "success", message:'Message is successfully updated.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}