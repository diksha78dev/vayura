
import { NgoAdapter, TransparencyScore } from '../types';

export class IshaOutreachAdapter implements NgoAdapter {
    id = 'isha-outreach';
    name = 'Isha Outreach (Cauvery Calling)';
    description = 'A massive ecological movement focusing on revitalizing the Cauvery river. It aims to support farmers to plant 2.42 billion trees through agroforestry.';
    logo = '/logos/isha.png';
    website = 'https://www.ishaoutreach.org/en/cauvery-calling';
    donationLink = 'https://www.ishaoutreach.org/en/cauvery-calling/plant-trees';

    transparency: TransparencyScore = {
        score: 85,
        level: 'Gold',
        breakdown: {
            financials: true,
            impactTracking: false, // Aggregated reports, individual tree tracking is less granular than others
            openData: true,
            communityReview: true, // Audited by third parties
        },
    };
}
