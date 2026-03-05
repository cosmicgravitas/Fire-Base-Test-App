import React, { useState, useMemo } from 'react';
import { Item } from '../types';

interface WelcomeOverlayProps {
  onDismiss: () => void;
  items: Item[];
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onDismiss, items }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 600); 
  };

  // Select up to 12 items for a richer background
  const previewItems = useMemo(() => {
    const pool = items.length > 0 ? items : [];
    return pool.slice(0, 12);
  }, [items]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Deep Blur Layer */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[120px]" />
      
      {/* Drifting Items Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ maskImage: 'radial-gradient(circle, black 40%, transparent 90%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 90%)' }}>
        {previewItems.map((item, idx) => {
          // Assign one of 4 directional paths based on index
          const pathType = (idx % 4) + 1;
          const duration = 20 + (idx * 3);
          const delay = idx * -4; // Negative delay so they are already moving on load
          const blur = idx % 3 === 0 ? 'blur-[2px]' : '';
          
          return (
            <div
              key={item.id}
              className={`absolute opacity-20 transition-opacity duration-1000 ${blur}`}
              style={{
                animationName: `float-path-${pathType}`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
                left: `${(idx * 15) % 80}%`,
                top: `${(idx * 20) % 80}%`,
              }}
            >
              <div className="bg-white/40 p-3 rounded-3xl backdrop-blur-md border border-white/40 shadow-xl flex flex-col items-center gap-2 transform scale-75 sm:scale-100">
                 <img src={item.imageUrl} className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-2xl" alt="" />
                 <span className="text-[7px] font-black uppercase tracking-widest text-brand-black/40 truncate max-w-[80px]">{item.title}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 animate-fade-in">
        <div className="w-20 h-20 bg-brand-yellow rounded-3xl flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(254,240,138,0.5)] animate-bounce">
          <span className="font-black text-3xl text-brand-black">L</span>
        </div>
        
        <div className="space-y-2 mb-12">
          <h1 className="text-5xl sm:text-7xl font-black text-brand-black tracking-tighter leading-[0.9] uppercase">
            Experience <br/>
            <span className="text-brand-text-secondary">Load Badhige</span>
          </h1>
          <p className="text-[10px] font-black text-brand-black/30 uppercase tracking-[0.4em]">
            Curated Essentials • Premium Lifestyle
          </p>
        </div>
        
        <button 
          onClick={handleStart}
          className="group relative px-14 py-6 bg-brand-black text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:shadow-[0_40px_70px_rgba(0,0,0,0.4)] transition-all active:scale-95"
        >
          <span className="relative z-10">Enter Marketplace</span>
          <div className="absolute inset-0 bg-brand-yellow rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-center opacity-10" />
        </button>

        <div className="mt-16 flex gap-1.5 justify-center opacity-30">
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse [animation-delay:200ms]" />
            <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse [animation-delay:400ms]" />
        </div>
      </div>

      <style>{`
        /* Path 1: Top-Left to Bottom-Right */
        @keyframes float-path-1 {
          0% { transform: translate(-20vw, -20vh) rotate(0deg) scale(0.8); opacity: 0; }
          15% { opacity: 0.25; }
          85% { opacity: 0.25; }
          100% { transform: translate(120vw, 120vh) rotate(20deg) scale(1.1); opacity: 0; }
        }
        /* Path 2: Bottom-Right to Top-Left */
        @keyframes float-path-2 {
          0% { transform: translate(120vw, 120vh) rotate(15deg) scale(1); opacity: 0; }
          15% { opacity: 0.2; }
          85% { opacity: 0.2; }
          100% { transform: translate(-20vw, -20vh) rotate(-10deg) scale(0.7); opacity: 0; }
        }
        /* Path 3: Bottom-Left to Top-Right */
        @keyframes float-path-3 {
          0% { transform: translate(-20vw, 120vh) rotate(-20deg) scale(0.9); opacity: 0; }
          15% { opacity: 0.25; }
          85% { opacity: 0.25; }
          100% { transform: translate(120vw, -20vh) rotate(10deg) scale(1); opacity: 0; }
        }
        /* Path 4: Top-Right to Bottom-Left */
        @keyframes float-path-4 {
          0% { transform: translate(120vw, -20vh) rotate(10deg) scale(0.7); opacity: 0; }
          15% { opacity: 0.2; }
          85% { opacity: 0.2; }
          100% { transform: translate(-20vw, 120vh) rotate(-20deg) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WelcomeOverlay;