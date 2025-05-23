import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Timer } from 'lucide-react';
import { SolanaConnectButton } from './SolanaConnectButton';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { setVisible } = useWalletModal();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="relative z-50">
      {/* Hamburger Icon */}
      <button
        className="p-2 focus:outline-none"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(!open)}
      >
        {!open ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-antiapp-purple h-7 w-7">
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-antiapp-purple h-7 w-7">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </button>
      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'} md:rounded-l-lg z-50`}
        style={{ minWidth: 220 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <span className="text-lg font-bold text-antiapp-purple">Menu</span>
            <button
              className="p-1"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-antiapp-purple h-6 w-6">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <ul className="flex-1 flex flex-col gap-2 px-6 py-4">
            {/* Wallet Connect Button */}
            <li className="my-2">
              <SolanaConnectButton />
              {/* The SolanaConnectButton (WalletMultiButton) handles its own modal visibility.*/}
              {/* If you need to explicitly close the hamburger menu when it's clicked, 
                  you might need to pass setOpen(false) into it or handle it via context/global state 
                  if WalletMultiButton doesn't propagate click events easily. 
                  For now, we assume user clicks it, modal opens, then they manually close hamburger or it auto-closes on navigation. 
              */}
            </li>
            {/* Add Focus Timer link */}
            <li>
              <Link to="/focus-timer" className="flex items-center gap-2 py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                <Timer className="h-4 w-4 text-green-600" />
                Focus Timer
              </Link>
            </li>
            {/* 3. Anti Coins */}
            <li>
              <Link to="/anti-coins" className="flex items-center gap-2 py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                Anti Coins
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                  <circle cx="14" cy="14" r="12" fill="#FDE68A" stroke="#F59E42" strokeWidth="2" />
                  <circle cx="14" cy="14" r="8" fill="#FDE047" stroke="#F59E42" strokeWidth="1.5" />
                  <text x="14" y="18" textAnchor="middle" fontSize="13" fill="#B45309" fontWeight="bold">¢</text>
                </svg>
              </Link>
            </li>
            {/* 4. My Registered Events */}
            <li>
              <Link to="/registered-events" className="block py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                My Events
              </Link>
            </li>
            {/* 5. History */}
            <li>
              <Link to="/history" className="block py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                History
              </Link>
            </li>
            {/* 6. Profile */}
            <li>
              <Link to="/profile" className="block py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                Profile
              </Link>
            </li>
            {/* Sign Out Button - Restored */}
            <li className="mt-auto border-t pt-4">
              <button
                className="w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setOpen(false)}
          aria-label="Close menu overlay"
        />
      )}
    </div>
  );
}
