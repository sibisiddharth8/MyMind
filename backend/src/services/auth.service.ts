import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export const loginUser = async (email: string, pass: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid credentials.");
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials.");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    return token;
};

export const forgotPassword = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("User with that email does not exist.");
    }

    const resetToken = randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry }
    });
    
    // --- Send Email ---
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your Portfolio Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Your password reset token is: ${resetToken}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    const info = await transport.sendMail(mailOptions);
    return nodemailer.getTestMessageUrl(info);
};

export const resetPassword = async (token: string, newPass: string) => {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gte: new Date() }
        }
    });

    if (!user) {
        throw new Error("Password reset token is invalid or has expired.");
    }

    const hashedPassword = await bcrypt.hash(newPass, 12);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        }
    });
};