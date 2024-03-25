import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.post('save', (req, res, next) => {
  error.status = 400;
  next();
});

contactSchema.pre('findOneAndUpdate', function (next) {
  this.options.new = true;
  this.options.runValidators = true;
  next();
});

contactSchema.post('findOneAndUpdate', (req, res, next) => {
  error.status = 400;
  next();
});

const Contact = model('contact', contactSchema);

export default Contact;
