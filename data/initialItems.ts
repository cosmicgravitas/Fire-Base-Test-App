
import { Item } from '../types';

export const initialItems: Item[] = [
  {
    id: 'd9b7a7f0-a2b3-4c9f-8d7e-1f2a3b4c5d6e',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop',
    title: 'Smart Fitness Watch',
    description: 'Track your fitness goals and stay connected with this sleek smartwatch. Features a heart rate monitor, GPS, and a vibrant AMOLED display.',
    price: 249.99,
    // Fix: Added missing required property isSelected
    isSelected: true,
  },
  {
    id: 'c8a6b6e1-b3c4-5d8e-9f0a-2b3c4d5e6f7g',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop',
    title: 'Monstera Deliciosa Plant',
    description: "Bring life to your living space with this beautiful Monstera plant. Known for its iconic split leaves, it's a low-maintenance and air-purifying addition.",
    price: 55.00,
    // Fix: Added missing required property isSelected
    isSelected: true,
  },
  {
    id: 'b795a5d2-c4d5-6e9f-0a1b-3c4d5e6f7g8h',
    imageUrl: 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?q=80&w=800&auto=format&fit=crop',
    title: 'Retro Film Camera',
    description: 'Capture timeless moments with this classic 35mm film camera. A perfect blend of vintage aesthetics and reliable mechanical performance.',
    price: 180.00,
    // Fix: Added missing required property isSelected
    isSelected: true,
  },
  {
    id: 'a68494c3-d5e6-7f0a-1b2c-4d5e6f7g8h9i',
    imageUrl: 'https://images.unsplash.com/photo-1614036151695-2f94a4d7a8d5?q=80&w=800&auto=format&fit=crop',
    title: 'Soy Wax Scented Candle',
    description: 'Create a cozy atmosphere with this hand-poured soy wax candle. Infused with natural essential oils for a long-lasting, relaxing aroma.',
    price: 24.50,
    // Fix: Added missing required property isSelected
    isSelected: true,
  },
  {
    id: '957383b4-e6f7-8a1b-2c3d-5e6f7g8h9i0j',
    imageUrl: 'https://images.unsplash.com/photo-1617991310023-e18b4a456d95?q=80&w=800&auto=format&fit=crop',
    title: 'Handmade Ceramic Mugs (Set of 2)',
    description: 'Enjoy your favorite beverage in these unique, handmade ceramic mugs. Each piece is one-of-a-kind with a beautiful glaze and comfortable handle.',
    price: 42.00,
    // Fix: Added missing required property isSelected
    isSelected: true,
  },
];