import Contact from '../models/Contact.js';

export const listContacts = (filter = {}, setting = {}) =>
  Contact.find(filter, '-createdAt -updatedAt', setting);

export const getContactByFilter = filter => Contact.findOne(filter);

export const addContact = data => Contact.create(data);

export const updateContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);

export const removeContact = filter => Contact.findOneAndDelete(filter);

export const updateStatusContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);

export const countTotal = filter => Contact.countDocuments(filter);
