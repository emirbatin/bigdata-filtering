import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { generateAvatar } from "../utils/generateAvatar.js";

// Geçici şifre üretme fonksiyonu
const generateTempPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

//Register
export const register = async (req, res) => {
  try {
    const { fullName, username, gender, permission } = req.body;

    // Admin kontrolü
    if (req.user.permission !== "admin") {
      return res.status(403).json({ message: "Only admin can create users" });
    }

    if (!fullName || !username || !gender || !permission) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ message: "Username already exists, try a different one" });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = await User.create({
      fullName,
      username,
      password: hashedPassword,
      profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
      gender,
      permission,
    });

    return res.status(201).json({
      message: "User created successfully.",
      success: true,
      tempPassword,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });
    }
    const tokenData = {
      userId: user._id,
      permission: user.permission,
    };

    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      profilePhoto: user.profilePhoto,
      permission: user.permission,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

//Kullanıcı ID'sine göre kullanıcı alma
export const getOtherUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );
    return res.status(200).json(otherUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//Kullanıcı ID'sine göre kullanıcı alma
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Kullanıcıyı inaktif yapma fonksiyonu
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    user.status = "inactive";
    await user.save();

    return res.status(200).json({ message: "Kullanıcı pasif hale getirildi." });
  } catch (error) {
    console.error("Kullanıcı pasif yapma hatası:", error);
    return res
      .status(500)
      .json({ message: "Kullanıcı pasif hale getirilemedi." });
  }
};

// Kullanıcıyı aktif yapma fonksiyonu
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    user.status = "active";
    await user.save();

    return res.status(200).json({ message: "Kullanıcı aktif hale getirildi." });
  } catch (error) {
    console.error("Kullanıcı aktif yapma hatası:", error);
    return res
      .status(500)
      .json({ message: "Kullanıcı aktif hale getirilemedi." });
  }
};

// Kullanıcı Oluşturma
export const createUser = async (req, res) => {
  try {
    const { fullName, username, gender, permission } = req.body;

    if (req.user.permission !== "admin") {
      return res.status(403).json({ message: "Only admin can create users" });
    }

    if (!fullName || !username || !gender || !permission) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username already exists, try a different one" });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const profilePhoto = generateAvatar(username);

    // Yeni kullanıcı oluştur
    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      profilePhoto,
      gender,
      permission,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      success: true,
      user: {
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        profilePhoto: newUser.profilePhoto,
        permission: newUser.permission,
      },
      tempPassword,
    });
  } catch (error) {
    console.error("User creation error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//Kullanıcı Editleme
export const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, username, gender, permission } = req.body;

    if (req.user.permission !== "admin") {
      return res.status(403).json({ message: "Only admin can edit users" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Username already exists, try a different one" });
      }
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.gender = gender || user.gender;
    user.permission = permission || user.permission;

    if (username !== user.username) {
      user.profilePhoto = generateAvatar(username);
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
        permission: user.permission,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("User update error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const checkToken = async (req, res) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check if the user still exists in the database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ valid: false, message: "User not found" });
    }

    // Check if the user is still active
    if (user.status !== "active") {
      return res
        .status(401)
        .json({ valid: false, message: "User account is not active" });
    }

    // If everything is okay, send back the user data (excluding sensitive information)
    return res.status(200).json({
      valid: true,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
        permission: user.permission,
      },
    });
  } catch (error) {
    console.error("Token check error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ valid: false, message: "Token has expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }

    return res
      .status(500)
      .json({ valid: false, message: "Internal server error" });
  }
};

// Function to refresh the token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tokenData = {
      userId: user._id,
      permission: user.permission,
    };

    const newToken = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
