const BadRequestError = require("../errors/bad-request");


const validateImageFile = async (file, message) => {
    if (!file) {
        throw new BadRequestError(message);
    }
};

module.exports = { validateImageFile };