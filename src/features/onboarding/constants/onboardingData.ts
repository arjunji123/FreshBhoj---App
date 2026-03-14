import type { OnboardingItem } from '../components/OnboardingSlide';

export const onboardingData: OnboardingItem[] = [
    {
        id: '1',
        heroTitle: 'Your hunger, delivered.',
        title: 'Food discovery,',
        subtitle: "reimagined.",
        description: 'Find dishes, kitchens and reels curated just for you with our AI-powered taste profile.',
        image: require('@assets/images/banana_leaf_thali.png'),
        variant: 'plate',
        ctaLabel: 'Next',
    },
    {
        id: '2',
        heroTitle: 'Watch short food reels.',
        title: 'Watch. Like. Order.',
        description: 'Explore food reels from nearby kitchens and see your food being prepared.',
        image: require('@assets/images/reel_image.png'),
        variant: 'reel',
        ctaLabel: 'Next',
    },
    {
        id: '3',
        heroTitle: '',
        title: 'Daily meals, simplified.',
        description: 'Subscribe to trusted kitchens near you.',
        image: require('@assets/images/thali_group.png'),
        variant: 'thali',
        ctaLabel: 'Get Started',
    },
];
