'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWhatsAppReminderTwilio } from '@/services/whatsapp';

export async function saveUserPhone(phoneNumber: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  return await prisma.user.update({
    where: { email: session.user.email },
    data: {
      phone: phoneNumber,
      whatsappEnabled: true,
    },
  });
}

export async function saveUserApiKeys(data: {
  wakatimeApiKey?: string;
  githubApiKey?: string;
  linkedinApiKey?: string;
  twitterApiKey?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  return await prisma.user.update({
    where: { email: session.user.email },
    data: {
      wakatimeApiKey: data.wakatimeApiKey,
      githubApiKey: data.githubApiKey,
      linkedinApiKey: data.linkedinApiKey,
      twitterApiKey: data.twitterApiKey,
    },
  });
}

export async function updateUserProfile(data: { name?: string; email?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  return await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: data.name,
      email: data.email,
    },
  });
}

export async function toggleWhatsapp(enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  return await prisma.user.update({
    where: { email: session.user.email },
    data: {
      whatsappEnabled: enabled,
    },
  });
}

export async function sendTestWhatsapp() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { phone: true }
  });

  if (!user?.phone) throw new Error("Phone number not set");

  return await sendWhatsAppReminderTwilio(user.phone, "Test Message from Habit Tracker!");
}

export async function getGlobalWhatsappStatus() {
  const config = await prisma.systemConfig.findUnique({
    where: { key: 'whatsapp_global_enabled' }
  });
  return config ? config.value === 'true' : true; // Default to true
}

export async function toggleGlobalWhatsapp(enabled: boolean) {
  const session = await getServerSession(authOptions);
  const adminEmail = "abhisheaurya@gmail.com";

  if (session?.user?.email !== adminEmail) {
    throw new Error("Unauthorized: Only admin can toggle global settings");
  }

  return await prisma.systemConfig.upsert({
    where: { key: 'whatsapp_global_enabled' },
    update: { value: String(enabled) },
    create: { key: 'whatsapp_global_enabled', value: String(enabled) }
  });
}