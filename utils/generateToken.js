import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js'

export const generateToken = (res, user) => {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const cookieOptions = {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions)
    return token;
}