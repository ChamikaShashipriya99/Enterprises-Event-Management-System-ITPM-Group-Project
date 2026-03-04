const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d',
        }
    );
};

module.exports = generateToken;
