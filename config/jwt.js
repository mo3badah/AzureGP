const jwt = require('jsonwebtoken');
const { JWT_PRIVATE_KEY, AUTH_MAX_AGE } = process.env;

const generateToken = async (user) => {
    return jwt.sign(
        {
            SSN: user.SSN,
            fullName: user.fullName,
            job_title: user.job_title
        },
        JWT_PRIVATE_KEY,
        { expiresIn: '2h' }
    );
};
const userToken = async (user) => {
    return jwt.sign(
        {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            job_title: 'user'
        },
        JWT_PRIVATE_KEY,
        { expiresIn: '2h' }
    );
};

const refreshAuthTokenCookie = async (req, res, next) => {
    //1. get the existing token from cookie
    //2. no ? next()
    //3. verify token and extract user data
    //4. create a new token
    //5. add it to cookie
    //6. (both have 15 minutes expiry time, starting now)

    const token = req.cookies.token;
    if (!token) {
        console.log('no token cookie to refresh');
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_PRIVATE_KEY);
        const newToken = await generateToken(decoded);
        res.cookie('token', newToken, {
            httpOnly: false,
            maxAge: AUTH_MAX_AGE,
        });
        next();
    } catch(error) {
        return res.status(401).json({error: 'Invalid token'});
    }

}

module.exports = { generateToken, userToken, refreshAuthTokenCookie };