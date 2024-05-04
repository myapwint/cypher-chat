import config from './config.js';
import jwt  from 'jsonwebtoken';

export const generateToken = async(user) => {
    const payload = {
        _id: user._id.toString()
    };

    const options = {
        expiresIn: '1h', // Token expires in 1 hour
    };
    return jwt.sign(payload, config.secret, options);
}

export const verifyToken = async(req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'No token provided' });
    }

    const parts = token.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).send({ message: 'Invalid token format' });
    }

    jwt.verify(parts[1], config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Failed to authenticate token' });
        }
        req.bearerToken = token;
        req.decoded = decoded;
        req._id = decoded._id;
        next();
    });
}