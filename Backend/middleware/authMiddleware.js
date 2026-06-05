import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Authentication system rejected credential signatures: Invalid token scope'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Resource tracing breakdown: Missing Authorization entry token wrapper'));
  }
};