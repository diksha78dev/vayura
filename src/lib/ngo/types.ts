
export interface TransparencyScore {
    score: number; // 0-100
    level: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
    breakdown: {
        financials: boolean; // Public audits available?
        impactTracking: boolean; // GPS coordinates/photos provided?
        openData: boolean; // API or downloadable reports?
        communityReview: boolean; // Third-party verification?
    };
}

export interface NgoAdapter {
    id: string; // e.g., 'tree-nation'
    name: string;
    description: string;
    logo: string; // Path or URL
    website: string;
    donationLink: string; // Direct link to plant/donate
    transparency: TransparencyScore;

    // Method to fetch live stats (optional for v1, future proofing)
    getLiveStats?(): Promise<{ treesPlanted: number }>;
}
