import { Request, Response } from 'express';
import * as adminAuthService from '../services/adminAuth.service';

export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const token = await adminAuthService.loginUser(email, password);
        res.status(200).json({ message: "Admin login successful.", token });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        await adminAuthService.forgotPassword(email);
        res.status(200).json({ message: "If an admin account with that email exists, password reset instructions have been sent." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        await adminAuthService.resetPassword(token, password);
        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};