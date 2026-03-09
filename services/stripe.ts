import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-ignore - Let stripe default to whatever it supports locally, or fallback to older version if types mismatched.
    apiVersion: '2023-10-16',
    appInfo: {
        name: 'Habit Tracker App',
        version: '0.1.0',
    },
});
