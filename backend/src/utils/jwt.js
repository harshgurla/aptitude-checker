import jwt from 'jwt-simple';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export const generateToken = (userId, role) => {
  const payload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.encode(payload, JWT_SECRET);
};

export const verifyToken = (token) => {
  try {
    return jwt.decode(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const getTokenExpiry = () => {
  const expiryValue = parseInt(JWT_EXPIRY);
  const expiryUnit = JWT_EXPIRY.slice(-1);
  
  const multipliers = {
    'd': 24 * 60 * 60 * 1000,
    'h': 60 * 60 * 1000,
    'm': 60 * 1000,
  };
  
  return expiryValue * (multipliers[expiryUnit] || 24 * 60 * 60 * 1000);
};
