import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Move & Explore",
      description: "Physical movement translates directly to in-game avatar movement in our 3D world",
    },
    {
      number: "2", 
      title: "Visit Checkpoints",
      description: "Discover and visit real-world locations to unlock exclusive events and challenges",
    },
    {
      number: "3",
      title: "Earn & Spend Tokens", 
      description: "Collect energy tokens and strategically use them to participate in high-reward events",
    },
    {
      number: "4",
      title: "Customize & Upgrade",
      description: "Purchase new costumes and emotes to personalize your avatar and gaming experience", 
    }
  ];

  return (
    <div className="w-full py-20 px-4">
      {/* Header */}
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 font-parkinsans">
          How BloxLand Works
        </h2>
        <p className="text-white text-xl max-w-3xl mx-auto opacity-90 font-lexend">
          Four simple steps to start your Web3 adventure
        </p>
      </div>

      {/* Steps Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout - 2x2 Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="p-8 lg:p-10 border border-white/10 group rounded-sm"
              style={{
                backgroundColor: "#000000",
                opacity: 1,
                backgroundImage: "linear-gradient(#131313 2px, transparent 2px), linear-gradient(90deg, #131313 2px, transparent 2px), linear-gradient(#131313 1px, transparent 1px), linear-gradient(90deg, #131313 1px, #000000 1px)",
                backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
                backgroundPosition: "-2px -2px, -2px -2px, -1px -1px, -1px -1px"
              }}
            >
              {/* Step Number & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/30">
                  <span className="text-2xl font-bold  text-white">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-parkinsans">
                  {step.title}
                </h3>
                <p className="text-white text-base sm:text-lg leading-relaxed opacity-80 font-lexend">
                  {step.description}
                </p>
              </div>

              {/* Connecting Line for Desktop */}
              {index < 2 && (
                <div className="absolute top-1/2 -right-6 w-12 h-0.5 bg-white/30 hidden lg:block transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Layout - Vertical Stack */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div 
                className="p-6 border border-white/10 group rounded-sm"
                style={{
                  backgroundColor: "#000000",
                  opacity: 1,
                  backgroundImage: "linear-gradient(#131313 2px, transparent 2px), linear-gradient(90deg, #131313 2px, transparent 2px), linear-gradient(#131313 1px, transparent 1px), linear-gradient(90deg, #131313 1px, #000000 1px)",
                  backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
                  backgroundPosition: "-2px -2px, -2px -2px, -1px -1px, -1px -1px"
                }}
              >
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/30">
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-parkinsans">
                    {step.title}
                  </h3>
                  <p className="text-white text-base leading-relaxed opacity-80 font-lexend">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connecting Line for Mobile */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <div className="w-0.5 h-8 bg-white/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-20">
        <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg font-lexend">
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;
