import express from 'express';
import {
  singup,
  signin,
  currentUser,
  logout,
  updateAvatar,
  verify,
  resendVerify,
} from '../controllers/usersControllers.js';
import {
  userSignUpSchema,
  userSignInSchema,
  userEmailSchema,
} from '../schemas/usersSchemas.js';
import validateBody from '../helpers/validateBody.js';
import validateAuth from '../middlewares/validateAuth.js';
import upload from '../middlewares/upload.js';

const authRouter = express.Router();

authRouter.post('/register', validateBody(userSignUpSchema), singup);

authRouter.get('/verify/:verificationToken', verify);

authRouter.post('/verify', validateBody(userEmailSchema), resendVerify);

authRouter.post('/login', validateBody(userSignInSchema), signin);

authRouter.get('/current', validateAuth, currentUser);

authRouter.post('/logout', validateAuth, logout);

authRouter.patch(
  '/avatars',
  validateAuth,
  upload.single('avatar'),
  updateAvatar
);

export default authRouter;
