
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
        <div className="flex items-center w-full justify-between">
          {/* Logo and navigation links */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl font-bold text-antiapp-purple flex items-center mr-4 whitespace-nowrap">
              <span className="text-antiapp-teal">Anti</span>App
            </Link>
            <Link to="/cafes" className="text-gray-600 hover:text-antiapp-purple transition-colors hidden md:inline-block mr-4">
              Cafes
            </Link>
          </div>
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
          {/* Hamburger menu only on mobile */}
          <div className="block lg:hidden">
            {user && profile?.role === 'merchant' ? (
              <MerchantHamburgerMenu />
            ) : user ? (
              <HamburgerMenu />
            ) : null}
          </div>
          {/* Wallet button always visible on desktop, fixed at bottom on mobile */}
          <div className="hidden sm:block ml-4">
            <SolanaWalletButton />
          </div>
        </div>
      </div>
      {/* Wallet button for mobile - stick to bottom of nav */}
      <div className="block sm:hidden w-full px-4 pb-2">
        <SolanaWalletButton />
      </div>
    </nav>
  );
};

export default Navbar;
