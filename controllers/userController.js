import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwt.js";
import User from '../models/user.js';
import { uploadToStorage, removeFile } from './mediaController.js';

const updateOptions = { new: true,
                        runValidators: true,
                        upsert: false };

export const register = async(req, res) =>{
    try {
        const newUser = {   email: req.body.email,
                            name: req.body.name,
                            password: req.body.password,
                            fcmToken: req.body.fcmToken
                        };

        const existingUser = await User.findOne({ email: newUser.email });

        if (existingUser) {
            return res.status(400).json({ status: "error", message: 'Email already exists.' });
        } else {
            if (req.file && req.file.mimetype.includes('image/')) {
                newUser.profilePicUrl = await uploadToStorage(req, res);
            }

            const createdUser  = await User.create(newUser);

            if (!createdUser) {
                return res.status(404).json({ status: "error", message:'Unable to register user.' });
            } else{
                return res.status(200).json({ status: "success", message:'User successfully registered.' });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const login = async(req, res) =>{
    try {
        const { email, password } = req.body;

        if(email){
            const user = await User.findOne({ email: email});
            if(!user) {
                return res.status(401).json({ status: "error", message: "Invalid email/password" });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if(!isValidPassword){
                return res.status(401).json({ status: "error", message: "Invalid email/password" });
            } else{
                const token = await generateToken(user);
                return res.status(200).json({ status: "success", token });
            }
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const logout = async(req, res) =>{
    return res.status(200).json({ status: "success", message: 'Successfully logged out' });
}

export const getProfile = async(req, res) =>{
    try {
        const _id  = req.params.userId || req._id;
        const user = await User.findById({ _id: _id });

        if (!user) {
            return res.status(404).json({ status: "error", message:'User not found' });
        } else{
            return res.status(200).json({   status: "success",
                                            name: user.name,
                                            email: user.email,
                                            profilePicUrl: user.profilePicUrl
                                        });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const updateProfle = async(req, res) =>{
    try {
        const { name, email } = req.body;
        const user = await User.findById({ _id: req._id });
        let newProfilePicUrl = '';

        if (req.file && req.file.mimetype.includes('image/')) {
            if(user.profilePicUrl){
                removeFile(user.profilePicUrl);
            }
            newProfilePicUrl = await uploadToStorage(req, res);
        }

        const updatedUser = await User.findOneAndUpdate({ _id: req._id },
                                                        { $set: { name: name,
                                                                  email: email,
                                                                  profilePicUrl: newProfilePicUrl,
                                                                  updatedAt: Date.now()}},
                                                        updateOptions);

        if (!updatedUser) {
            return res.status(404).json({ status: "error", message:'User not found' });
        } else{
            return res.status(200).json({ status: "success", message:'Profile succesfully updated.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const updatePassword = async(req, res) =>{
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await User.findOneAndUpdate({ _id: req._id },
                                                        { $set: { password: hashedPassword,
                                                                  updatedAt: Date.now()}},
                                                        updateOptions);

        if (!updatedUser) {
            return res.status(404).json({ status: "error", message:'User not found' });
        } else{
            return res.status(200).json({ status: "success", message:'Password succesfully updated.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}


export const getStatus = async(req, res) =>{
    try {
        const user = await User.findById({ _id: req.params.userId });

        if (!user) {
            return res.status(404).json({ status: "error", message:'User not found' });
        } else{
            return res.status(200).json({ status: "success",  onlineStatus: user.status });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const updateStatus = async(req, res) =>{
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: req._id },
                                                        { $set: { status: req.body.status,
                                                                  updatedAt: Date.now()
                                                                 }},
                                                        updateOptions);

        if (!updatedUser) {
            return res.status(404).json({ status: "error", message:'User not found' });
        } else{
            return res.status(200).json({ status: "success", message:'Status succesfully updated.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const getUsers = async(req, res) =>{
    try {
        const searchTerm = req.query.query;
        const regex = new RegExp(searchTerm, 'i');
        const query = {$or: [{ name: { $regex: regex }},
                             { email: { $regex: regex }},
                            ]};

        const users = await User.find(query);
        const userInfos = users.map((user) => ({ name: user.name,
                                                 profilePicUrl: user.profilePicUrl,
                                                 status: user.status
                                                }));

        if (users.length == 0) {
            return res.status(404).json({ status: "error", message:'No users found' });
        } else{
            return res.status(200).json({ status: "success", data: userInfos });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const getAllUsers = async(req, res) =>{
    try {
        const users = await User.find({_id: { $ne: req._id }}); //except ownself
        const userInfos = users.map((user) => ({ name: user.name,
                                                 profilePicUrl: user.profilePicUrl,
                                                 status: user.status
                                                }));

        if (!users) {
            return res.status(404).json({ status: "error", message:'No users found' });
        } else{
            return res.status(200).json({ status: "success", data: userInfos });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}