const { createHash } = require('node:crypto');
const jwt = require('jsonwebtoken');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe estar configurado con al menos 32 caracteres');
  }
  return secret;
};

const signToken = (userId, role) =>
  jwt.sign(
    { role },
    getSecret(),
    {
      algorithm: 'HS256',
      subject: userId.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    }
  );

const verifyToken = (token) =>
  jwt.verify(token, getSecret(), { algorithms: ['HS256'] });

const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex');

module.exports = { signToken, verifyToken, hashToken };
