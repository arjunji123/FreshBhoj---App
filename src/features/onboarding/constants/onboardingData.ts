import type { ImageSourcePropType } from 'react-native';
import type { OnboardingItem } from '../components/OnboardingSlide';

const photo = (source: ImageSourcePropType) => source;

/** Full-bleed real food photography, one per slide (assets/images/photos). */
export const onboardingData: OnboardingItem[] = [
    {
        id: '1',
        eyebrow: 'Verified home kitchens',
        title: 'Real food from real kitchens.',
        description: 'Every kitchen is verified in person. Fresh, home-style meals only: no junk, no shortcuts.',
        photo: photo(require('../../../../assets/images/photos/bowl.jpg')),
        ctaLabel: 'Next',
    },
    {
        id: '2',
        eyebrow: 'Bhoj Feed',
        title: 'Watch it cook, then order.',
        description: 'Scroll real reels from real kitchens, see your meal being made and order it in one tap.',
        photo: photo(require('../../../../assets/images/photos/thali.jpg')),
        ctaLabel: 'Next',
    },
    {
        id: '3',
        eyebrow: 'Meal plans',
        title: 'Never wonder what to eat.',
        description: 'Fixed breakfast, lunch or dinner plans. Know what is cooking daily, and swap dishes anytime.',
        photo: photo(require('../../../../assets/images/photos/curry.jpg')),
        ctaLabel: 'Get Started',
    },
];
