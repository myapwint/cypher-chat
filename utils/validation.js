import validator from 'validator';
import zxcvbn from 'zxcvbn'

function checkValidName(name) {
    const isValidName = /^[A-Za-z][A-Za-z\ \.\-']+$/.test(name);
    return isValidName;
}

export const validateRegistration = async(req, res, next) => {
    const errors = [];

    if(!req.body.name || req.body.name.trim() === ''){
        errors.push('Name is required.');
    }

    if(!checkValidName(req.body.name)){
        errors.push('Invalid name.');
    }

    if (!validator.isEmail(req.body.email)) {
        errors.push('Invalid email format.');
    }

    const checkPasswordResult = zxcvbn(req.body.password);
    if (checkPasswordResult.score <= 2) {
        errors.push('Password does not meet complexity. ' + checkPasswordResult.feedback.warning.toString());
    }

    if (errors.length > 0) {
        let message = errors.join(" ");
        return res.status(400).json({ status:"error", message: message });
    } else {
        next();
    }
}

export const validateProfileUpdate = async(req, res, next) => {
    const errors = [];

    if(!req.body.name || req.body.name.trim() === ''){
        errors.push('Name is required.');
    }

    if (!validator.isEmail(req.body.email)) {
        errors.push('Invalid email format.');
    }

    if (errors.length > 0) {
        let message = errors.join(" ");
        return res.status(400).json({ status:"error", message: message });
    } else {
        next();
    }
}

export const validatePasswordUpdate = async(req, res, next) => {
    const message = '';

    const checkPasswordResult = zxcvbn(req.body.password);
    if (checkPasswordResult.score <= 2) {
        message = 'Password does not meet complexity. ' + checkPasswordResult.feedback.warning.toString();
    }

    if (message.length > 0) {
        return res.status(400).json({ status:"error", message: message });
    } else {
        next();
    }
}

export const validateStatusUpdate = async(req, res, next) => {
    const message = '';

    if(!req.body.status || req.body.status.trim() === ''){
        message =  'Status is required.';
    }

    if (message.length > 0) {
        return res.status(400).json({ status:"error", message: message });
    } else {
        req.body.status = req.body.status.trim();
        next();
    }
}

export const validateQuery = async(req, res, next) => {
    const message = '';

    if(!req.query.query || req.query.query.trim() === ''){
        message =  'Search field is required.';
    }

    if (message.length > 0) {
        return res.status(400).json({ status:"error", message: message });
    } else {
        next();
    }
}

export const validateChat = async(req, res, next) => {
    const errors = [];

    if(!req.body.name || req.body.name.trim() === ''){
        errors.push('Name is required.');
    }

    if(!checkValidName(req.body.name)){
        errors.push('Invalid name.');
    }

    if (errors.length > 0) {
        let message = errors.join(" ");
        return res.status(400).json({ status:"error", message: message });
    } else {
        req.body.name = req.body.name.trim();
        next();
    }
}

export const validateMessage= async(req, res, next) => {
    const message = '';

    if(req.body.mediaType == 'text' && (!req.body.content || req.body.content.trim() === '')){
        message =  'Content is required.';
    }

    if (message.length > 0) {
        return res.status(400).json({ status:"error", message: message });
    } else {
        if(req.body.mediaType == 'text'){
            //req.body.content = encodeURIComponent(req.body.content.trim());
        }
        next();
    }
}