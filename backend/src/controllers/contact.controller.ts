import { Request, Response } from 'express';
import * as contactService from '../services/contact.service';
import { MessageStatus } from '@prisma/client';
import { PublicAuthRequest } from '../middleware/protectPublicUser.middleware';

export const createMessageController = async (req: PublicAuthRequest, res: Response): Promise<void> => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) {
            res.status(400).json({ message: "Subject and message are required." });
            return;
        }
        const user = req.user!; 
        const newMessage = await contactService.createMessage({ subject, message }, user);
        res.status(201).json({ message: "Message sent successfully!", data: newMessage });
    } catch (error) {
        res.status(500).json({ message: "Error sending message.", error });
    }
};

export const getAllMessagesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const email = req.query.email as string | undefined;
        const status = req.query.status as MessageStatus | undefined;
        const searchQuery = req.query.search as string | undefined;
        const dateFilter = req.query.dateFilter as string | undefined; // <-- ADD THIS

        const result = await contactService.getAllMessages({ page, limit, email, status, searchQuery, dateFilter }); // <-- PASS IT
        res.status(200).json({ message: "Messages retrieved successfully.", ...result });
    } catch (error) {
        console.error("--- ERROR FETCHING CONTACT MESSAGES ---", error);
        res.status(500).json({ message: "Error retrieving messages.", error });
    }
};

export const getMessageByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const message = await contactService.getMessageById(req.params.id);
        if (!message) {
            res.status(404).json({ message: "Message not found." });
        } else {
            res.status(200).json({ message: "Message retrieved successfully.", data: message });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving message.", error });
    }
};

export const getMessageStatsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await contactService.getMessageStats();
        res.status(200).json({ message: "Message stats retrieved successfully.", data: stats });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving message stats.", error });
    }
};

export const updateMessageStatusController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        if (!status || !Object.values(MessageStatus).includes(status)) {
            res.status(400).json({ message: "A valid status (UNREAD, READ, RESPONDED) is required." });
            return;
        }
        const updatedMessage = await contactService.updateMessageStatus(req.params.id, status);
        res.status(200).json({ message: "Message status updated successfully.", data: updatedMessage });
    } catch (error) {
        res.status(500).json({ message: "Error updating message status.", error });
    }
};

export const replyToMessageController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { replyText } = req.body;
        if (!replyText) {
            res.status(400).json({ message: "replyText is required." });
            return;
        }
        const testMessageUrl = await contactService.replyToMessage(req.params.id, replyText);
        res.status(200).json({ 
            message: "Reply sent successfully and message status updated to RESPONDED.",
            testMessageUrl // For development: URL to view the sent reply in Ethereal
        });
    } catch (error: any) {
        res.status(500).json({ message: "Error sending reply.", error: error.message });
    }
};

export const deleteMessageController = async (req: Request, res: Response): Promise<void> => {
    try {
        await contactService.deleteMessage(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting message.", error });
    }
};