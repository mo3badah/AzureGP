const jwt = require('jsonwebtoken');
const { JWT_PRIVATE_KEY } = process.env;

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({error: 'Unauthorized'});
    };

    try {
        const decoded = jwt.verify(token, JWT_PRIVATE_KEY);

        req.user = decoded;

        next();
    } catch(error) {
        return res.status(401).json({error: 'Invalid token'})
    }
};

const authorizeUser = (roles) => {
    return (req, res, next) => {
        const { job_title } = req.user;

        if (!roles.includes(job_title)) {
            return res.status(403).json({error: 'Forbidden'});
        }

        next();
    }
};

module.exports = { authenticateUser, authorizeUser };