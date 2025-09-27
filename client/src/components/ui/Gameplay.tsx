import React from 'react';

const Gameplay = () => {
  const features = [
    {
      title: "Physical Movement",
      description: "Walk in the real world and watch your avatar move in the 3D virtual environment. Your steps become your power.",
      image: "/gameplay/walking.png"
    },
    {
      title: "Checkpoint Events",
      description: "Discover checkpoints in your area, participate in unique events, and complete tasks for real rewards.",
      image: "/gameplay/checkpoint.png"
    },
    {
      title: "Token Economy",
      description: "Earn energy tokens through movement and spend them strategically to maximize your rewards and progression.",
      image: "/gameplay/token.png"
    }
  ];

  return (
    <div className="w-full py-20 px-4"

    >
      {/* Header */}
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8">
          Revolutionary Gameplay
        </h2>
        <p className="text-white text-xl max-w-3xl mx-auto opacity-90">
          Experience the future of gaming where reality meets blockchain
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white/10 rounded-3xl p-8 lg:p-10 border border-white/20 group"
          >
            {/* Image */}
            <div className="mb-8 flex justify-center">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Text */}
            <div className="text-center space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {feature.title}
              </h3>
              <p className="text-white text-base sm:text-lg leading-relaxed opacity-60 text-left">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gameplay;
