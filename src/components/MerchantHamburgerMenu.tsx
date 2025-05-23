import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function MerchantHamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
            <li>
              <Link to="/cafes" className="block py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/merchant-dashboard" className="block py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                My Cafes
              </Link>
            </li>
            <li>
              <Link to="/merchant-sessions" className="block py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                Session History
              </Link>
            </li>
            <li>
              <Link to="/profile" className="block py-2 text-gray-700 hover:text-antiapp-teal font-medium" onClick={() => setOpen(false)}>
                Profile
              </Link>
            </li>
            <li className="mt-4 border-t pt-4">
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
