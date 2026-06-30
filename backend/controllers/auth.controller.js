import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "default_secret_key_change_me", {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({ name, email, password: hashedPassword });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      collegeName: user.collegeName || "",
      collegeYear: user.collegeYear || "",
      monthlyBudget: user.monthlyBudget || 10000,
      categoryBudgets: user.categoryBudgets || {},
      savingsGoals: user.savingsGoals || [],
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (user.googleId && !user.password) return res.status(400).json({ message: "Please login with Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      collegeName: user.collegeName || "",
      collegeYear: user.collegeYear || "",
      monthlyBudget: user.monthlyBudget || 10000,
      categoryBudgets: user.categoryBudgets || {},
      savingsGoals: user.savingsGoals || [],
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Token from frontend GoogleLogin
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email, picture, sub: googleId } = ticket.getPayload();
    
    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      collegeName: user.collegeName || "",
      collegeYear: user.collegeYear || "",
      monthlyBudget: user.monthlyBudget || 10000,
      categoryBudgets: user.categoryBudgets || {},
      savingsGoals: user.savingsGoals || [],
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Google Authentication failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.email = req.body.email !== undefined ? req.body.email : user.email;
    user.collegeName = req.body.collegeName !== undefined ? req.body.collegeName : user.collegeName;
    user.collegeYear = req.body.collegeYear !== undefined ? req.body.collegeYear : user.collegeYear;
    user.monthlyBudget = req.body.monthlyBudget !== undefined ? Number(req.body.monthlyBudget) : user.monthlyBudget;
    user.categoryBudgets = req.body.categoryBudgets !== undefined ? req.body.categoryBudgets : user.categoryBudgets;
    user.savingsGoals = req.body.savingsGoals !== undefined ? req.body.savingsGoals : user.savingsGoals;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      collegeName: user.collegeName,
      collegeYear: user.collegeYear,
      monthlyBudget: user.monthlyBudget,
      categoryBudgets: user.categoryBudgets,
      savingsGoals: user.savingsGoals,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
