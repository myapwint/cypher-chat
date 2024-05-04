import {storage} from '../utils/firebase.js'
import config from '../utils/config.js';

const bucketPath = config.firebaseConfig.storageBucket;

export const uploadToStorage = async(req, res) => {
    try {
        const MAXSIZE = 10 * 1024 * 1024;
        const { file } = req;

        if (file.fileSize > MAXSIZE) {
            return res.status(400).json({ status: "error", message: "File size exceeds limit (10MB)" });
        }

        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp",
                                  "video/mp4", "video/webm", "video/quicktime",
                                  "audio/mpeg", "audio/aac", "audio/ogg",
                                  "application/pdf", "application/msword", "text/plain",
                                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({ status: "error", message: "Invalid file type." });
        }

        const finalFileName = `${Date.now()}-${file.originalname}`;
        const bucket = storage.bucket(bucketPath);
        const fileRef = bucket.file(finalFileName);
        await fileRef.save(file.buffer);

        return `https://storage.googleapis.com/${bucketPath}/${finalFileName}`;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
}

export const removeFile = async(mediaUrl) =>{
    if (mediaUrl) {
        const mediaRef = storage.bucket(bucketPath).file(mediaUrl.replace(`https://storage.googleapis.com/${bucketPath}/`, ''));
        await mediaRef.delete();
    }
}