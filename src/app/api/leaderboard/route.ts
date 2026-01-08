import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { LeaderboardEntry } from '@/lib/types';

// Cache for 5 minutes (300 seconds) to reduce Firestore quota usage
export const revalidate = 300;

function timestampToDate(value: any): Date {
    if (!value) return new Date();
    if (typeof value.toDate === 'function') return value.toDate();
    return value instanceof Date ? value : new Date(value);
}

// Oxygen calculation constants (same as Python service)
const HUMAN_O2_CONSUMPTION_LITERS_PER_DAY = 550;
const LITERS_TO_KG_O2_CONVERSION = 1.429 / 1000;
const DAYS_PER_YEAR = 365;
const BASE_TREE_O2_SUPPLY_KG_PER_YEAR = 110;

function calculateAQIPenaltyFactor(aqi: number): number {
    if (aqi <= 50) return 1.0;
    if (aqi <= 100) return 1.05;
    if (aqi <= 150) return 1.15;
    if (aqi <= 200) return 1.30;
    if (aqi <= 300) return 1.50;
    return 1.75;
}

function calculateSoilDegradationFactor(soilQuality: number): number {
    if (soilQuality >= 80) return 1.0;
    if (soilQuality >= 60) return 1.1;
    if (soilQuality >= 40) return 1.3;
    return 1.6;
}

function calculateDisasterLossFactor(disasterFreq: number): number {
    if (disasterFreq === 0) return 1.0;
    if (disasterFreq <= 2) return 1.05;
    if (disasterFreq <= 5) return 1.15;
    if (disasterFreq <= 10) return 1.30;
    return 1.5;
}

