import type { OnboardingItem } from '../components/OnboardingSlide';

export const onboardingData: OnboardingItem[] = [
    {
        id: '1',
        heroTitle: 'Only real food, no junk.',
        title: 'Healthy food,',
        subtitle: 'always.',
        description: 'Every kitchen is verified in person — fresh, home-style meals only. No junk, no shortcuts, no exceptions.',
        image: require('@assets/images/banana_leaf_thali.png'),
        variant: 'plate',
        ctaLabel: 'Next',
    },
    {
        id: '2',
        heroTitle: 'Watch it get made.',
        title: 'Watch it cook,',
        subtitle: 'then order.',
        description: 'Scroll real kitchen reels in the Food Feed, see your meal being prepared, and order it in one tap.',
        image: require('@assets/images/reel_image.png'),
        variant: 'reel',
        ctaLabel: 'Next',
    },
    {
        id: '3',
        heroTitle: 'Never wonder what to eat.',
        title: 'Subscribe &',
        subtitle: 'never worry.',
        description: 'Fixed breakfast, lunch or dinner plans — know what\'s cooking daily, pay once, and swap meals anytime.',
        image: require('@assets/images/thali_group.png'),
        variant: 'thali',
        ctaLabel: 'Get Started',
    },
];
