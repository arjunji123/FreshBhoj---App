import type {FoodCardItem, StoryItem, CategoryDataItem} from './home.types';

// ── Category Pills ───────────────────────────────────────────────
export const CATEGORIES = [
  'Fast Food',
  'Curry',
  'Snacks',
  'Biryani',
  'Desserts',
  'Thali',
  'Chinese',
  'South Indian',
];

// ── Kitchen Stories ──────────────────────────────────────────────
export const STORIES: StoryItem[] = [
  {id: '1', name: 'Royal Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'},
  {id: '2', name: 'Roadside', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'},
  {id: '3', name: 'newfood', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'},
  {id: '4', name: 'Homestyle', image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400'},
];

// ── Category Carousel ───────────────────────────────────────────
const IMG_SNACKS = require('@assets/images/home_category/snacks.png');
const IMG_THALI = require('@assets/images/home_category/thali.png');
const IMG_SWEETS = require('@assets/images/home_category/sweets.png');

export const CATEGORY_DATA: CategoryDataItem[] = [
  {id: '0', name: 'Fast Food', image: IMG_SNACKS},
  {id: '1', name: 'Curry', image: IMG_THALI},
  {id: '2', name: 'Snacks', image: IMG_SNACKS},
  {id: '3', name: 'Biryani', image: IMG_THALI},
  {id: '4', name: 'Desserts', image: IMG_SWEETS},
  {id: '5', name: 'Thali', image: IMG_THALI},
  {id: '6', name: 'Chinese', image: IMG_SNACKS},
  {id: '7', name: 'South Indian', image: IMG_SWEETS},
];

// ── Trending Near You ───────────────────────────────────────────
export const TRENDING_DATA: FoodCardItem[] = [
  {
    id: '1',
    kitchenId: 'healthy-bites',
    name: 'Super Keto Bowl Special',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    rating: 4.8,
    restaurant: 'Healthy Bites',
    distance: '2.5km',
    price: 299,
    isFavorite: true,
  },
  {
    id: '2',
    kitchenId: 'healthy-bites',
    name: 'Super Keto Bowl Special',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    rating: 4.8,
    restaurant: 'Healthy Bites',
    distance: '2.5km',
    price: 299,
    isFavorite: false,
  },
  {
    id: '3',
    kitchenId: 'healthy-bites',
    name: 'Super Keto Bowl Special',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    rating: 4.8,
    restaurant: 'Healthy Bites',
    distance: '2.5km',
    price: 299,
    isFavorite: false,
  },
  {
    id: '4',
    kitchenId: 'healthy-bites',
    name: 'Super Keto Bowl Special',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    rating: 4.8,
    restaurant: 'Healthy Bites',
    distance: '2.5km',
    price: 299,
    isFavorite: false,
  },
    {
    id: '5',
    kitchenId: 'fit-feast',
    name: 'Grilled Chicken Salad Bowl',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    rating: 4.6,
    restaurant: 'Fit Feast',
    distance: '1.8km',
    price: 249,
    isFavorite: false,
  },
  {
    id: '6',
    kitchenId: 'green-delight',
    name: 'Vegan Power Bowl',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    rating: 4.7,
    restaurant: 'Green Delight',
    distance: '3.2km',
    price: 279,
    isFavorite: true,
  },
  {
    id: '7',
    kitchenId: 'spice-route',
    name: 'Paneer Tikka Bowl',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    rating: 4.5,
    restaurant: 'Spice Route',
    distance: '2.1km',
    price: 199,
    isFavorite: false,
  },
  {
    id: '8',
    kitchenId: 'urban-greens',
    name: 'Quinoa Veg Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    rating: 4.4,
    restaurant: 'Urban Greens',
    distance: '4.0km',
    price: 299,
    isFavorite: true,
  },
  {
    id: '9',
    kitchenId: 'taco-hub',
    name: 'Mexican Burrito Bowl',
    image: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400',
    rating: 4.6,
    restaurant: 'Taco Hub',
    distance: '3.5km',
    price: 319,
    isFavorite: false,
  },
  {
    id: '10',
    kitchenId: 'healthy-bites',
    name: 'Classic Caesar Salad',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400',
    rating: 4.3,
    restaurant: 'Healthy Bites',
    distance: '2.9km',
    price: 229,
    isFavorite: false,
  },

  // --- Pattern continues with variation ---

  {
    id: '11',
    kitchenId: 'keto-kitchen',
    name: 'Avocado Keto Bowl',
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400',
    rating: 4.9,
    restaurant: 'Keto Kitchen',
    distance: '1.5km',
    price: 349,
    isFavorite: true,
  },
  {
    id: '12',
    kitchenId: 'olive-tree',
    name: 'Mediterranean Bowl',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    rating: 4.5,
    restaurant: 'Olive Tree',
    distance: '2.7km',
    price: 299,
    isFavorite: false,
  },
  // ...Array.from({ length: 92 }, (_, i) => ({
  //   id: `${13 + i}`,
  //   name: [
  //     'Protein Power Bowl',
  //     'Healthy Veg Mix Bowl',
  //     'Spicy Chicken Bowl',
  //     'Tofu Salad Bowl',
  //     'Keto Delight Bowl',
  //     'Brown Rice Nutrition Bowl',
  //     'High Fiber Veg Bowl',
  //     'Classic Diet Bowl'
  //   ][i % 8],
  //   image: `https://images.unsplash.com/photo-${1540000000000 + i}?w=400`,
  //   rating: +(4 + Math.random()).toFixed(1),
  //   restaurant: [
  //     'Healthy Bites',
  //     'Fit Feast',
  //     'Urban Greens',
  //     'Green Delight',
  //     'Spice Route',
  //     'Keto Kitchen'
  //   ][i % 6],
  //   distance: `${(1 + Math.random() * 4).toFixed(1)}km`,
  //   price: Math.floor(180 + Math.random() * 200),
  //   isFavorite: Math.random() > 0.7,
  // })),
];

// ── Home Header ─────────────────────────────────────────────────
export const TOP_ROW_HEIGHT = 40;
export const SCROLL_THRESHOLD = 80;
