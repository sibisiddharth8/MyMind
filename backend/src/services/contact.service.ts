import { PrismaClient, MessageStatus, Prisma } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transformMessagePaths = (message: any) => {
    if (!message) return null;
    const baseUrl = process.env.BACKEND_URL;

    // Check for the nested user profile image
    if (message.publicUser?.profileImage && !message.publicUser.profileImage.startsWith('http')) {
        message.publicUser.profileImage = `${baseUrl}/${message.publicUser.profileImage}`;
    }
    return message;
};

// This function now correctly requires a 'user' object to link the message.
export const createMessage = async (
    data: { subject: string, message: string }, 
    user: { userId: string, name: string, email: string }
) => {
  const newMessage = await prisma.contactMessage.create({ 
      data: {
          subject: data.subject,
          message: data.message,
          name: user.name,
          email: user.email,
          publicUser: { connect: { id: user.userId } }
      },
      include: { publicUser: true } // Include user data in the response
  });
  // FIX: Transform path before returning
  return transformMessagePaths(newMessage);
};

export const getAllMessages = async ({ page = 1, limit = 10, email, status, searchQuery, dateFilter }: {
    page: number,
    limit: number,
    email?: string,
    status?: MessageStatus,
    searchQuery?: string,
    dateFilter?: string
}) => {
    const where: Prisma.ContactMessageWhereInput = {};

    if (dateFilter) {
        let gte: Date | undefined;
        switch (dateFilter) {
            case 'today':
                gte = new Date();
                gte.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                gte = new Date();
                gte.setDate(gte.getDate() - 1);
                gte.setHours(0, 0, 0, 0);
                break;
            case 'last7days':
                gte = new Date();
                gte.setDate(gte.getDate() - 7);
                gte.setHours(0, 0, 0, 0);
                break;
            case 'last30days':
                gte = new Date();
                gte.setDate(gte.getDate() - 30);
                gte.setHours(0, 0, 0, 0);
                break;
        }
        if (gte) {
            where.createdAt = { gte };
        }
    }
    
    if (email) { where.email = { contains: email, mode: 'insensitive' }; }
    if (status) { where.status = status; }
    if (searchQuery) {
        where.OR = [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
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
        include: { publicUser: true }
    });

    return {
        // FIX: Transform paths for every message in the list
        data: messages.map(transformMessagePaths),
        pagination: { total, totalPages: Math.ceil(total / limit), currentPage: page, limit },
    };
};
export const getMessageById = async (id: string) => {
  const message = await prisma.contactMessage.findUnique({ 
    where: { id },
    include: { publicUser: true } // FIX: Include user data
  });

  if (message && message.status === 'UNREAD') {
    const updatedMessage = await prisma.contactMessage.update({ 
        where: { id }, 
        data: { status: 'READ' },
        include: { publicUser: true }
    });
    return transformMessagePaths(updatedMessage);
  }
  return transformMessagePaths(message);
};

// Get message statistics
export const getMessageStats = async () => {
    const total = await prisma.contactMessage.count();
    const unread = await prisma.contactMessage.count({ where: { status: 'UNREAD' } });
    const read = await prisma.contactMessage.count({ where: { status: 'READ' } });
    const responded = await prisma.contactMessage.count({ where: { status: 'RESPONDED' } });
    
    const distinctEmails = await prisma.contactMessage.findMany({
        distinct: ['email'],
        select: { email: true }
    });
    const uniqueSenderCount = distinctEmails.length;

    return { total, unread, read, responded, uniqueSenderCount };
};

// Manually update a message's status
export const updateMessageStatus = async (id: string, status: MessageStatus) => {
    const updatedMessage = await prisma.contactMessage.update({ 
        where: { id }, 
        data: { status },
        include: { publicUser: true } // FIX: Include user data
    });
    return transformMessagePaths(updatedMessage);
};

// Delete a message
export const deleteMessage = (id: string) => {
  return prisma.contactMessage.delete({ where: { id } });
};

// Reply to a message and send an email
export const replyToMessage = async (id: string, replyText: string) => {
    const originalMessage = await prisma.contactMessage.findUnique({ where: { id } });
    if (!originalMessage) {
        throw new Error("Original message not found.");
    }

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
        to: originalMessage.email,
        from: `Sibi Siddharth <${process.env.EMAIL_USER}>`,
        subject: `Re: ${originalMessage.subject}`,
        html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
                <p>Hi ${originalMessage.name},</p>
                <p>Thank you for your message. Here is my response:</p>
                <div style="border-left: 3px solid #ccc; padding-left: 15px; margin: 15px 0; color: #555;">
                    <p>${replyText}</p>
                </div>
                <p>Best regards,<br/>Sibi Siddharth</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
                <p style="font-size: 12px; color: #888;"><b>Original Message:</b> "${originalMessage.message}"</p>
            </div>
        `
    };

    const info = await transport.sendMail(mailOptions);
    
    await updateMessageStatus(id, 'RESPONDED');
    
    return nodemailer.getTestMessageUrl(info);
};