import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Local Type for login credentials
interface LoginCredentials {
  email: string;
  pass: string;
}

export const loginUser = async ({ email, pass }: LoginCredentials) => {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
        throw new Error("Invalid admin credentials.");
    }

    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) {
        throw new Error("Invalid admin credentials.");
    }

    const aboutProfile = await prisma.about.findFirst();
    const userProfile = {
        id: admin.id,
        email: admin.email,
        name: aboutProfile?.name || 'Admin',
        image: aboutProfile?.image || null,
    };

    const token = jwt.sign({ userId: admin.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    
    return { token, user: userProfile, message: 'Admin login successful.' };
};

export const forgotPassword = async (email: string) => {
    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user) return; // Silently succeed

    // FIX: Generate a 6-digit OTP instead of a long token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 600000); // Token is valid for 10 minutes

    await prisma.admin.update({
        where: { email },
        data: { resetToken, resetTokenExpiry }
    });
    
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        to: user.email,
        from: `Your Portfolio Admin <${process.env.EMAIL_USER}>`,
        subject: 'Your Admin Portal Password Reset Code',
        // FIX: Updated email body
        html: `<p>You requested a password reset for your admin portal. Your 6-digit code is: <b style="font-size: 18px;">${resetToken}</b>. It will expire in 10 minutes.</p>`
    };

    await transport.sendMail(mailOptions);
};

export const resetPassword = async (token: string, newPass: string) => {
    // FIX: Use prisma.admin
    const user = await prisma.admin.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gte: new Date() }
        }
    });

    if (!user) {
        throw new Error("Password reset token is invalid or has expired.");
    }

    const hashedPassword = await bcrypt.hash(newPass, 12);

    // FIX: Use prisma.admin
    await prisma.admin.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        }
    });
};