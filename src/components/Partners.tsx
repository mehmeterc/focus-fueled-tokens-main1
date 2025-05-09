
const Partners = () => {
  return (
    <section id="partners" className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-antiapp-purple mb-4">
            Our Partners
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            AntiApp is proud to partner with these innovative companies
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-12 py-4">
          <div className="flex flex-col items-center">
            <div className="w-48 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold text-antiapp-purple-light">Solana</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">Blockchain Technology</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-48 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold text-antiapp-coral">Jägermeister</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">Event Sponsor</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-48 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold text-antiapp-teal">Cafés Worldwide</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">Workspace Partners</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
