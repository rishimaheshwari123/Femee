import * as Yup from 'yup';
import { REGEX } from './constants';

// Common validation schemas

// Email validation
export const emailSchema = Yup.string()
  .email('Invalid email address')
  .required('Email is required');

// Password validation
export const passwordSchema = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(
    REGEX.PASSWORD,
    'Password must contain uppercase, lowercase, number and special character'
  )
  .required('Password is required');

// Phone validation
export const phoneSchema = Yup.string()
  .matches(REGEX.PHONE, 'Invalid phone number')
  .required('Phone number is required');

// Name validation
export const nameSchema = Yup.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .required('Name is required');

// Login Form Schema
export const loginSchema = Yup.object({
  email: emailSchema,
  password: Yup.string().required('Password is required'),
});

// Register Form Schema
export const registerSchema = Yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// Forgot Password Schema
export const forgotPasswordSchema = Yup.object({
  email: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = Yup.object({
  password: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// Contact Form Schema
export const contactSchema = Yup.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must not exceed 500 characters')
    .required('Message is required'),
});

// Address Form Schema
export const addressSchema = Yup.object({
  fullName: nameSchema,
  phone: phoneSchema,
  address: Yup.string()
    .min(10, 'Address must be at least 10 characters')
    .required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  pincode: Yup.string()
    .matches(/^[1-9][0-9]{5}$/, 'Invalid pincode')
    .required('Pincode is required'),
});

// Product Form Schema
export const productSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  price: Yup.number()
    .positive('Price must be positive')
    .required('Price is required'),
  highPrice: Yup.number()
    .positive('High price must be positive')
    .min(Yup.ref('price'), 'High price must be greater than or equal to price')
    .required('High price is required'),
  sizes: Yup.string().required('Sizes are required'),
  category: Yup.string().required('Category is required'),
});

// Review Form Schema
export const reviewSchema = Yup.object({
  rating: Yup.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .required('Rating is required'),
  comment: Yup.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must not exceed 500 characters')
    .required('Comment is required'),
});

export default {
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  contactSchema,
  addressSchema,
  productSchema,
  reviewSchema,
};
