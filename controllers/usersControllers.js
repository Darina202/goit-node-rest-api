import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import HttpError from '../helpers/HttpError.js';
import { singUp, findUser, updateUser } from '../services/usersServices.js';
import 'dotenv/config';

const { SECRET_KEY } = process.env;

export const singup = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userEmail = await findUser({ email });
    if (userEmail) {
      throw HttpError(409, 'Email in use');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await singUp({ ...req.body, password: hashPassword });

    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userEmail = await findUser({ email });
    if (!userEmail) {
      throw HttpError(401, 'Email or password is wrong');
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
  // res.json({
  //   message: 'Signout success',
  // });
};
