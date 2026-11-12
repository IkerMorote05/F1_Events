const argon2 = require('argon2');

const hashPassword = (password) =>
  argon2.hash(password, { type: argon2.argon2id });

const verifyPassword = (password, hash) =>
  argon2.verify(hash, password);

module.exports = { hashPassword, verifyPassword };
