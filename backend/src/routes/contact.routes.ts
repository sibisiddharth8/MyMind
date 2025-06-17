import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    createMessageController,
    getAllMessagesController,
    getMessageByIdController,
    getMessageStatsController,
    updateMessageStatusController,
    replyToMessageController,
    deleteMessageController
} from '../controllers/contact.controller';

const router = Router();

// --- PUBLIC ROUTE ---
// Anyone can send a message
router.post('/contact', createMessageController);

// --- PROTECTED ADMIN ROUTES ---
router.get('/contact', protect, getAllMessagesController);
router.get('/contact/stats', protect, getMessageStatsController);
router.get('/contact/:id', protect, getMessageByIdController);
router.patch('/contact/:id/status', protect, updateMessageStatusController);
router.post('/contact/:id/reply', protect, replyToMessageController);
router.delete('/contact/:id', protect, deleteMessageController);

export default router;