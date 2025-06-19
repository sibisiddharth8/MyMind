import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface PublicAuthRequest extends Request {
    user?: {
        userId: string;
        name: string;
        email: string;
    };
}

export const protectPublicUser = (req: PublicAuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: "Authentication required. Please log in." });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded as any; // Attach full user payload
        next();
    } catch (error) {
        res.status(401).json({ message: "Authentication failed. Invalid token." });
    }
};