function calculateSoilTreeAdjustment(soilQuality: number): number {
    // Linear scaling: 100% soil quality = 100% O2 production
    // 50% soil quality = 70% O2 production (minimum viable)
    return Math.max(0.7, soilQuality / 100);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = parseInt(searchParams.get('limit') || '35', 10);

        // Fetch all districts to aggregate by state
        const districtsSnapshot = await adminDb.collection('districts').get();
        const districts = districtsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as any));

        // Fetch leaderboard entries
        const leaderboardSnapshot = await adminDb.collection('leaderboard').get();
        const leaderboardMap = new Map();
        leaderboardSnapshot.docs.forEach(doc => {
            const data = doc.data();
            leaderboardMap.set(data.state, {
                id: doc.id,
                totalTrees: data.totalTrees || 0,
                totalTreesPlanted: data.totalTreesPlanted || 0,
                totalTreesDonated: data.totalTreesDonated || 0,
                existingForestTrees: data.existingForestTrees || 0,
                existingForestO2Production: data.existingForestO2Production || 0,
                forestCoverKm2: data.forestCoverKm2 || 0,
            });
        });

        // Aggregate districts by state
        const stateAggregates = new Map<string, {
            population: number;
            weightedAQI: number;
            weightedSoil: number;
            weightedDisasters: number;
            totalTrees: number;
            totalTreesPlanted: number;
            totalTreesDonated: number;
            existingForestTrees: number;
        }>();

        for (const district of districts) {
            const state = district.state;
            if (!state) continue;

            const current = stateAggregates.get(state) || {
                population: 0,
                weightedAQI: 0,
                weightedSoil: 0,
                weightedDisasters: 0,
                totalTrees: 0,
                totalTreesPlanted: 0,
                totalTreesDonated: 0,
                existingForestTrees: 0,
            };

            const pop = district.population || 0;
            current.population += pop;

            // Default environmental values for states without recent data
            const avgAQI = 100; // Moderate default
            const avgSoil = 65; // Fair default
            const avgDisasters = 2; // Low-moderate default

            current.weightedAQI += avgAQI * pop;
            current.weightedSoil += avgSoil * pop;
            current.weightedDisasters += avgDisasters * pop;

            stateAggregates.set(state, current);
        }

        // Add tree data from leaderboard (including existing forest trees)
        leaderboardMap.forEach((data, state) => {
            const current = stateAggregates.get(state);
            if (current) {
                const existingForestTrees = data.existingForestTrees || 0;
                const userPlanted = data.totalTreesPlanted || 0;
                const userDonated = data.totalTreesDonated || 0;

                // Total = Existing forest + User planted + User donated
                current.totalTrees = existingForestTrees + userPlanted + userDonated;
                current.totalTreesPlanted = userPlanted;
                current.totalTreesDonated = userDonated;
                current.existingForestTrees = existingForestTrees;
            }
        });

        // Calculate O2 demand and supply for each state
        const stateMetrics: any[] = [];

        stateAggregates.forEach((data, state) => {
            if (data.population === 0) return;

            // Calculate weighted averages
            const avgAQI = data.weightedAQI / data.population;
            const avgSoil = data.weightedSoil / data.population;
            const avgDisasters = data.weightedDisasters / data.population;

            // Calculate O2 NEEDED (same formula as districts)
            const humanO2LitersPerYear = data.population * HUMAN_O2_CONSUMPTION_LITERS_PER_DAY * DAYS_PER_YEAR;
            const humanO2KgPerYear = humanO2LitersPerYear * LITERS_TO_KG_O2_CONVERSION;

            const aqiFactor = calculateAQIPenaltyFactor(avgAQI);
            const soilFactor = calculateSoilDegradationFactor(avgSoil);
            const disasterFactor = calculateDisasterLossFactor(avgDisasters);
            const totalPenalty = aqiFactor * soilFactor * disasterFactor;

            const o2Needed = humanO2KgPerYear * totalPenalty;

            // Calculate O2 SUPPLY (from all trees: existing + user-planted + user-donated)
            const soilAdjustment = calculateSoilTreeAdjustment(avgSoil);
            const adjustedTreeSupply = BASE_TREE_O2_SUPPLY_KG_PER_YEAR * soilAdjustment;
            const o2Supply = data.totalTrees * adjustedTreeSupply;

            // Also calculate O2 from existing forests separately
            const existingForestO2 = (data.existingForestTrees || 0) * adjustedTreeSupply;

            // Calculate percentage met
            // Cap at 100% - 100% means state is meeting its oxygen needs
            // States exceeding 100% are considered fully self-sufficient
            const rawPercentage = o2Needed > 0 ? (o2Supply / o2Needed) * 100 : 0;
            const percentageMet = Math.min(Math.max(rawPercentage, 0), 100);

            // Get leaderboard ID
            const leaderboardEntry = leaderboardMap.get(state);

            stateMetrics.push({
                id: leaderboardEntry?.id || state,
                state,
                population: data.population,
                totalTreesPlanted: data.totalTreesPlanted,
                totalTreesDonated: data.totalTreesDonated,
                existingForestTrees: data.existingForestTrees || 0,
                totalTrees: data.totalTrees,
                o2Needed: Math.round(o2Needed),
                o2Supply: Math.round(o2Supply),
                existingForestO2: Math.round(existingForestO2),
                percentageMet: Math.round(percentageMet * 100) / 100,
                avgAQI: Math.round(avgAQI),
                avgSoilQuality: Math.round(avgSoil),
            });
        });

        // Sort by percentage met (descending) - states meeting more of their O2 needs rank higher
        stateMetrics.sort((a, b) => {
            if (b.percentageMet !== a.percentageMet) {
                return b.percentageMet - a.percentageMet;
            }
            // Tiebreaker: total trees
            if (b.totalTrees !== a.totalTrees) {
                return b.totalTrees - a.totalTrees;
            }
            // Final tiebreaker: alphabetical
            return a.state.localeCompare(b.state);
        });

        // Assign ranks
        const ranked = stateMetrics.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));

        // Update ranks in Firestore asynchronously
        Promise.all(
            ranked.slice(0, limitParam).map((entry) => {
                if (!leaderboardMap.has(entry.state)) return Promise.resolve();
                const entryRef = adminDb.collection('leaderboard').doc(entry.id);
                return entryRef.update({
                    rank: entry.rank,
                    oxygenOffset: entry.o2Supply,
                    lastUpdated: new Date(),
                }).catch((err) =>
                    console.error('Error updating rank', err)
                );
            })
        ).catch(err => console.error('Error updating ranks:', err));

        return NextResponse.json(ranked.slice(0, limitParam), {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
