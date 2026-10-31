import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.services.js";

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User with this email or username already exists",
                success: false,
                err: "User already exists"
            });
        }

        const user = await userModel.create({ username, email, password });

        const emailVerificationToken = jwt.sign({
            email: user.email
        }, process.env.JWT_SECRET_KEY);

        await sendEmail({
            to: email,
            subject: "Welcome to Nexora AI!",
            html: `
                <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>Nexora AI</strong>.</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The Nexora AI Team</p>
            `
        });

        res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            message: "Registration failed",
            success: false,
            err: error.message
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                err: "User not found"
            });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                err: "Incorrect password"
            });
        }

        if (!user.verified) {
            return res.status(400).json({
                message: "Please verify your email before logging in",
                success: false,
                err: "Email not verified"
            });
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username
        }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Login failed",
            success: false,
            err: error.message
        });
    }
}

export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        });
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    });
}

export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            });
        }

        user.verified = true;

        await user.save();

        return res.redirect(`${FRONTEND_URL}/login?verified=true`);
    } catch (error) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: error.message
        });
    }
}