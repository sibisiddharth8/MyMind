import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { uploadMemberImage } from '../middleware/multer'; // <-- Import new uploader
import {
    createMemberController,
    getAllMembersController,
    updateMemberController,
    deleteMemberController
} from '../controllers/member.controller';

const router = Router();

router.get('/members', getAllMembersController);
// Add the multer middleware to the POST and PUT routes
router.post('/members', protect, uploadMemberImage, createMemberController);
router.put('/members/:id', protect, uploadMemberImage, updateMemberController);
router.delete('/members/:id', protect, deleteMemberController);

export default router;