const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    console.log('Received Token:', token); // Log the Authorization header

    if (!token) {
        console.error('Authorization header is missing');
        return res.status(401).send('No token, authorization denied');
    }

    try {
        const tokenParts = token.split(' '); // Split the header
        console.log('Token Parts:', tokenParts);

        if (tokenParts.length < 2 || tokenParts[0] !== 'Bearer') {
            console.error('Invalid token format');
            return res.status(401).send('Invalid token format');
        }

        const bearerToken = tokenParts[1];
        console.log('Bearer Token:', bearerToken);

        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET); // Verify token
        console.log('Decoded Token:', decoded);

        req.user = decoded; // Attach user to request
        next();
    } catch (err) {
        console.error('Token Validation Error:', err.message);
        res.status(401).send('Invalid token');
    }
};

module.exports = { authMiddleware };
