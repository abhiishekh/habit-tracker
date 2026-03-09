import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/services/stripe';
import { getSubscriptionConfig } from '@/app/action';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { billingCycle } = await req.json(); // e.g. "monthly" | "yearly"

        // get pricing from DB config
        const configs = await getSubscriptionConfig();

        let price = 4.99;
        if (billingCycle === 'yearly') {
            price = parseFloat(configs.pro_yearly_price_usd) || 39.99;
        } else {
            price = parseFloat(configs.pro_monthly_price_usd) || 4.99;
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } });
        let stripeCustomerId = existingSub?.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                name: user.name || undefined,
                metadata: { userId: user.id },
            });
            stripeCustomerId = customer.id;
        }

        // Convert price to cents
        const unitAmount = Math.round(price * 100);

        const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Habit Tracker Pro (${billingCycle})`,
                            description: 'Unlock unlimited habits, unlimited AI blueprints, and premium features.',
                        },
                        unit_amount: unitAmount,
                        recurring: {
                            interval: billingCycle === 'yearly' ? 'year' : 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/billing`,
            metadata: {
                userId: user.id,
                planId: 'pro',
                billingCycle
            }
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
