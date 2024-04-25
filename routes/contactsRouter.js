import express from 'express';
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} from '../controllers/contactsControllers.js';
import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from '../schemas/contactsSchemas.js';
import validateBody from '../helpers/validateBody.js';
import validId from '../helpers/validId.js';
import validateAuth from '../helpers/validateAuth.js';

const contactsRouter = express.Router();

contactsRouter.use(validateAuth);

contactsRouter.get('/', getAllContacts);

contactsRouter.get('/:id', validId, getOneContact);

contactsRouter.delete('/:id', validId, deleteContact);

contactsRouter.post('/', validateBody(createContactSchema), createContact);

contactsRouter.put(
  '/:id',
  validId,
  validateBody(updateContactSchema),
  updateContact
);

contactsRouter.patch(
  '/:id/favorite',
  validId,
  validateBody(updateFavoriteSchema),
  updateStatusContact
);

export default contactsRouter;
