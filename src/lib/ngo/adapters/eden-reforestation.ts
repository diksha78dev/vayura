
import { NgoAdapter, TransparencyScore } from '../types';

export class EdenReforestationAdapter implements NgoAdapter {
    id = 'eden-reforestation';
    name = 'Eden Reforestation Projects';
    description = 'Works with local communities to restore forests on a massive scale, creating jobs and protecting ecosystems in developing nations. Known for their "Employ to Plant" methodology.';
    logo = '/logos/eden.png';
    website = 'https://www.edenprojects.org';
    donationLink = 'https://www.edenprojects.org/donate';

    transparency: TransparencyScore = {
        score: 88,
        level: 'Gold',
        breakdown: {
            financials: true,
            impactTracking: true, // Monthly reports from sites
            openData: false, // Less granular open data than OTP
            communityReview: true,
        },
    };
}
