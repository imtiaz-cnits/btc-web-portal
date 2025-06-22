import express from "express";
import { isAuthenticated, login, logout, register, resetPassword, sendResetPasswordOTP, sendVerificationOTP, verifyEmail } from "../controllers/AuthController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import { getUserData } from "../controllers/UserController.js";
import { createNotice, deleteNotice, updateNotice, viewNotice } from "../controllers/NoticesController.js";
import upload from "../config/MulterConfig.js";

const apiRouter = express.Router();

// Authentication routes
apiRouter.post("/register", register);
apiRouter.post("/login", login);
apiRouter.post("/logout", logout);
apiRouter.post("/send-verification-otp", AuthMiddleware, sendVerificationOTP);
apiRouter.post("/verify-email", AuthMiddleware, verifyEmail);
apiRouter.post("/is-auth", isAuthenticated);
apiRouter.post("/send-reset-otp", sendResetPasswordOTP);
apiRouter.post("/reset-password", resetPassword);

// User routes
apiRouter.get("/user-data", AuthMiddleware, getUserData);

// Notice CRUD routes
apiRouter.post("/add-notice", AuthMiddleware, upload.single("file"), createNotice);
apiRouter.get("/notices", viewNotice);
apiRouter.put("/notices/:id", AuthMiddleware, upload.single("file"), (req, res, next) => {
    const { id } = req.params;
    if (!id || id === ':' || !/^[a-f\d]{24}$/i.test(id)) {
        console.error(`Invalid notice ID: ${id}`);
        return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }
    updateNotice(req, res, next);
});
apiRouter.delete("/notices/:id", AuthMiddleware, (req, res, next) => {
    const { id } = req.params;
    if (!id || id === ':' || !/^[a-f\d]{24}$/i.test(id)) {
        console.error(`Invalid notice ID: ${id}`);
        return res.status(400).json({ success: false, message: 'Invalid notice ID' });
    }
    deleteNotice(req, res, next);
});

export default apiRouter;