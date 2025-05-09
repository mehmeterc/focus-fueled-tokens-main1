
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-antiapp-peach/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-start max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-antiapp-purple mb-4">
              AntiApp
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-antiapp-teal mb-6">
              WHERE FOCUS BECOMES CURRENCY
            </p>
            <p className="text-lg text-gray-700 mb-8">
              Transform cafés into productive workspaces and earn Anti coins on the Solana blockchain for your focused time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cafes">
                <Button className="bg-antiapp-teal hover:bg-antiapp-teal/90 text-white px-8 py-6 rounded-lg">
                  Find Cafes
                </Button>
              </Link>
              <Link to="#how-it-works">
                <Button variant="outline" className="border-antiapp-teal text-antiapp-teal hover:bg-antiapp-teal/10 px-8 py-6 rounded-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-lg">
            <div className="relative w-full aspect-square">
              <img 
                src="/lovable-uploads/578940f1-eb81-4dbc-9671-d9ef3435efe9.png" 
                alt="AntiApp concept illustration" 
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
