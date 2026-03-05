
import React, { useState, useEffect, useMemo } from 'react';
import { Item, CartItem } from './types';
import { generateItemDetails } from './services/geminiService';
import { resizeAndCompressImage } from './utils/fileUtils';
import { getAllItems, saveItem, deleteItemFromDB } from './utils/dbUtils';
import Header from './components/Header';
import ItemList from './components/ItemList';
import FileUpload from './components/FileUpload';
import Spinner from './components/Spinner';
import ItemModal from './components/ItemModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import WelcomeOverlay from './components/WelcomeOverlay';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false); 
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('aura_admin_session');
    if (session === 'true') {
      setIsAdmin(true);
      setIsEditMode(true);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (e: any) {
      setError(`Sync Error: ${e.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      // Admins in edit mode see all items to manage them. Customers and admins in view mode see only visible items.
      const isVisible = (isAdmin && isEditMode) ? true : item.isSelected;
      return matchesSearch && isVisible;
    });
  }, [items, searchQuery, isAdmin, isEditMode]);

  const handleImageUpload = async (file: File) => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const { base64, mimeType } = await resizeAndCompressImage(file);
      const details = await generateItemDetails(base64, mimeType);
      const newItem: Item = { 
        id: crypto.randomUUID(), 
        imageUrl: `data:${mimeType};base64,${base64}`, 
        ...details, 
        price: 18.00,
        isSelected: true 
      };
      await saveItem(newItem);
      setItems(prev => [newItem, ...prev]);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (updatedItem: Item) => {
    if (!isAdmin) return;
    try {
      await saveItem(updatedItem);
      setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
      setCart(prev => prev.map(i => i.id === updatedItem.id ? { ...updatedItem, quantity: i.quantity } : i));
    } catch (err: any) {
      setError(`Update failed: ${err.message}`);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    if (!isAdmin) return;
    const item = items.find(i => i.id === id);
    if (!item) return;
    const updated = { ...item, isSelected: !item.isSelected };
    await handleUpdateItem(updated);
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) return;
    // Keeping delete logic exactly as before - no confirmation added.
    await deleteItemFromDB(id);
    setItems(items.filter(item => item.id !== id));
    setCart(prev => prev.filter(i => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setIsEditMode(true);
    localStorage.setItem('aura_admin_session', 'true');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsEditMode(false);
    localStorage.removeItem('aura_admin_session');
  };

  const updateCartQuantity = (item: Item, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(i => i.id !== item.id);
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i);
      }
      if (delta > 0) {
        return [...prev, { ...item, quantity: delta }];
      }
      return prev;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckoutLoading(true);
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const orderData = {
      total: total,
      items: cart.map(item => ({ name: item.title, quantity: item.quantity }))
    };
    try {
      await fetch("https://script.google.com/macros/s/AKfycbzyaAG0r-ARF6bcKw-Kkn8o_vAbOZFNu8h92p-uRDatYrwAsu_t47Qqp6As8o1Cmy3QSQ/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(orderData)
      });
      alert("Order Placed Successfully!");
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      alert("There was an error placing your order. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const cartItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {showWelcome && <WelcomeOverlay onDismiss={() => setShowWelcome(false)} items={items.filter(i => i.isSelected)} />}
      
      <Header 
        isEditMode={isEditMode} 
        onToggleEditMode={() => isAdmin ? setIsEditMode(!isEditMode) : setIsAuthModalOpen(true)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        items={filteredItems}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
      
      <main className="container mx-auto px-6 py-4 max-w-4xl">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-brand-black leading-tight tracking-tight">
            Curated <span className="text-brand-text-secondary">Essentials</span> <br/> 
            <span className="text-brand-black">{isAdmin && isEditMode ? 'Managing Inventory' : 'Available for Purchase'}</span>
          </h2>
        </div>

        {isEditMode && isAdmin && (
          <div className="mb-10">
            <FileUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        <ItemList 
          items={filteredItems} 
          onUpdateItem={handleUpdateItem} 
          onToggleVisibility={handleToggleVisibility}
          onDeleteItem={handleDeleteItem} 
          onSelectItem={setSelectedItem} 
          onAddToCart={(item) => updateCartQuantity(item, 1)}
          onUpdateCartQuantity={updateCartQuantity}
          isEditMode={isEditMode && isAdmin} 
          cart={cart}
        />
      </main>
      
      {!isAdmin && (
        <div className="fixed bottom-6 left-6 right-6 z-40 lg:max-w-xl lg:mx-auto">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 text-brand-black p-4 rounded-4xl flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all active:scale-95 hover:bg-white/50 ring-1 ring-black/5"
          >
            <div className="flex items-center gap-4 pl-2">
              <div className="bg-brand-black text-brand-yellow w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-lg">
                {cartItemsCount}
              </div>
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-[0.2em] text-brand-black/80">Your Bag</p>
                <p className="text-[10px] text-brand-black/40 font-bold uppercase tracking-tight">{cartItemsCount} items ready</p>
              </div>
            </div>
            <div className="flex -space-x-3 mr-2">
              {cart.slice(0, 3).map(i => (
                <div key={i.id} className="relative group/mini">
                  <img src={i.imageUrl} className="w-10 h-10 rounded-full border-2 border-white object-cover bg-white shadow-xl transition-transform group-hover/mini:-translate-y-1" alt="" />
                </div>
              ))}
            </div>
          </button>
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart} 
        onUpdateQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
        isCheckoutLoading={isCheckoutLoading}
      />

      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          isEditMode={isEditMode && isAdmin}
          onUpdateItem={handleUpdateItem}
          onAddToCart={() => updateCartQuantity(selectedItem, 1)}
          onUpdateCartQuantity={updateCartQuantity}
          onOpenCart={() => {
            setIsCartOpen(true);
            setSelectedItem(null);
          }}
          cartItem={cart.find(i => i.id === selectedItem.id)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal onLogin={handleLogin} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
}
