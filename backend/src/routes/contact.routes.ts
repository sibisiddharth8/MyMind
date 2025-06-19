import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { protectPublicUser } from '../middleware/protectPublicUser.middleware';
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
router.post('/contact', protectPublicUser, createMessageController);

// --- PROTECTED ADMIN ROUTES ---
router.get('/contact', protect, getAllMessagesController);

// --- THIS IS THE FIX ---
// The specific static route '/stats' must come BEFORE the dynamic route '/:id'.
router.get('/contact/stats', protect, getMessageStatsController);
router.get('/contact/:id', protect, getMessageByIdController);

router.patch('/contact/:id/status', protect, updateMessageStatusController);
router.post('/contact/:id/reply', protect, replyToMessageController);
router.delete('/contact/:id', protect, deleteMessageController);

export default router;