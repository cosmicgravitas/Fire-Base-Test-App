
export interface Item {
  id: string;
  imageUrl: string; // Primary image
  imageUrls?: string[]; // Additional images for carousel
  title: string;
  description: string;
  price: number;
  isSelected: boolean; // Controls public visibility
}

export interface CartItem extends Item {
  quantity: number;
}
