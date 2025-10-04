import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { register, login, refresh, logout, me } from '../controllers/auth-controller.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', authenticate(true), refresh);
authRouter.post('/logout', authenticate(true), logout);
authRouter.get('/me', authenticate(true), me);
