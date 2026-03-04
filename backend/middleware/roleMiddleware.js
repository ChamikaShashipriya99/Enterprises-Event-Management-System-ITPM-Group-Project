const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            return next();
        } else {
            return res.status(403).json({ message: `Access denied: role ${req.user ? req.user.role : 'none'} not authorized` });
        }
    };
};

module.exports = { authorizeRoles };
