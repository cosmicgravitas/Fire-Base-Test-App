
import React, { useState } from 'react';
import { Item, CartItem } from '../types';
import { TrashIcon, EyeIcon, EyeOffIcon, PencilIcon } from './IconComponents';

interface ItemCardProps {
  item: Item;
  onSelectItem: (item: Item) => void;
  onAddToCart: (item: Item) => void;
  onUpdateCartQuantity: (item: Item, delta: number) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  isEditMode: boolean;
  cartItem?: CartItem;
  variant: 'pink' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange' | 'teal';
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  onSelectItem, 
  onAddToCart, 
  onUpdateCartQuantity, 
  onToggleVisibility,
  onDelete, 
  isEditMode, 
  cartItem, 
  variant 
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const isHidden = !item.isSelected;
  
  const allImages = [item.imageUrl, ...(item.imageUrls || [])];
  const hasMultiple = allImages.length > 1;

  const getBgColor = () => {
    switch (variant) {
      case 'pink': return 'bg-brand-pink';
      case 'blue': return 'bg-brand-blue';
      case 'yellow': return 'bg-brand-yellow';
      case 'green': return 'bg-brand-green';
      case 'purple': return 'bg-brand-purple';
      case 'orange': return 'bg-brand-orange';
      case 'teal': return 'bg-brand-teal';
      default: return 'bg-brand-pink';
    }
  };

  const bgColor = getBgColor();
  const isInCart = !!cartItem;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    const width = target.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentIdx(index);
  };

  return (
    <div 
      className={`relative rounded-4xl sm:rounded-5xl overflow-hidden p-4 sm:p-6 shadow-sm transition-all active:scale-95 cursor-pointer ${bgColor} ${isHidden && isEditMode ? 'opacity-40 grayscale-[0.6] ring-1 ring-black/5' : ''}`}
      onClick={() => onSelectItem(item)}
    >
      <div className="flex flex-col h-full min-h-[220px] sm:min-h-[320px]">
        <div className="flex justify-between items-start z-10">
          <div className="max-w-full flex flex-col gap-1">
            <h3 className="text-sm sm:text-xl font-extrabold text-brand-black leading-tight line-clamp-2">
              {item.title}
            </h3>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1.5 shrink-0">
               <button 
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(item.id); }}
                className={`p-1.5 sm:p-2 rounded-full transition-all shadow-sm ${isHidden ? 'bg-brand-black text-brand-yellow' : 'bg-white/60 text-brand-black hover:bg-white'}`}
                title={isHidden ? "Show item to customers" : "Hide item from customers"}
              >
                {isHidden ? (
                  <EyeOffIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="bg-white/40 p-1.5 sm:p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors shrink-0"
              >
                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-grow relative mt-2 sm:mt-4 pointer-events-none">
          {/* We use pointer-events-none on the container but allow the scrolling div to receive them if needed, 
              or simply rely on the parent div click to open the modal. For a card, clicking the image should open details. */}
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full items-center pointer-events-auto"
            onScroll={handleScroll}
          >
            {allImages.map((url, i) => (
              <div key={i} className="min-w-full snap-center flex justify-center p-2 sm:p-4 h-full">
                <img 
                  src={url} 
                  alt={`${item.title} view ${i + 1}`} 
                  className="w-full h-[120px] sm:h-[180px] object-contain drop-shadow-2xl"
                />
              </div>
            ))}
          </div>
          
          {hasMultiple && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-2">
              {allImages.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 h-1 rounded-full transition-all ${i === currentIdx ? 'bg-brand-black w-3' : 'bg-brand-black/20'}`} 
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto z-10">
          <span className="font-extrabold text-brand-black text-xs sm:text-sm">
            Rf {item.price.toFixed(2)}
          </span>
          
          <div className="flex items-center gap-1">
            {isEditMode ? (
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-brand-black/5 text-brand-black/40">
                  <PencilIcon className="w-4 h-4" />
               </div>
            ) : isInCart ? (
              <div className="flex items-center bg-brand-black rounded-full p-0.5 gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateCartQuantity(item, -1); }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="text-white font-black text-xs sm:text-sm min-w-[12px] text-center">{cartItem.quantity}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateCartQuantity(item, 1); }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-brand-yellow text-brand-black hover:bg-yellow-300 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-brand-black text-white hover:scale-110 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 12h12M12 6v12"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isEditMode && isHidden && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-brand-black text-brand-yellow px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest opacity-80 shadow-xl">Hidden from Public</span>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
