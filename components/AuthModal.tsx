
import React, { useState } from 'react';
import { XIcon } from './IconComponents';

interface AuthModalProps {
  onClose: () => void;
  onLogin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Hardcoded credentials check
    setTimeout(() => {
      if (username === '1001' && password === '2002') {
        onLogin();
        onClose();
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-5xl p-8 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black tracking-tight">Admin Login</h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-full transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-2">Username</label>
            <input
              type="text"
              required
              className="w-full bg-brand-bg border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-brand-yellow outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="*****"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-brand-bg border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-brand-yellow outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*****"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-black text-white p-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all mt-6 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
