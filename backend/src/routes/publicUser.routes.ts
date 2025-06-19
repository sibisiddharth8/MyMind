import { Router } from 'express';
import { 
    initiateRegistrationController, // Renamed
    verifyRegistrationController,   // New
    loginController,
    forgotPasswordController,
    resetPasswordController
} from '../controllers/publicUser.controller';

const router = Router();

// Updated two-step registration flow
router.post('/users/register', initiateRegistrationController);
router.post('/users/verify', verifyRegistrationController);

router.post('/users/login', loginController);
router.post('/users/forgot-password', forgotPasswordController);
router.post('/users/reset-password/:token', resetPasswordController);

export default router;