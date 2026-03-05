
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse"></div>
      
      {/* Animated Rings */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-[3px] border-brand-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-t-brand-primary animate-[spin_1s_linear_infinite]"></div>
        <div className="absolute inset-3 rounded-full border-[3px] border-brand-primary/10 border-b-brand-primary/60 animate-[spin_2s_linear_infinite_reverse]"></div>
      </div>
      
      <span className="sr-only">Processing...</span>
    </div>
  );
};

export default Spinner;