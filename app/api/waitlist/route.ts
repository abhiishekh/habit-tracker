// src/app/api/waitlist/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Received request to join waitlist in route.ts");
    const { email } = await req.json();
    const entry = await prisma.waitlist.create({
      data: { email },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }
}