const createTokenUser = (user) => {
    return { name: user.name, userId: user._id, user_type: user.user_type };
};
  
  module.exports = {createTokenUser};