import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Define props for the PageLayout component
interface PageLayoutProps {
  children: ReactNode;
  showBackButton?: boolean; // Default true, can be disabled
  customBackUrl?: string; // Optional custom back URL
}

export default function PageLayout({ 
  children, 
  showBackButton = true,
  customBackUrl 
}: PageLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show back button on main routes
  const isMainRoute = ['/', '/cafes', '/auth'].includes(location.pathname);
  const shouldShowBackButton = showBackButton && !isMainRoute;

  const handleBack = () => {
    if (customBackUrl) {
      navigate(customBackUrl);
    } else {
      navigate(-1); // Go back in history
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <Navbar />
      
      {/* Main Content with optional back button */}
      <main className="flex-1">
        {shouldShowBackButton && (
          <div className="container mx-auto px-4 pt-4">
            <Button 
              variant="ghost" 
              className="flex items-center text-antiapp-purple hover:bg-antiapp-purple/10" 
              onClick={handleBack}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-antiapp-purple text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AntiApp</h3>
              <p className="text-sm">Transform your focus time into currency at partner cafés.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">Features</a></li>
                <li><a href="#" className="hover:underline">How It Works</a></li>
                <li><a href="#" className="hover:underline">Token Economy</a></li>
                <li><a href="#" className="hover:underline">For Cafés</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">Documentation</a></li>
                <li><a href="#" className="hover:underline">API</a></li>
                <li><a href="#" className="hover:underline">Support</a></li>
                <li><a href="#" className="hover:underline">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© {new Date().getFullYear()} AntiApp. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm hover:underline">Privacy</a>
              <a href="#" className="text-sm hover:underline">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
