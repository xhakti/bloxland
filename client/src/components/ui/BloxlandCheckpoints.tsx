import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Coins, Play, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBloxlandCheckpoints, type Checkpoint } from '../../utils/checkpoints';

interface BloxlandCheckpointsProps {
  onCheckpointClick?: (checkpoint: Checkpoint) => void;
}

const BloxlandCheckpoints: React.FC<BloxlandCheckpointsProps> = ({ onCheckpointClick }) => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const bloxlandCheckpoints = getBloxlandCheckpoints();
    setCheckpoints(bloxlandCheckpoints);
  }, []);

  const handleCheckpointClick = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setShowModal(true);
    onCheckpointClick?.(checkpoint);
  };

  const handleJoinChallenge = () => {
    setShowModal(false);
    navigate('/mini-games?autoStart=true');
  };

  if (checkpoints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 font-parkinsans">
          Bloxland Checkpoints
        </h2>
        <p className="text-white text-xl max-w-3xl mx-auto opacity-90 font-lexend">
          Official challenges provided by Bloxland - Test your skills and earn rewards
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {checkpoints.map((checkpoint, index) => (
          <div
            key={checkpoint.id}
            className="p-8 lg:p-10 border border-white/10 group rounded-sm cursor-pointer hover:border-white/30 transition-all duration-300"
            style={{
              backgroundColor: "#000000",
              opacity: 1,
              backgroundImage: "linear-gradient(#131313 2px, transparent 2px), linear-gradient(90deg, #131313 2px, transparent 2px), linear-gradient(#131313 1px, transparent 1px), linear-gradient(90deg, #131313 1px, #000000 1px)",
              backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
              backgroundPosition: "-2px -2px, -2px -2px, -1px -1px, -1px -1px"
            }}
            onClick={() => handleCheckpointClick(checkpoint)}
          >
            <div className="text-center space-y-6">
              {/* Bloxland Logo */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-white/20">
                  <img src="./logo.png" alt="Bloxland" className="w-10 h-10" />
                </div>
              </div>
              
              {/* Checkpoint Info */}
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-parkinsans">
                  {checkpoint.name}
                </h3>
                <p className="text-white text-base sm:text-lg leading-relaxed opacity-80 font-lexend">
                  {checkpoint.description}
                </p>
                
                {/* Energy Cost */}
                <div className="flex items-center justify-center space-x-2 text-neutral-300">
                  <Zap className="w-5 h-5" />
                  <span className="text-lg font-semibold font-lexend">50 Energy Points</span>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="pt-4">
                <button className="w-full px-6 py-3 bg-white hover:bg-neutral-100 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-lexend flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Start Challenge</span>
``                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedCheckpoint && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md text-white rounded-sm border border-white/20"
            style={{
              backgroundColor: "#000000",
              opacity: 1,
              backgroundImage: "linear-gradient(#131313 2px, transparent 2px), linear-gradient(90deg, #131313 2px, transparent 2px), linear-gradient(#131313 1px, transparent 1px), linear-gradient(90deg, #131313 1px, #000000 1px)",
              backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
              backgroundPosition: "-2px -2px, -2px -2px, -1px -1px, -1px -1px"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <img src="./logo.png" alt="Bloxland" className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-parkinsans">
                  {selectedCheckpoint.name}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div className="text-center">
                <p className="text-neutral-300 text-base leading-relaxed font-lexend mb-4">
                  {selectedCheckpoint.description}
                </p>
                <p className="text-white text-lg font-semibold font-parkinsans">
                  Choose any one game to play and win!
                </p>
              </div>

              {/* Energy Cost */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-neutral-600/20 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold font-parkinsans text-lg">Energy Required</h4>
                    <p className="text-neutral-400 text-sm font-lexend">Burn energy to start challenge</p>
                  </div>
                  <div className="flex items-center space-x-2 text-neutral-300">
                    <Zap className="w-5 h-5" />
                    <span className="text-2xl font-bold font-lexend">50</span>
                    <span className="text-lg font-lexend">Energy Points</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleJoinChallenge}
                  className="w-full px-6 py-4 bg-white text-black font-semibold rounded-lg hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105 active:scale-95 font-lexend flex items-center justify-center space-x-2 text-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Challenge</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors font-lexend"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloxlandCheckpoints;
