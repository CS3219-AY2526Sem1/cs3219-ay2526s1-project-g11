import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail as _findUserByEmail } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";
import nodemailer from "nodemailer";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const accessToken = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );
      return res.status(200).json({
        message: "User logged in",
        data: { accessToken, ...formatUserResponse(user) },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res
      .status(200)
      .json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function handleForgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  }

  try {
    const user = await _findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "No accounts could be found" });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${process.env.PEERPREP_FRONTEND_URL}/forgot-password/${accessToken}. This link is only valid for 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Reset link sent to user email",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
