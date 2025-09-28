import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Users, Coins, Trophy, Calendar, Play, ExternalLink } from 'lucide-react';
import { type Checkpoint } from '../../utils/checkpoints';

interface CheckpointModalProps {
  isOpen: boolean;
  checkpoint: Checkpoint | null;
  onClose: () => void;
  onStartTask?: () => void;
  onViewOnMap?: () => void;
}

const CheckpointModal: React.FC<CheckpointModalProps> = ({
  isOpen,
  checkpoint,
  onClose,
  onStartTask,
  onViewOnMap,
}) => {
  const navigate = useNavigate();
  
  if (!isOpen || !checkpoint) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleStartTask = () => {
    onStartTask?.();
    // Navigate to mini-games page with autoStart parameter
    navigate('/mini-games?autoStart=true');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-white/20 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Checkpoint Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Checkpoint Header */}
          <div className="flex items-start space-x-4">
            {/* Logo */}
            {checkpoint.isBloxlandProvided ? (
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <img src="./logo.png" alt="Bloxland" className="w-10 h-10" />
              </div>
            ) : checkpoint.logoUrl ? (
              <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                <img
                  src={checkpoint.logoUrl}
                  alt={`${checkpoint.sponsorName} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-yellow-400/20 rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <MapPin className="w-8 h-8 text-yellow-400" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{checkpoint.name}</h3>
              {checkpoint.isBloxlandProvided ? (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm bg-neutral-600/20 text-neutral-300 px-3 py-1 rounded-full">
                    Provided by Bloxland
                  </span>
                </div>
              ) : checkpoint.sponsorName ? (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full">
                    Sponsored by {checkpoint.sponsorName}
                  </span>
                </div>
              ) : null}
              {checkpoint.description && (
                <p className="text-gray-300 text-sm leading-relaxed">{checkpoint.description}</p>
              )}
            </div>
          </div>

          {/* Task Section */}
          {checkpoint.task && (
            <div className={`rounded-lg p-4 ${
              checkpoint.isBloxlandProvided 
                ? "bg-gradient-to-r from-neutral-600/10 to-neutral-800/10 border border-neutral-600/20"
                : "bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    checkpoint.isBloxlandProvided 
                      ? "bg-neutral-600/20" 
                      : "bg-yellow-400/20"
                  }`}>
                    <Trophy className={`w-5 h-5 ${
                      checkpoint.isBloxlandProvided 
                        ? "text-neutral-300" 
                        : "text-yellow-400"
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{checkpoint.task}</h4>
                    <p className="text-gray-300 text-sm">
                      {checkpoint.isBloxlandProvided ? "Bloxland Challenge" : "Interactive mini-game"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${
                    checkpoint.isBloxlandProvided 
                      ? "text-neutral-300" 
                      : "text-yellow-400"
                  }`}>
                    <Coins className="w-4 h-4" />
                    <span className="text-lg font-bold">{checkpoint.isBloxlandProvided ? "50" : (checkpoint.reward || 100)}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{checkpoint.isBloxlandProvided ? "Energy Points" : "Token Reward"}</p>
                </div>
              </div>

              <button
                onClick={handleStartTask}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 font-bold rounded-lg transition-colors ${
                  checkpoint.isBloxlandProvided 
                    ? "bg-white hover:bg-neutral-100 text-black" 
                    : "bg-yellow-400 hover:bg-yellow-500 text-black"
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Start Challenge</span>
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Participations</span>
              </div>
              <p className="text-white text-xl font-bold">{checkpoint.participations || 0}</p>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Location</span>
                </div>
                <p className="text-white font-mono text-sm">
                  {checkpoint.latitude.toFixed(6)}, {checkpoint.longitude.toFixed(6)}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Created on {formatDate(checkpoint.createdAt)}
                </p>
              </div>
              {onViewOnMap && (
                <button
                  onClick={onViewOnMap}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View on Map</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckpointModal;
