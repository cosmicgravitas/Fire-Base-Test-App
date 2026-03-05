
import React, { useState, useEffect, useRef } from 'react';
import { Item, CartItem } from '../types';
import { resizeAndCompressImage } from '../utils/fileUtils';
import { PlusIcon, TrashIcon } from './IconComponents';

interface ItemModalProps {
  item: Item;
  onClose: () => void;
  isEditMode: boolean;
  onUpdateItem: (item: Item) => Promise<void>;
  onAddToCart: () => void;
  onUpdateCartQuantity: (item: Item, delta: number) => void;
  onOpenCart: () => void;
  cartItem?: CartItem;
}

const ItemModal: React.FC<ItemModalProps> = ({ item, onClose, isEditMode, onUpdateItem, onAddToCart, onUpdateCartQuantity, onOpenCart, cartItem }) => {
  const [editedItem, setEditedItem] = useState<Item>(item);
  const [isSaving, setIsSaving] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const allImages = [editedItem.imageUrl, ...(editedItem.imageUrls || [])];
  const hasMultiple = allImages.length > 1;

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateItem(editedItem);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const { base64, mimeType } = await resizeAndCompressImage(e.target.files[0]);
        const newUrl = `data:${mimeType};base64,${base64}`;
        setEditedItem(prev => ({
          ...prev,
          imageUrls: [...(prev.imageUrls || []), newUrl]
        }));
      } catch (err) {
        console.error("Image processing failed", err);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (indexToRemove === 0) {
      // If we remove the primary image, promote the first secondary if it exists
      if (editedItem.imageUrls && editedItem.imageUrls.length > 0) {
        const [first, ...rest] = editedItem.imageUrls;
        setEditedItem(prev => ({
          ...prev,
          imageUrl: first,
          imageUrls: rest
        }));
      } else {
        alert("Cannot remove the only image.");
      }
    } else {
      // Index in allImages is index 0 primary, 1 secondary... 
      // So index in imageUrls is indexToRemove - 1
      const newSecondary = [...(editedItem.imageUrls || [])];
      newSecondary.splice(indexToRemove - 1, 1);
      setEditedItem(prev => ({
        ...prev,
        imageUrls: newSecondary
      }));
    }
  };

  const toggleVisibility = () => {
    setEditedItem(prev => ({ ...prev, isSelected: !prev.isSelected }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const index = Math.round(target.scrollLeft / target.offsetWidth);
    setCurrentIdx(index);
  };

  const isInCart = !!cartItem;

  return (
    <div className="fixed inset-0 z-50 bg-white animate-fade-in flex flex-col overflow-hidden">
      <header className="px-6 py-6 flex justify-between items-center shrink-0">
        <button onClick={onClose} className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center active:scale-90 transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {isEditMode && (
          <div className="flex items-center gap-3">
             <button 
              onClick={toggleVisibility}
              className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border ${
                editedItem.isSelected 
                  ? 'bg-green-50 text-green-600 border-green-100' 
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${editedItem.isSelected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {editedItem.isSelected ? 'Visible' : 'Hidden'}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-brand-black text-white rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </header>

      <div className="flex-grow px-8 flex flex-col items-center overflow-y-auto no-scrollbar pb-10">
        <div className="text-center mb-6 w-full max-w-sm">
          {isEditMode ? (
            <input 
              className="text-3xl font-black tracking-tight leading-none mb-2 w-full text-center border-b-2 border-brand-yellow focus:outline-none"
              value={editedItem.title}
              onChange={(e) => setEditedItem({...editedItem, title: e.target.value})}
            />
          ) : (
            <h2 className="text-3xl font-black tracking-tight leading-none mb-2">{item.title}</h2>
          )}
          
          <p className="text-brand-text-secondary font-bold text-xs uppercase tracking-widest mb-4">Load Badhige Marketplace</p>
          
          <div className="px-4 py-3 bg-brand-bg/50 rounded-2xl w-full">
            {isEditMode ? (
              <textarea 
                className="text-sm text-brand-black leading-relaxed font-medium w-full bg-transparent border-none focus:outline-none resize-none h-24 text-center"
                value={editedItem.description}
                onChange={(e) => setEditedItem({...editedItem, description: e.target.value})}
              />
            ) : (
              <p className="text-sm text-brand-black leading-relaxed font-medium">
                {item.description}
              </p>
            )}
          </div>
        </div>

        <div className="relative w-full max-w-[280px] sm:max-w-[320px] my-4 sm:my-8 shrink-0 group">
          <div className="absolute inset-0 bg-brand-bg rounded-5xl -rotate-6 transform scale-110 opacity-50" />
          
          <div 
            className="relative z-10 flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-[280px] sm:h-[320px] items-center"
            onScroll={handleScroll}
          >
            {allImages.map((url, i) => (
              <div key={i} className="min-w-full snap-center flex flex-col items-center justify-center relative px-4">
                <img 
                  src={url} 
                  className="w-full h-auto max-h-full drop-shadow-3xl transform transition-transform duration-500" 
                  alt={`${editedItem.title} view ${i + 1}`}
                />
                {isEditMode && (
                   <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg active:scale-75 transition-transform"
                   >
                     <TrashIcon className="w-3 h-3" />
                   </button>
                )}
              </div>
            ))}
          </div>

          {hasMultiple && (
            <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {allImages.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIdx ? 'bg-brand-black w-4' : 'bg-brand-black/20'}`} 
                />
              ))}
            </div>
          )}

          {isEditMode && (
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20">
              <input type="file" ref={fileInputRef} onChange={handleAddImage} className="hidden" accept="image/*" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 mt-4 shrink-0">
          <div className="bg-brand-yellow rounded-full px-10 py-4 flex items-center gap-6 shadow-xl">
             <div className="flex items-center gap-2">
                {!isEditMode && isInCart ? (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onUpdateCartQuantity(item, -1)}
                      className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center font-black"
                    >
                      -
                    </button>
                    <span className="text-2xl font-black min-w-[30px] text-center">{cartItem.quantity}</span>
                    <button 
                      onClick={() => onUpdateCartQuantity(item, 1)}
                      className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center font-black"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-2xl font-black">01</span>
                )}
             </div>
            <div className="h-6 w-[2px] bg-brand-black/20" />
            
            {isEditMode ? (
              <div className="flex items-center font-black text-2xl tracking-tighter">
                <span className="mr-1">Rf</span>
                <input 
                  type="number"
                  className="w-20 bg-transparent border-b border-brand-black/20 focus:outline-none"
                  value={editedItem.price}
                  onChange={(e) => setEditedItem({...editedItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            ) : (
              <span className="text-2xl font-black tracking-tighter">Rf {item.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      {!isEditMode && (
        <footer className="p-8 flex items-center gap-4 bg-white/80 backdrop-blur-md shrink-0">
          {!isInCart ? (
            <button 
              onClick={onAddToCart}
              className="flex-grow h-16 rounded-3xl font-black text-sm bg-brand-black text-white transition-all shadow-lg active:scale-95 uppercase tracking-widest"
            >
              Add to cart
            </button>
          ) : (
            <button 
              onClick={() => onUpdateCartQuantity(item, -cartItem.quantity)}
              className="flex-grow h-16 rounded-3xl font-black text-sm bg-brand-yellow text-brand-black transition-all shadow-lg active:scale-95 uppercase tracking-widest"
            >
              Remove from cart
            </button>
          )}
          <button 
            onClick={onOpenCart}
            className="w-16 h-16 bg-brand-yellow text-brand-black rounded-3xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
        </footer>
      )}
    </div>
  );
};

export default ItemModal;
