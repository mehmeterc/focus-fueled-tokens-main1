
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Sign up for AntiApp",
    description: "Create an account and connect your Solana wallet.",
    image: "/lovable-uploads/4bb51d33-fa97-4a23-8530-6182ffc98507.png"
  },
  {
    number: "02",
    title: "Check in to a café",
    description: "Scan the QR code at a participating café to start your session.",
    image: "/lovable-uploads/4bb51d33-fa97-4a23-8530-6182ffc98507.png"
  },
  {
    number: "03",
    title: "Focus and work",
    description: "Be productive in your new workspace while your time is tracked.",
    image: "/lovable-uploads/4bb51d33-fa97-4a23-8530-6182ffc98507.png"
  },
  {
    number: "04",
    title: "Receive Anti coins",
    description: "Earn Anti coins based on your session duration and consistency.",
    image: "/lovable-uploads/4bb51d33-fa97-4a23-8530-6182ffc98507.png"
  },
  {
    number: "05",
    title: "Attract sponsors",
    description: "Join sponsored events and activities at partner locations.",
    image: "/lovable-uploads/4bb51d33-fa97-4a23-8530-6182ffc98507.png"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 bg-antiapp-peach/20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-antiapp-purple mb-4">
            The Complete Journey
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Follow these simple steps to transform your focus time into valuable Anti coins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="group">
              <Card className="h-full border border-antiapp-teal/20 overflow-hidden group-hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <span className="text-4xl font-bold text-antiapp-teal/30 mr-3">{step.number}</span>
                    <h3 className="text-xl font-semibold text-antiapp-purple pt-1">{step.title}</h3>
                  </div>
                  <p className="text-gray-700">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
