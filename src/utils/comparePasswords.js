const bcrypt = require('bcryptjs');

const comparePasswords = (plainText, hash) => {
    return bcrypt.compare(plainText, hash)
}

module.exports = {comparePasswords};