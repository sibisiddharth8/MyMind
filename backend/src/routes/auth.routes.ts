import { Router } from 'express';
import { 
    loginController, 
    forgotPasswordController, 
    resetPasswordController 
} from '../controllers/auth.controller';

const router = Router();

router.post('/auth/login', loginController);
router.post('/auth/forgot-password', forgotPasswordController);
router.post('/auth/reset-password/:token', resetPasswordController);

export default router;