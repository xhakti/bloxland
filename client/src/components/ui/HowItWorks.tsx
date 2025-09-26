import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Move & Explore",
      description: "Physical movement translates directly to in-game avatar movement in our 3D world",
      icon: "🚶‍♂️"
    },
    {
      number: "2", 
      title: "Visit Checkpoints",
      description: "Discover and visit real-world locations to unlock exclusive events and challenges",
      icon: "📍"
    },
    {
      number: "3",
      title: "Earn & Spend Tokens", 
      description: "Collect energy tokens and strategically use them to participate in high-reward events",
      icon: "⚡"
    },
    {
      number: "4",
      title: "Customize & Upgrade",
      description: "Purchase new costumes and emotes to personalize your avatar and gaming experience", 
      icon: "✨"
    }
  ];

  return (
    <div className="w-full py-20 px-4">
      {/* Header */}
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8">
          How BloxLand Works
        </h2>
        <p className="text-white text-xl max-w-3xl mx-auto opacity-90">
          Four simple steps to start your Web3 adventure
        </p>
      </div>

      {/* Steps Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout - 2x2 Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white/10 rounded-3xl p-8 lg:p-10 border border-white/20 group hover:bg-white/15 transition-all duration-300"
            >
              {/* Step Number & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full border-2 border-white/30">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-white text-base sm:text-lg leading-relaxed opacity-80">
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
              <div className="bg-white/10 rounded-3xl p-6 border border-white/20 group hover:bg-white/15 transition-all duration-300">
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-full border-2 border-white/30">
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-white text-base leading-relaxed opacity-80">
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
        <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg">
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;
