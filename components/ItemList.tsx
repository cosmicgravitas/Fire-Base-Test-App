
import React from 'react';
import { Item, CartItem } from '../types';
import ItemCard from './ItemCard';

interface ItemListProps {
  items: Item[];
  onUpdateItem: (item: Item) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onSelectItem: (item: Item) => void;
  onAddToCart: (item: Item) => void;
  onUpdateCartQuantity: (item: Item, delta: number) => void;
  isEditMode: boolean;
  cart: CartItem[];
}

const ItemList: React.FC<ItemListProps> = ({ 
  items, 
  onSelectItem, 
  onAddToCart, 
  onUpdateCartQuantity, 
  isEditMode, 
  cart, 
  onDeleteItem,
  onToggleVisibility
}) => {
  // Diverse set of brand variants
  const variants = ['pink', 'blue', 'yellow', 'green', 'purple', 'orange', 'teal'] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 pb-20">
      {items.map((item, idx) => {
        const variant = variants[idx % variants.length];
        return (
          <ItemCard
            key={item.id}
            item={item}
            onSelectItem={onSelectItem}
            onAddToCart={onAddToCart}
            onUpdateCartQuantity={onUpdateCartQuantity}
            onToggleVisibility={onToggleVisibility}
            onDelete={onDeleteItem}
            isEditMode={isEditMode}
            cartItem={cart.find(i => i.id === item.id)}
            variant={variant}
          />
        );
      })}
    </div>
  );
};

export default ItemList;