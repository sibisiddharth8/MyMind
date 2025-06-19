import { Request, Response } from 'express';
import * as publicUserService from '../services/publicUser.service';

export const initiateRegistrationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: "Name, email, and password are required." });
            return;
        }
        const result = await publicUserService.initiateRegistration({ name, email, pass: password });
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const verifyRegistrationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ message: "Email and OTP are required." });
            return;
        }
        await publicUserService.verifyUserRegistration(email, otp);
        res.status(200).json({ message: "Email verified successfully. You can now log in." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const token = await publicUserService.loginPublicUser(email, password);
        res.status(200).json({ message: "Login successful.", token });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

// --- NEWLY IMPLEMENTED FUNCTION ---
export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        // The service call is now correct
        const testMessageUrl = await publicUserService.forgotPassword(email);
        res.status(200).json({ 
            message: "If an account with that email exists, password reset instructions have been sent.",
            testMessageUrl // For development: URL to view the email in Ethereal/real inbox
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// --- NEWLY IMPLEMENTED FUNCTION ---
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        // The service call is now correct
        await publicUserService.resetPassword(token, password);
        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};