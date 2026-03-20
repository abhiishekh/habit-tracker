import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  try {
    const forest = await prisma.progressTree.findFirst({
      where: { 
        userId: (session.user as any).id,
        type: 'forest' 
      }
    });

    return NextResponse.json(forest?.trees || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forest' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  try {
    const { trees } = await request.json();
    
    const userId = (session.user as any).id;

    const forest = await prisma.progressTree.findFirst({
      where: { userId, type: 'forest' }
    });

    if (forest) {
      await prisma.progressTree.update({
        where: { id: forest.id },
        data: { trees }
      });
    } else {
      await prisma.progressTree.create({
        data: {
          userId,
          type: 'forest',
          trees,
          growthLevel: trees.length
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update forest' }, { status: 500 });
  }
}
