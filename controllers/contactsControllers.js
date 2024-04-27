import * as contactsService from '../services/contactsServices.js';
import HttpError from '../helpers/HttpError.js';
import path from 'path';
import fs from 'fs/promises';

const avatarPath = path.resolve('public', 'avatars');

export const getAllContacts = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20 } = req.query;
  console.log(req.query);
  const skip = (page - 1) * limit;
  try {
    const result = await contactsService.listContacts(
      { owner },
      { skip, limit }
    );
    const total = await contactsService.countTotal({ owner });
    res.json({ result, total });
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  try {
    const result = await contactsService.getContactByFilter({ owner, _id: id });
    if (!result) {
      throw HttpError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarPath, filename);
  console.log(newPath);
  await fs.rename(oldPath, newPath);
  try {
    const result = await contactsService.addContact({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  try {
    const result = await contactsService.removeContact({ owner, _id: id });
    if (!result) {
      throw HttpError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  try {
    if (Object.keys(req.body).length === 0) {
      throw HttpError(400, 'Body must have at least one field');
    }
    const result = await contactsService.updateContact(
      { owner, _id: id },
      req.body
    );
    if (!result) {
      throw HttpError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  try {
    const result = await contactsService.updateStatusContact(
      { owner, _id: id },
      req.body
    );
    if (!result) {
      throw HttpError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};
