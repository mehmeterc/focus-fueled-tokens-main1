
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Coffee, User } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import MerchantHamburgerMenu from './MerchantHamburgerMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import SolanaWalletButton from './SolanaWalletButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isMerchant, isCommunity } = useAuth();
  const location = useLocation();

  // Close the mobile menu when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-antiapp-purple flex items-center mr-6">
            <span className="text-antiapp-teal">Anti</span>App
          </Link>
          {/* Cafes link right after logo */}
          <Link to="/cafes" className="text-gray-600 hover:text-antiapp-purple transition-colors hidden md:inline-block mr-6">
            Cafes
          </Link>
          {/* User info/profile badge (centered for desktop) */}
          <div className="flex-1 flex justify-center">
            {user ? (
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-600 mr-1">
                        {user.email?.split('@')[0]}
                      </span>
                      {profile && (
                        <Badge 
                          variant="outline" 
                          className={`
                            text-xs px-2 
                            ${profile.role === 'merchant' 
                              ? 'border-antiapp-purple bg-antiapp-purple/10 text-antiapp-purple' 
                              : 'border-antiapp-teal bg-antiapp-teal/10 text-antiapp-teal'}
                          `}
                        >
                          {profile.role === 'merchant' ? 'Merchant' : 'Community'}
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Signed in as {user.email}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-antiapp-teal hover:bg-antiapp-teal/90 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          {/* Right section with wallet and hamburger menu */}
          <div className="flex items-center space-x-3">
            {/* Main navigation links for desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <button
                  className="text-gray-600 hover:text-antiapp-purple transition-colors"
                  onClick={signOut}
                >
                  Sign Out
                </button>
              )}
            </div>
            
            {/* Single hamburger menu for mobile */}
            <div className="md:hidden">
              {user && isCommunity() && <HamburgerMenu />}
              {user && isMerchant() && <MerchantHamburgerMenu />}
            </div>
            
            {/* Solana wallet connect button always visible */}
            <SolanaWalletButton />
          </div>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/cafes" 
                className="text-gray-600 hover:text-antiapp-purple transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cafes
              </Link>
              
              {user ? (
                <>
                  {profile && (
                    <div className="py-2">
                      <Badge 
                        variant="outline" 
                        className={`
                          text-xs px-2 
                          ${profile.role === 'merchant' 
                            ? 'border-antiapp-purple bg-antiapp-purple/10 text-antiapp-purple' 
                            : 'border-antiapp-teal bg-antiapp-teal/10 text-antiapp-teal'}
                        `}
                      >
                        {profile.role === 'merchant' ? 'Merchant Account' : 'Community Account'}
                      </Badge>
                    </div>
                  )}
                  
                  <button
                    className="text-left text-gray-600 hover:text-antiapp-purple transition-colors py-2"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth"
                  className="text-gray-600 hover:text-antiapp-purple transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
