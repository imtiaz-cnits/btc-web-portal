import UserModel from "../models/UserModel.js";

// Function to get user details by ID
export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;

        // Validate userId
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Return user data excluding sensitive information
        res.json({
            success: true,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

