import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
  return { accessToken, refreshToken };
};

// store the refresh token in redis
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refreshToken:${userId}`,
    refreshToken,
    "EX",
    60 * 60 * 24 * 7 // 7 days
  );
};

// set the cookies for the access token and refresh token
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XXS attacks by preventing access to the cookie from javascript
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent CSRF attacks by preventing the cookie from being sent to other sites
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// signup route

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    // authenticate the user
    const { accessToken, refreshToken } = await generateTokens(user._id);
    // store the refresh token in redis
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);
    // send the access token and refresh token to the client
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error in signup", error.message);

    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = await generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);
      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("Error in login", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // user automatically sends the refresh token in the cookie
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    await redis.del(`refreshToken:${decoded.id}`);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout", error.message);

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
