import { PrismaClient, MessageStatus, Prisma } from '@prisma/client'; // <-- THE FIX IS HERE
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Create a message (for public use)
export const createMessage = (data: { name: string, email: string, subject: string, message: string }) => {
  return prisma.contactMessage.create({ data });
};

// Get all messages with pagination (for admin)
export const getAllMessages = async ({ page = 1, limit = 10, email, status, searchQuery }: {
    page: number,
    limit: number,
    email?: string,
    status?: MessageStatus,
    searchQuery?: string
}) => {
    // Build the 'where' clause dynamically based on provided filters
    const where: Prisma.ContactMessageWhereInput = {};
    if (email) {
        where.email = { contains: email, mode: 'insensitive' };
    }
    if (status) {
        where.status = status;
    }
    if (searchQuery) {
        where.OR = [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { subject: { contains: searchQuery, mode: 'insensitive' } },
            { message: { contains: searchQuery, mode: 'insensitive' } }
        ];
    }

    const total = await prisma.contactMessage.count({ where });
    const messages = await prisma.contactMessage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
    });

    return {
        data: messages,
        pagination: { total, totalPages: Math.ceil(total / limit), currentPage: page, limit },
    };
};

// Get a single message and mark it as READ (for admin)
export const getMessageById = async (id: string) => {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (message && message.status === 'UNREAD') {
    return prisma.contactMessage.update({ where: { id }, data: { status: 'READ' } });
  }
  return message;
};

// Get message stats (for admin)
export const getMessageStats = async () => {
    const total = await prisma.contactMessage.count();
    const unread = await prisma.contactMessage.count({ where: { status: 'UNREAD' } });
    const read = await prisma.contactMessage.count({ where: { status: 'READ' } });
    const responded = await prisma.contactMessage.count({ where: { status: 'RESPONDED' } });
    
    // Use Prisma's 'distinct' feature to count unique emails
    const distinctEmails = await prisma.contactMessage.findMany({
        distinct: ['email'],
        select: { email: true }
    });
    const uniqueSenderCount = distinctEmails.length;

    return { total, unread, read, responded, uniqueSenderCount };
};

// Update a message's status (for admin)
export const updateMessageStatus = (id: string, status: MessageStatus) => {
    return prisma.contactMessage.update({ where: { id }, data: { status } });
};

// Delete a message (for admin)
export const deleteMessage = (id: string) => {
  return prisma.contactMessage.delete({ where: { id } });
};

// Reply to a message (for admin)
export const replyToMessage = async (id: string, replyText: string) => {
    const originalMessage = await prisma.contactMessage.findUnique({ where: { id } });
    if (!originalMessage) {
        throw new Error("Original message not found.");
    }

    // --- Send Email via Nodemailer ---
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
        to: originalMessage.email,
        from: 'your-portfolio@admin.com', // Your admin email
        subject: `Re: ${originalMessage.subject}`,
        text: `Hi ${originalMessage.name},\n\nYou sent the following message:\n"${originalMessage.message}"\n\nMy Reply:\n${replyText}\n\nBest regards,\nSibi Siddharth`,
        html: `<p>Hi ${originalMessage.name},</p><p>You sent the following message:</p><blockquote>${originalMessage.message}</blockquote><hr><p><b>My Reply:</b></p><p>${replyText}</p><hr><p>Best regards,<br/>Sibi Siddharth</p>`,
    };

    const info = await transport.sendMail(mailOptions);
    
    // After sending, update the status to RESPONDED
    await updateMessageStatus(id, 'RESPONDED');

    // Return the Ethereal test URL for verification
    return nodemailer.getTestMessageUrl(info);
};