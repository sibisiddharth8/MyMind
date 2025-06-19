import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export const registerPublicUser = async (data: { name: string, email: string, pass: string }) => {
    const existingUser = await prisma.publicUser.findUnique({ where: { email: data.email } });
    if (existingUser) throw new Error("An account with this email already exists.");
    
    const hashedPassword = await bcrypt.hash(data.pass, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 600000); 

    const newUser = await prisma.publicUser.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            verificationOtp: otp,
            otpExpiry: otpExpiry,
            isVerified: false,
        }
    });

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, port: Number(process.env.EMAIL_PORT),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const mailOptions = {
        to: newUser.email,
        from: `Your Portfolio <${process.env.EMAIL_USER}>`,
        subject: 'Verify Your Email Address',
        html: `<p>Welcome! Your verification code is: <b>${otp}</b>. It will expire in 10 minutes.</p>`
    };
    await transport.sendMail(mailOptions);

    return { message: "Verification OTP sent to your email." };
};

// --- THIS IS THE NEW REGISTRATION STEP 1 ---
export const initiateRegistration = async (data: { name: string, email: string, pass: string }) => {
    const existingVerifiedUser = await prisma.publicUser.findFirst({ where: { email: data.email, isVerified: true } });
    if (existingVerifiedUser) {
        throw new Error("An account with this email already exists and is verified.");
    }
    
    // If user exists but is not verified, delete the old record to allow re-registration
    await prisma.publicUser.deleteMany({ where: { email: data.email, isVerified: false } });

    const hashedPassword = await bcrypt.hash(data.pass, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const otpExpiry = new Date(Date.now() + 600000); // OTP is valid for 10 minutes

    const newUser = await prisma.publicUser.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            verificationOtp: otp,
            otpExpiry: otpExpiry,
            isVerified: false,
        }
    });

    // Send the OTP via email
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, port: Number(process.env.EMAIL_PORT),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const mailOptions = {
        to: newUser.email,
        from: `Your Portfolio <${process.env.EMAIL_USER}>`,
        subject: 'Verify Your Email Address',
        html: `<p>Welcome! Your verification code is: <b>${otp}</b>. It will expire in 10 minutes.</p>`
    };
    await transport.sendMail(mailOptions);

    return { message: "Verification OTP sent to your email." };
};

// --- THIS IS THE NEW REGISTRATION STEP 2 ---
export const verifyUserRegistration = async (email: string, otp: string) => {
    const user = await prisma.publicUser.findFirst({
        where: { email, verificationOtp: otp, otpExpiry: { gte: new Date() } }
    });

    if (!user) {
        throw new Error("Invalid or expired OTP. Please try registering again.");
    }

    return prisma.publicUser.update({
        where: { id: user.id },
        data: {
            isVerified: true,
            verificationOtp: null,
            otpExpiry: null,
        }
    });
};

// --- THIS FUNCTION IS UPDATED ---
// Login now checks if the user is verified
export const loginPublicUser = async (email: string, pass: string) => {
    const user = await prisma.publicUser.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials.");

    // ADDED CHECK: User must be verified to log in
    if (!user.isVerified) {
        throw new Error("Email not verified. Please check your inbox for the OTP and verify your account first.");
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new Error("Invalid credentials.");

    const token = jwt.sign({ userId: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return token;
};

// --- NEWLY IMPLEMENTED FUNCTION ---
export const forgotPassword = async (email: string) => {
    const user = await prisma.publicUser.findUnique({ where: { email } });
    if (!user) {
        return; // Silently succeed
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 600000);

    await prisma.publicUser.update({
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
        from: `Your Portfolio <${process.env.EMAIL_USER}>`,
        subject: 'Your Portfolio Password Reset Code',
        html: `<p>You requested a password reset. Your 6-digit code is: <b style="font-size: 18px;">${resetToken}</b>. It will expire in 10 minutes.</p>`
    };

    // FIX: We now correctly capture the result of sendMail into the 'info' constant.
    const info = await transport.sendMail(mailOptions);
    
    return nodemailer.getTestMessageUrl(info);
};


// --- NEWLY IMPLEMENTED FUNCTION ---
export const resetPassword = async (token: string, newPass: string) => {
    const user = await prisma.publicUser.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gte: new Date() }
        }
    });

    if (!user) {
        throw new Error("Password reset token is invalid or has expired.");
    }

    const hashedPassword = await bcrypt.hash(newPass, 12);

    await prisma.publicUser.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        }
    });
};