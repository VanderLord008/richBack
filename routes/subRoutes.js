import express from "express";
import User from "../models/userModel.js";
import Stripe from "stripe";

const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const getPrices = async (req, res) => {
  const prices = await stripe.prices.list({
    apiKey: process.env.STRIPE_SECRET_KEY,
  });
  return res.json(prices);
};

const createStripeSession = async (req, res) => {
  console.log(req.body);
  console.log("made it");
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: req.body.id,
          quantity: 1,
        },
      ],
      success_url: "https://venerable-macaron-0c4f19.netlify.app/",
      cancel_url: "https://venerable-macaron-0c4f19.netlify.app/plans",
      customer: user.stripeCustomerId,
    },
    {
      apiKey: process.env.STRIPE_SECRET_KEY,
    }
  );

  return res.json({ url: session.url });
};

const getSubs = async (req, res) => {
  console.log(req.query.email);
  const user = await User.findOne({ email: req.query.email });
  console.log(user);

  const subscriptions = await stripe.subscriptions.list(
    {
      customer: user.stripeCustomerId,
      status: "all",
      expand: ["data.default_payment_method"],
    },
    {
      apiKey: process.env.STRIPE_SECRET_KEY,
    }
  );
  if (!subscriptions.data.length) return res.json([]);
  res.json(subscriptions);
};

const cancelSub = async (req, res) => {
  console.log(req.body);
  const subId = req.body.id;
  const customerId = req.body.customer;
  // const customerId = req.body.customer;
  // const planId = req.body.plan.id;
  // const consumer = await stripe.customers.retrieve(customerId, {
  //   apiKey: process.env.STRIPE_SECRET_KEY,
  // });
  // console.log("consumer");
  // console.log(consumer);
  // const [subscription] = stripeCustomer.subscription.data;
  // console.log("subs");
  // console.log(subscription);
  await stripe.subscriptions.del(subId, {
    apiKey: process.env.STRIPE_SECRET_KEY,
  });
  //const subscription = await stripe.subscriptions.cancel(req.body.plan.id);
  res.json();
};

router.get("/plans", getPrices);
router.post("/session", createStripeSession);
router.post("/cancel", cancelSub);
router.get("/subscriptions", getSubs);
export default router;
