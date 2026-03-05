import React, { useState, useRef, useEffect } from 'react';
import { PencilIcon, EyeIcon, SearchIcon, XIcon, DatabaseIcon } from './IconComponents';
import { Item } from '../types';

interface HeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  items: Item[];
  isAdmin: boolean;
  onLogout: () => void;
  onOpenAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isEditMode, 
  onToggleEditMode, 
  searchQuery, 
  onSearchChange, 
  items, 
  isAdmin, 
  onLogout,
  onOpenAuth 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = items
    .filter(item => 
      searchQuery.length > 0 && 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      item.title.toLowerCase() !== searchQuery.toLowerCase()
    )
    .slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        if (searchQuery === '') {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <header className="px-6 py-6 flex flex-col gap-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
             <span className="font-black text-xs">L</span>
           </div>
           <h1 className="font-black text-sm uppercase tracking-tighter whitespace-nowrap">Load Badhige</h1>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={onToggleEditMode}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                  isEditMode ? 'bg-brand-black text-white' : 'bg-white text-brand-black'
                }`}
              >
                {isEditMode ? <PencilIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
                <span>{isEditMode ? 'Admin' : 'View'}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 bg-white rounded-full shadow-sm text-brand-text-secondary hover:text-brand-black transition-colors"
                title="Logout"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-brand-black shadow-sm active:scale-95 transition-all"
            >
              <DatabaseIcon className="h-3 w-3" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full flex justify-end" ref={searchRef}>
        <div 
          className={`relative flex items-center bg-white rounded-2xl shadow-sm transition-all duration-300 ease-in-out h-14 ${
            isExpanded || searchQuery ? 'w-full' : 'w-14'
          }`}
        >
          <button 
            onClick={handleExpand}
            className={`absolute left-0 w-14 h-14 flex items-center justify-center z-10 text-brand-text-secondary hover:text-brand-black transition-colors ${
               isExpanded || searchQuery ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            <SearchIcon className="h-5 w-5" />
          </button>

          <div className={`flex-grow flex items-center transition-opacity duration-200 ${
            isExpanded || searchQuery ? 'opacity-100 pl-14' : 'opacity-0 pointer-events-none'
          }`}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              className="w-full bg-transparent border-none py-4 pr-12 text-sm font-bold focus:ring-0 outline-none"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setIsExpanded(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                if (searchQuery === '') {
                  setTimeout(() => {
                    if (document.activeElement !== inputRef.current) {
                       setIsExpanded(false);
                    }
                  }, 200);
                }
              }}
            />
            
            {searchQuery && (
              <button 
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="absolute right-4 flex items-center text-brand-text-secondary hover:text-brand-black transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-brand-bg animate-fade-in">
            {suggestions.map((item) => (
              <button
                key={item.id}
                className="w-full px-6 py-4 text-left text-sm font-bold hover:bg-brand-bg transition-colors flex items-center gap-3"
                onClick={() => {
                  onSearchChange(item.title);
                  setShowSuggestions(false);
                }}
              >
                <img src={item.imageUrl} className="w-8 h-8 rounded-lg object-cover bg-brand-bg" alt="" />
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;