const transformJoiMsg = (message) => {
    const result = message.split(`\"`).join('');
    return result;
};

module.exports = {transformJoiMsg};