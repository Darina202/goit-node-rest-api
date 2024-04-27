import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import HttpError from '../helpers/HttpError.js';
import { singUp, findUser, updateUser } from '../services/usersServices.js';
import 'dotenv/config';
import gravatar from 'gravatar';
import path from 'path';
import fs from 'fs/promises';
import Jimp from 'jimp';
import { nanoid } from 'nanoid';
import sendEmail from '../helpers/sendEmail.js';

const { SECRET_KEY, PROJECT_URL } = process.env;
const avatarPath = path.resolve('public', 'avatars');

export const singup = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userEmail = await findUser({ email });
    if (userEmail) {
      throw HttpError(409, 'Email in use');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarUrl = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await singUp({
      ...req.body,
      password: hashPassword,
      avatarURL: avatarUrl,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: 'Nodemailer test',
      // text: 'Привіт. Ми тестуємо надсилання листів!',
      html: ` <a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationToken}">
        Click verify email
      </a>`,
    };
    await sendEmail(verifyEmail);

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await findUser({ verificationToken });
  if (!user) {
    throw HttpError(404, 'User not found');
  }
  await updateUser({ _id: user._id }, { verify: true, verificationToken: '' });
  res.json({
    message: 'Verification successful',
  });
};

export const resendVerify = async (req, res) => {
  const { email } = req.body;
  const userEmail = await findUser({ email });
  if (!userEmail) {
    throw HttpError(404, 'User not found');
  }
  if (userEmail.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }
  const verifyEmail = {
    to: email,
    subject: 'Nodemailer test',
    html: ` <a target="_blank" href="${PROJECT_URL}/api/users/verify/${userEmail.verificationToken}">
        Click verify email
      </a>`,
  };
  await sendEmail(verifyEmail);
  res.json({
    message: 'Verification email sent',
  });
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userEmail = await findUser({ email });
    if (!userEmail) {
      throw HttpError(401, 'Email or password is wrong');
    }
    if (!userEmail.verify) {
      throw HttpError(401, 'Email not verify');
    }
    const passwordCompare = await bcrypt.compare(password, userEmail.password);
    if (!passwordCompare) {
      throw HttpError(401, 'Email or password is wrong');
    }
    const token = jwt.sign({ id: userEmail._id }, SECRET_KEY, {
      expiresIn: '24h',
    });
    await updateUser({ _id: userEmail._id }, { token });

    res.json({
      token,
      user: { email, subscription: userEmail.subscription },
    });
  } catch (error) {
    next(error);
  }
};

export const currentUser = async (req, res) => {
  const { subscription, email } = req.user;
  res.json({
    email,
    subscription,
  });
};

export const logout = async (req, res) => {
  const { _id } = req.user;
  await updateUser({ _id }, { token: '' });
  res.status(204).send();
};

export const updateAvatar = async (req, res, next) => {
  if (!req.file) {
    throw HttpError(400, 'File not found');
  }

  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarPath, filename);
  console.log(newPath);
  await fs.rename(oldPath, newPath);
  const avatar = path.join('avatars', filename);

  const image = await Jimp.read(newPath);
  await image.resize(250, 250).writeAsync(newPath);

  await updateUser({ _id }, { avatarURL: avatar });

  res.status(200).json({
    avatarURL: avatar,
  });
};
