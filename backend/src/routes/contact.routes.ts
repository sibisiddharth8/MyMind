import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { protectPublicUser } from '../middleware/protectPublicUser.middleware';
import { 
    createMessageController,
    getAllMessagesController,
    getMessageByIdController,
    updateMessageStatusController, // This controller already exists
    replyToMessageController,
    deleteMessageController 
} from '../controllers/contact.controller';

const router = Router();

// Public User Route
router.post('/contact', protectPublicUser, createMessageController);

// Admin Routes
router.get('/contact', protect, getAllMessagesController);
router.get('/contact/:id', protect, getMessageByIdController);
router.post('/contact/:id/reply', protect, replyToMessageController);
router.delete('/contact/:id', protect, deleteMessageController);

// --- ADD THIS NEW ROUTE ---
router.patch('/contact/:id/status', protect, updateMessageStatusController);

export default router;