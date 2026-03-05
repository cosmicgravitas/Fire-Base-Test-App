import React, { useState, useRef, useEffect } from 'react';
import { Item, CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (item: Item, delta: number) => void;
  onCheckout: () => void;
  isCheckoutLoading: boolean;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity, 
  onCheckout, 
  isCheckoutLoading 
}) => {
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const cartItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleStart = () => {
    if (items.length === 0 || isCheckoutLoading) return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const width = rect.width - 56; // Adjusted for handle size
    const x = Math.max(0, Math.min(clientX - rect.left - 28, width));
    setSliderPos(x);
    
    // Check for completion
    if (x >= width * 0.95) {
      setIsDragging(false);
      setSliderPos(width);
      onCheckout();
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap back if not reached end
    const rect = sliderRef.current?.getBoundingClientRect();
    if (rect && sliderPos < (rect.width - 56) * 0.95) {
      setSliderPos(0);
    }
  };

  // Global event listeners for dragging outside the component
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, sliderPos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[90px] transition-all duration-700" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-black/60 backdrop-blur-[50px] border border-white/10 text-white rounded-t-5xl p-8 pt-4 animate-slide-up shadow-[0_-40px_100px_rgba(0,0,0,0.4)] ring-1 ring-white/5 mb-0">
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Your Bag</h2>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Review your selections</p>
          </div>
          <div className="bg-brand-yellow text-brand-black px-4 py-1.5 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest shadow-xl">
            {cartItemsCount}
          </div>
        </div>

        <div className="space-y-5 mb-10 max-h-[280px] overflow-y-auto no-scrollbar pr-1">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 group">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-2 shrink-0 shadow-sm border border-white/10 group-hover:scale-105 transition-transform">
                <img src={item.imageUrl} className="w-full h-full object-contain drop-shadow-lg" alt="" />
              </div>
              <div className="flex-grow">
                <h4 className="font-extrabold text-xs line-clamp-1 text-white">{item.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/5">
                    <button 
                      onClick={() => onUpdateQuantity(item, -1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 transition-colors"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <span className="text-[10px] font-black w-6 text-center text-white">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item, 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 transition-colors"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="block font-black text-xs whitespace-nowrap text-white">Rf {(item.price * item.quantity).toFixed(2)}</span>
                <button 
                  onClick={() => onRemove(item.id)} 
                  className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-500/10"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 opacity-20">
              <svg className="w-12 h-12 mb-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <p className="font-black text-[10px] uppercase tracking-widest text-white">Bag Empty</p>
            </div>
          )}
        </div>

        <div className="bg-brand-yellow/90 backdrop-blur-2xl rounded-4xl p-6 mb-8 text-brand-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Total</p>
              <p className="text-3xl font-black tracking-tighter">Rf {total.toFixed(2)}</p>
            </div>
            <div className="flex -space-x-4">
              {items.slice(0, 3).map(i => (
                <div key={i.id} className="relative group/thumb">
                  <div className="w-12 h-12 rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-md shadow-2xl overflow-hidden p-1.5 transition-transform group-hover/thumb:-translate-y-2">
                    <img src={i.imageUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Slide to Pay Interaction */}
        <div 
          ref={sliderRef}
          className={`relative w-full h-16 bg-white/10 border border-white/10 rounded-full overflow-hidden transition-opacity ${items.length === 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
        >
          {isCheckoutLoading ? (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="ml-3 font-black text-[9px] uppercase tracking-[0.2em] text-white/50">Processing Order</span>
             </div>
          ) : (
            <>
              {/* Background Fill Overlay */}
              <div 
                className="absolute inset-0 bg-brand-yellow/20" 
                style={{ width: `${sliderPos + 56}px` }} 
              />
              
              {/* Guide Text */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-opacity"
                style={{ opacity: Math.max(0, 1 - (sliderPos / 100)) }}
              >
                <span className="font-black text-[9px] uppercase tracking-[0.3em] text-white/40">Slide to Pay</span>
              </div>

              {/* Slider Handle */}
              <div 
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                className={`absolute top-1 left-1 w-14 h-14 bg-brand-yellow rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${isDragging ? 'scale-95' : 'scale-100'}`}
                style={{ transform: `translateX(${sliderPos}px)` }}
              >
                <div className="flex items-center justify-center animate-pulse">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" className="text-brand-black">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;