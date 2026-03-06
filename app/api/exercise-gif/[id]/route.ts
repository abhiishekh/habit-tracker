import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) return new NextResponse("Missing ID", { status: 400 });

        const apiKey = process.env.EXERCISE_DB_API_KEY;
        const url = `https://exercisedb.p.rapidapi.com/image?exerciseId=${id}&resolution=360`;

        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': apiKey || '',
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch GIF: ${response.status}`, { status: response.status });
        }

        const blob = await response.blob();

        return new NextResponse(blob, {
            headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600'
            }
        });
    } catch (error) {
        console.error("GIF Proxy Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
