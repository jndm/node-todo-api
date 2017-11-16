const {User} = require('./../models/user.js');

var authenticate = async (req, res, next) => {
    const token = req.header('x-auth');

    try {
        const user = await User.findByToken(token);
        if(!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send();
    }
};

module.exports = {authenticate};