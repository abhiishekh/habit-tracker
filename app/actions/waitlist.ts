"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { Resend } from "resend";
// import { WelcomeEmail } from "@/components/emails/welcome-email";
// import React from "react";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    await prisma.waitlist.create({
      data: { email },
    });
    // console.log("Email added to waitlist successfully:", email);
    // // Send welcome email using Resend
    // const { data, error } = await resend.emails.send({
    //   from: 'onboarding@resend.dev', // Use your verified domain once live
    //   to: email,
    //   subject: 'You are on the list! 🔥',
    //   react: React.createElement(WelcomeEmail),
    // });
    // if (error) {
    //   console.error("Error sending welcome email:", error);
    // } else {
    //   console.log("Welcome email sent successfully to:", email, data);
    // }

    // This refreshes the page data without a reload
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    // P2002 is the Prisma error code for unique constraint (email already exists)
    if (e.code === 'P2002') {
      return { error: "You're already on the list!" };
    }
    console.error("Error adding email to waitlist:", e);
    return { error: "Something went wrong. Please try again." };
  }
}