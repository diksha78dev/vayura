
import { NgoAdapter, TransparencyScore } from '../types';

export class SankalpaTaruAdapter implements NgoAdapter {
    id = 'sankalpa-taru';
    name = 'SankalpaTaru';
    description = 'One of India\'s largest IT-enabled NGOs, leveraging technology like GPS tagging and blockchain to ensure transparency in tree planting initiatives across the country.';
    logo = '/logos/sankalpa-taru.png';
    website = 'https://sankalpataru.org';
    donationLink = 'https://sankalpataru.org/plant-trees/';

    transparency: TransparencyScore = {
        score: 90,
        level: 'Gold',
        breakdown: {
            financials: true,
            impactTracking: true, // Strong focus on GPS tagging
            openData: false, // Less API access for public
            communityReview: true,
        },
    };
}
