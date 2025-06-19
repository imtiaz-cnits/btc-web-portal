import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

const authMiddleware = async (req, res, next) => {
    console.log('=== Request Debug Start ===');
    console.log('All headers:', JSON.stringify(req.headers, null, 2));
    console.log('Cookies:', JSON.stringify(req.cookies, null, 2)); // Log cookies
    console.log('Host:', req.hostname);
    console.log('Path:', req.path);
    console.log('Method:', req.method);

    let token;
    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader);

    // Check Authorization header
    if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
        token = authHeader.split(' ')[1];
        console.log('Token from Authorization header:', token);
    } else if (req.cookies && req.cookies.token) {
        // Fallback to cookie token
        token = req.cookies.token;
        console.log('Token from cookie:', token);
    } else {
        console.log('No Authorization header or cookie token found.');
        return res.status(401).json({ success: false, message: 'No authorization header or cookie token. Please log in again.' });
    }

    if (!token) {
        console.log('No valid token extracted.');
        return res.status(401).json({ success: false, message: 'No token provided. Please log in again.' });
    }

    try {
        console.log('Verifying token:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        if (decoded.id) {
            req.user = await UserModel.findById(decoded.id).select('-password'); // Use req.user for consistency
            if (!req.user) {
                console.log('User not found for ID:', decoded.id);
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            console.log('User attached:', req.user._id);
        } else {
            console.log('No ID in decoded token.');
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }

    console.log('=== Request Debug End ===');
};

export default authMiddleware;