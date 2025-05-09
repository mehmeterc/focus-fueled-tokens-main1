
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Partners from '@/components/Partners';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      {/* Added Button, Tooltip and Sonner trigger for demonstration */}
      <div className="container mx-auto text-center py-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => toast("Event has been created")}>
              Hover Me for Tooltip & Click for Toast!
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a tooltip!</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Features />
      <HowItWorks />
      <Partners />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
