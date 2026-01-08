import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { TreeContribution, Donation } from '@/lib/types';

// Cache for 1 minute (60 seconds) - shorter cache for user-specific data
export const revalidate = 60;

function timestampToDate(value: any): Date {
    if (!value) return new Date();
    if (typeof value.toDate === 'function') return value.toDate();
    return value instanceof Date ? value : new Date(value);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch user's tree contributions (limit to 100 to prevent quota spikes)
        const contributionsRef = adminDb.collection('tree_contributions');
        const contributionsSnap = await contributionsRef
            .where('userId', '==', userId)
            .limit(100)
            .get();

        const contributions: TreeContribution[] = contributionsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                plantedAt: timestampToDate(data.plantedAt),
                verifiedAt: data.verifiedAt ? timestampToDate(data.verifiedAt) : undefined,
                createdAt: timestampToDate(data.createdAt),
                updatedAt: timestampToDate(data.updatedAt),
            } as TreeContribution;
        }).sort((a, b) => {
            // Sort by plantedAt descending (most recent first)
            return b.plantedAt.getTime() - a.plantedAt.getTime();
        });

        // Fetch user's donations (by email or userId)
        const userEmail = searchParams.get('userEmail');
        let donationsSnap;

        if (userEmail) {
            const donationsRef = adminDb.collection('donations');
            // Fetch without orderBy to avoid index requirement, sort in memory
            // Limit to 100 to prevent quota spikes
            donationsSnap = await donationsRef
                .where('donorEmail', '==', userEmail)
                .limit(100)
                .get();
        } else {
            // If no email, return empty donations
            donationsSnap = { docs: [], empty: true };
        }

        const donations: Donation[] = donationsSnap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                donatedAt: timestampToDate(data.donatedAt),
                createdAt: timestampToDate(data.createdAt),
            } as Donation;
        }).sort((a, b) => {
            // Sort by donatedAt descending (most recent first)
            return b.donatedAt.getTime() - a.donatedAt.getTime();
        });

        // Calculate stats
        const verifiedContributions = contributions.filter(c => c.status === 'VERIFIED');
        const pendingContributions = contributions.filter(c => c.status === 'PENDING');
        const rejectedContributions = contributions.filter(c => c.status === 'REJECTED');

        // Sum tree quantities from verified contributions
        const totalTreesPlanted = verifiedContributions.reduce((sum, c) => sum + (c.treeQuantity || 1), 0);
        const totalTreesDonated = donations.reduce((sum, d) => sum + (d.treeCount || 0), 0);
        const totalTrees = totalTreesPlanted + totalTreesDonated;

        // Calculate O2 impact: use totalLifespanO2 if available, otherwise fallback to annual calculation
        const totalO2Impact = verifiedContributions.reduce((sum, c) => {
            if (c.totalLifespanO2) {
                return sum + c.totalLifespanO2;
            }
            // Fallback: annual O2 * average lifespan
            return sum + ((c.treeQuantity || 1) * 110 * 50);
        }, 0);

        // Get district names for contributions
        const districtIds = [...new Set(contributions.map(c => c.districtId))];
        const districtsMap = new Map<string, string>();


        // Batch fetch districts to reduce quota usage
        if (districtIds.length > 0) {
            try {
                const districtRefs = districtIds.map(id => adminDb.collection('districts').doc(id));
                const districtDocs = await adminDb.getAll(...districtRefs);

                districtDocs.forEach((doc) => {
                    if (doc.exists) {
                        districtsMap.set(doc.id, doc.data()?.name || 'Unknown');
                    } else {
                        districtsMap.set(doc.id, 'Unknown');
                    }
                });
            } catch (error) {
                console.error('Error batch fetching districts:', error);
                districtIds.forEach(id => districtsMap.set(id, 'Unknown'));
            }
        }

        return NextResponse.json({
            contributions: contributions.map(c => ({
                ...c,
                districtName: districtsMap.get(c.districtId) || 'Unknown',
            })),
            donations,
            stats: {
                totalTreesPlanted,
                totalTreesDonated,
                totalTrees,
                totalO2Impact,
                verifiedContributions: verifiedContributions.length,
                pendingContributions: pendingContributions.length,
                rejectedContributions: rejectedContributions.length,
            },
        });
    } catch (error) {
        console.error('Error fetching user contributions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contributions' },
            { status: 500 }
        );
    }
}

