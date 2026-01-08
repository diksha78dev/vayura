
import { NgoAdapter, TransparencyScore } from '../types';

export class DonateKartAdapter implements NgoAdapter {
    id = 'donatekart';
    name = 'DonateKart';
    description = 'An Indian transparent crowdfunding platform where you can donate products (like saplings) instead of money, ensuring your donation reaches the beneficiary directly.';
    logo = '/logos/donatekart.png';
    website = 'https://www.donatekart.com';
    donationLink = 'https://www.donatekart.com/explore/environment';

    transparency: TransparencyScore = {
        score: 94,
        level: 'Platinum',
        breakdown: {
            financials: true,
            impactTracking: true, // Product updates sent to donors
            openData: true, // Very transparent process
            communityReview: true,
        },
    };
}
