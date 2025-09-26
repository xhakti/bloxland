import React from 'react';

const RealRewards = () => {
  const rewards = [
    {
      title: "Event Prizes",
      description: "Complete checkpoint challenges for real-world rewards",
      icon: "🏆"
    },
    {
      title: "Avatar Costumes",
      description: "Unlock and purchase unique outfits for your character",
      icon: "👕"
    },
    {
      title: "Exclusive Emotes",
      description: "Express yourself with rare and collectible animations",
      icon: "💃"
    },
    {
      title: "Energy Tokens",
      description: "Earn cryptocurrency tokens through physical activity",
      icon: "⚡"
    }
  ];

  return (
    <div className="w-full py-20 px-4">
      {/* Header */}
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8">
          Real Rewards for Real Movement
        </h2>
        <p className="text-white text-xl max-w-3xl mx-auto opacity-90">
          Turn your daily steps into valuable digital and physical rewards
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
        {rewards.map((reward, index) => (
          <div 
            key={index}
            className="bg-white/10 rounded-3xl p-8 lg:p-6 border border-white/20 group hover:bg-white/15 transition-all duration-300 text-center"
          >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                {reward.icon}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {reward.title}
              </h3>
              <p className="text-white text-sm sm:text-base leading-relaxed opacity-80">
                {reward.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <div className="space-y-4">
          <p className="text-white text-lg opacity-90 max-w-2xl mx-auto">
            Ready to start earning real rewards for your movement?
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
            <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg">
              Start Earning
            </button>
            <button className="px-8 py-4 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300 text-lg">
              View All Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealRewards;
