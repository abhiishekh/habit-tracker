import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/services/razorpay';
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

        let price = 299;
        if (billingCycle === 'yearly') {
            price = parseFloat(configs.pro_yearly_price_inr) || 2499;
        } else {
            price = parseFloat(configs.pro_monthly_price_inr) || 299;
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Since razorpay accepts orders rather than pre-built checkout sessions like stripe:
        // Convert price to paise
        const amount = Math.round(price * 100);

        const options = {
            amount,
            currency: "INR",
            receipt: `rcpt_${user.id.substring(0, 10)}_${Date.now()}`,
            notes: {
                userId: user.id,
                billingCycle: billingCycle || 'monthly'
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            userId: user.id
        });
    } catch (error: any) {
        console.error('Razorpay checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
