import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const token = await authService.loginUser(email, password);
        res.status(200).json({ message: "Login successful.", token });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const testMessageUrl = await authService.forgotPassword(email);
        res.status(200).json({ 
            message: "Password reset instructions sent successfully. Please check your email.",
            testMessageUrl // For development: URL to view the email in Ethereal
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        await authService.resetPassword(token, password);
        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};