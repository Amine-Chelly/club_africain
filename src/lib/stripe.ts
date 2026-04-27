import Stripe from "stripe";

// Disable stripe instance if key is missing, avoiding crashes on boot
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    })
  : null;
