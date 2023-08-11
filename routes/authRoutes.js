import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { stripe } from "../util/stripe.js";

const router = express.Router();

const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array().map((error) => {
      return {
        msg: error.msg,
      };
    });
    return res.json({ errors, data: null });
  } else {
    const user = await mongoose.model("User").findOne({ email });
    console.log(user);
    if (user) {
      return res.json({
        errors: [
          {
            msg: "Account already exists",
          },
        ],
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await stripe.customers.create(
      {
        email,
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      stripeCustomerId: customer.id,
    });

    return res.json({
      errors: [],
      data: {
        name: name,
        email: email,
        stripeCustomerId: customer.id,
        id: newUser._id,
      },
    });
  }
};

const logIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      errors: [
        {
          msg: "invalid credentials",
        },
      ],
      data: null,
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.json({
      errors: [
        {
          msg: "invalid credentials",
        },
      ],
      data: null,
    });
  }

  return res.json({
    errors: [],
    data: {
      id: user._id,
      name: user.name,
      email: email,
      stripeCustomerId: user.id,
    },
  });
};

router.post(
  "/signup",
  body("name").trim().isLength({ min: 1 }).withMessage("invalid name"),
  body("email").trim().isEmail().withMessage("invalid email"),
  body("password").isLength({ min: 5 }).withMessage("invalid password"),
  signUp
);

router.post(
  "/login",
  body("email").trim().isEmail().withMessage("invalid email"),
  body("password").isLength({ min: 5 }).withMessage("invalid password"),
  logIn
);

export default router;
