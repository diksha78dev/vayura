
import { NgoAdapter, TransparencyScore } from '../types';

export class OneTreePlantedAdapter implements NgoAdapter {
    id = 'one-tree-planted';
    name = 'One Tree Planted';
    description = 'A non-profit organization focused on global reforestation. They plant one tree for every dollar donated, working with partners across 47+ countries.';
    logo = '/logos/otp.png';
    website = 'https://onetreeplanted.org';
    donationLink = 'https://onetreeplanted.org/products/plant-trees';

    transparency: TransparencyScore = {
        score: 92,
        level: 'Platinum',
        breakdown: {
            financials: true, // Annual reports openly available
            impactTracking: true, // Detailed impact reports per project
            openData: true,
            communityReview: true,
        },
    };
}
