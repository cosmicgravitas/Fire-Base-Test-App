
import React, { useRef } from 'react';
import { UploadIcon } from './IconComponents';

interface FileUploadProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onImageUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
      event.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={isLoading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="relative group w-full p-8 rounded-3xl glass-card text-center transition-all hover:scale-[1.01]"
      >
        <div className="flex flex-col items-center gap-4">
           <div className={`p-3 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 transition-transform ${isLoading ? 'animate-bounce' : 'group-hover:-translate-y-1'}`}>
              <UploadIcon className="h-6 w-6 text-brand-primary" />
           </div>
           <div>
             <span className="text-sm font-black text-white uppercase tracking-widest">
                {isLoading ? 'Neural Analysis...' : 'Add New Item'}
             </span>
             <p className="text-[10px] text-brand-text-secondary mt-1 font-medium tracking-tight">
               AI will automatically describe your product.
             </p>
           </div>
        </div>
        
        {isLoading && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-brand-primary w-full overflow-hidden">
            <div className="h-full bg-white w-1/3 animate-[shimmer_1.5s_infinite_linear]"></div>
          </div>
        )}
      </button>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;