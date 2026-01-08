
import { NgoAdapter, TransparencyScore } from '../types';

export class TreeNationAdapter implements NgoAdapter {
    id = 'tree-nation';
    name = 'Tree-Nation';
    description = 'A global platform connecting citizens and companies with tree planting projects around the world. Known for their "Net Zero" mission and detailed project validation.';
    logo = '/logos/tree-nation.png'; // We'll need to handle logos later, using placeholder or text for now if image missing
    website = 'https://tree-nation.com';
    donationLink = 'https://tree-nation.com/plant/myself';

    transparency: TransparencyScore = {
        score: 95,
        level: 'Platinum',
        breakdown: {
            financials: true,
            impactTracking: true, // They provide a certificate and specific project details
            openData: true, // Good user dashboard stats
            communityReview: true,
        },
    };
}
