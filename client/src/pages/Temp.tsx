import React from "react";

const Temp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b3dab] via-[#2a4bc7] to-[#3da854] text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-black/20 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">
          <span className="text-[#3da854]">Blox</span>Land
        </div>
        <div className="hidden md:flex space-x-8">
          <a
            href="#features"
            className="hover:text-[#3da854] transition-colors"
          >
            Features
          </a>
          <a
            href="#gameplay"
            className="hover:text-[#3da854] transition-colors"
          >
            Gameplay
          </a>
          <a href="#rewards" className="hover:text-[#3da854] transition-colors">
            Rewards
          </a>
        </div>
        <button className="bg-[#3da854] hover:bg-[#2d8041] px-6 py-2 rounded-full font-semibold transition-colors">
          Play Now
        </button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-[#3da854] bg-clip-text text-transparent">
            Move. Explore. Earn.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            The first Web3 game where your physical movement powers your digital
            adventure in a 3D world
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-[#3da854] hover:bg-[#2d8041] px-8 py-4 rounded-full text-lg font-semibold transition-colors">
              Start Your Journey
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-[#1b3dab] px-8 py-4 rounded-full text-lg font-semibold transition-colors">
              Watch Gameplay
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Revolutionary Gameplay
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 bg-[#3da854] rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">🚶</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#3da854]">
                Physical Movement
              </h3>
              <p className="text-gray-200">
                Walk in the real world and watch your avatar move in the 3D
                virtual environment. Your steps become your power.
              </p>
            </div>
            <div className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 bg-[#3da854] rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#3da854]">
                Checkpoint Events
              </h3>
              <p className="text-gray-200">
                Discover checkpoints in your area, participate in unique events,
                and complete tasks for real rewards.
              </p>
            </div>
            <div className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 bg-[#3da854] rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#3da854]">
                Token Economy
              </h3>
              <p className="text-gray-200">
                Earn energy tokens through movement and spend them strategically
                to maximize your rewards and progression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gameplay Section */}
      <section id="gameplay" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">How BloxLand Works</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#3da854] rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Move & Explore</h4>
                    <p className="text-gray-300">
                      Physical movement translates directly to in-game avatar
                      movement in our 3D world
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#3da854] rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">
                      Visit Checkpoints
                    </h4>
                    <p className="text-gray-300">
                      Discover and visit real-world locations to unlock
                      exclusive events and challenges
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#3da854] rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">
                      Earn & Spend Tokens
                    </h4>
                    <p className="text-gray-300">
                      Collect energy tokens and strategically use them to
                      participate in high-reward events
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#3da854] rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">
                      Customize & Upgrade
                    </h4>
                    <p className="text-gray-300">
                      Purchase new costumes and emotes to personalize your
                      avatar and gaming experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#3da854] to-[#1b3dab] p-8 rounded-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">3D Virtual World</h3>
                <div className="bg-black/20 rounded-lg p-8 mb-4">
                  <div className="text-6xl mb-4">🌍</div>
                  <p className="text-lg">
                    Immersive 3D environment synced with real-world movement
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-sm">Energy Tokens</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-sm">Checkpoints</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-20 bg-black/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16">
            Real Rewards for Real Movement
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-b from-[#3da854] to-[#2d8041] p-6 rounded-2xl">
              <div className="text-3xl mb-4">🏆</div>
              <h4 className="font-bold text-lg mb-2">Event Prizes</h4>
              <p className="text-sm">
                Complete checkpoint challenges for real-world rewards
              </p>
            </div>
            <div className="bg-gradient-to-b from-[#1b3dab] to-[#2a4bc7] p-6 rounded-2xl">
              <div className="text-3xl mb-4">👕</div>
              <h4 className="font-bold text-lg mb-2">Avatar Costumes</h4>
              <p className="text-sm">
                Unlock and purchase unique outfits for your character
              </p>
            </div>
            <div className="bg-gradient-to-b from-[#3da854] to-[#2d8041] p-6 rounded-2xl">
              <div className="text-3xl mb-4">💃</div>
              <h4 className="font-bold text-lg mb-2">Exclusive Emotes</h4>
              <p className="text-sm">
                Express yourself with rare and collectible animations
              </p>
            </div>
            <div className="bg-gradient-to-b from-[#1b3dab] to-[#2a4bc7] p-6 rounded-2xl">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="font-bold text-lg mb-2">Energy Tokens</h4>
              <p className="text-sm">
                Earn cryptocurrency tokens through physical activity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#3da854] mb-2">10K+</div>
              <p className="text-gray-300">Active Players</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3da854] mb-2">500+</div>
              <p className="text-gray-300">Checkpoints</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3da854] mb-2">1M+</div>
              <p className="text-gray-300">Steps Tracked</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3da854] mb-2">
                $50K+
              </div>
              <p className="text-gray-300">Rewards Distributed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1b3dab] to-[#3da854]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Turn Steps into Rewards?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Join thousands of players already earning real rewards through
            physical activity
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-white text-[#1b3dab] hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-colors">
              Download BloxLand
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-[#1b3dab] px-8 py-4 rounded-full text-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-[#3da854]">Blox</span>Land
              </div>
              <p className="text-gray-400">
                The future of Web3 gaming where physical movement meets digital
                rewards.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Game</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    How to Play
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Checkpoints
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Rewards
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BloxLand. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Temp;
