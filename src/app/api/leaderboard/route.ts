import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { LeaderboardEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get('pageSize') || '10', 10)));

        // Fetch all valid entries
        const snapshot = await adminDb.collection('leaderboard')
            .orderBy('rank', 'asc')
            .get();

        const allEntries = snapshot.docs
            .map((doc: QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            } as LeaderboardEntry))
            .filter((entry) => entry.state && entry.state.trim().length > 0);

        const totalCount = allEntries.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;

        const leaderboard = allEntries.slice(startIdx, endIdx);

        return NextResponse.json({
            data: leaderboard,
            total: totalCount,
            page,
            pageSize,
            totalPages
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
