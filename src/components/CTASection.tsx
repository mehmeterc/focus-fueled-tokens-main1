
import { Button } from "@/components/ui/button";
import Coin from "./Coin";

const CTASection = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-antiapp-teal text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-start max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Turn Your Focus into Currency?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Join AntiApp today and start transforming your productivity into valuable Anti coins at partner cafés worldwide.
            </p>
            <Button className="bg-white text-antiapp-teal hover:bg-white/90 px-8 py-6 rounded-lg">
              Get Started Now
            </Button>
          </div>
          <div className="relative">
            <div className="absolute top-0 -left-4">
              <Coin size="sm" className="opacity-70" />
            </div>
            <div className="relative">
              <Coin size="lg" />
            </div>
            <div className="absolute bottom-0 -right-4">
              <Coin size="sm" className="opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
