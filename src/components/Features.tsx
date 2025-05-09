
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Find a space",
    description: "Discover nearby cafés with available workspace during non-peak hours.",
    image: "/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png",
  },
  {
    title: "Check in",
    description: "Use QR code to check in at your chosen café location.",
    image: "/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png",
  },
  {
    title: "Get to work",
    description: "Enjoy a productive workspace while timing your session.",
    image: "/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png",
  },
  {
    title: "Earn Anti",
    description: "Receive Anti coins based on your focus time at the café.",
    image: "/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png",
  },
  {
    title: "Use tokens",
    description: "Spend your Anti coins on discounts and special offers.",
    image: "/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png",
  },
  {
    title: "Join event",
    description: "Participate in community events hosted at partner cafés.",
    image: "/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png",
  },
];

const Features = () => {
  return (
    <section id="features" className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-antiapp-purple mb-4">
            How AntiApp Works
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Our platform transforms cafés into micro coworking spaces while rewarding you with 
            Anti coins on the Solana blockchain for your focus time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden border border-antiapp-teal/20 hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="bg-antiapp-peach/30 p-6">
                  <h3 className="text-xl font-semibold text-antiapp-purple">{feature.title}</h3>
                  <p className="text-gray-700 mt-2">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
