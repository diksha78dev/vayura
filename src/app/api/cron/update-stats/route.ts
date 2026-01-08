import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Cron job endpoint to update aggregated stats
 * Runs hourly via Vercel Cron
 * 
 * This reduces Firestore quota usage by pre-computing stats
 * instead of calculating on every request
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Allow requests from Vercel Cron (has special header) or with correct secret
        const isVercelCron = request.headers.get('x-vercel-cron') === '1';
        const hasValidSecret = authHeader === `Bearer ${cronSecret}`;

        // Also check URL param for manual testing
        const { searchParams } = new URL(request.url);
        const secretParam = searchParams.get('secret');
        const hasValidParam = secretParam === cronSecret;

        if (!isVercelCron && !hasValidSecret && !hasValidParam) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Running aggregated stats update...');

        // Get total districts count using count() aggregation query
        const districtsCountQuery = await adminDb.collection('districts').count().get();
        const totalDistricts = districtsCountQuery.data().count;

        // Get total trees and oxygen from leaderboard
        const leaderboardSnapshot = await adminDb.collection('leaderboard').get();

        let totalTrees = 0;
        let totalOxygen = 0;

        leaderboardSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            totalTrees += data.totalTrees || 0;
            // Use totalO2Supply if available, otherwise fallback to oxygenOffset
            totalOxygen += data.totalO2Supply || data.oxygenOffset || 0;
        });

        // Write aggregated stats to Firestore
        const statsRef = adminDb.collection('aggregated_stats').doc('global');
        await statsRef.set({
            totalDistricts,
            totalTrees,
            totalOxygen,
            lastUpdated: new Date(),
        });

        console.log('Aggregated stats updated successfully:', {
            totalDistricts,
            totalTrees,
            totalOxygen,
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalDistricts,
                totalTrees,
                totalOxygen,
                lastUpdated: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Error updating aggregated stats:', error);
        return NextResponse.json(
            { error: 'Failed to update stats' },
            { status: 500 }
        );
    }
}
