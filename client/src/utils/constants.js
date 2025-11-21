// Application Constants

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  USER: 'user',
};

// Product Sizes
export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Product Genders
export const PRODUCT_GENDERS = ['Male', 'Female', 'Unisex'];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'Something went wrong',
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://www.facebook.com/profile.php?id=61555373810216&mibextid=kFxxJD',
  YOUTUBE: 'https://youtube.com/@femmecurehelpingher?si=YrDQTn26Aiyq5ZNh',
  INSTAGRAM: 'https://www.instagram.com/meenusahuji1987?igsh=NzVlazl3bnFjcDFy',
};

// Contact Information
export const CONTACT_INFO = {
  PHONE_1: '+91 7879523232',
  PHONE_2: '+91 9575227672',
  EMAIL: 'meenusahuji1987@gmail.com',
  ADDRESS: 'Bhopal, Madhya Pradesh',
};

// Navigation Links
export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Shop', path: '/shop' },
  { name: 'Contact', path: '/contact' },
];

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

export default {
  USER_ROLES,
  PRODUCT_SIZES,
  PRODUCT_GENDERS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  API_MESSAGES,
  PAGINATION,
  STORAGE_KEYS,
  SOCIAL_LINKS,
  CONTACT_INFO,
  NAV_LINKS,
  REGEX,
};
