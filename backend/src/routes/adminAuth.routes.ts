import { Router } from 'express';
import { 
    loginController, 
    forgotPasswordController, 
    resetPasswordController 
} from '../controllers/adminAuth.controller';

const router = Router();

// Endpoint for the Admin Portal login
router.post('/auth/login', loginController);
router.post('/auth/forgot-password', forgotPasswordController);
router.post('/auth/reset-password/:token', resetPasswordController);

export default router;