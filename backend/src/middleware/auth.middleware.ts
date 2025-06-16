import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request interface to include a user property
export interface AuthRequest extends Request {
    userId?: string;
}

// Add the ': void' return type and fix the return statements
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1]; // Expects "Bearer TOKEN"

    if (!token) {
        res.status(401).json({ message: "Authentication required. No token provided." });
        return; // Use a plain return to stop execution
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        // Attach user id to the request for use in controllers
        req.userId = (decoded as any).userId; 
        next();
    } catch (error) {
        res.status(401).json({ message: "Authentication failed. Invalid token." });
        return; // Use a plain return to stop execution
    }
};