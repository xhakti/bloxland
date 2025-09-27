import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Coins, Trophy, Calendar, Play, ExternalLink } from 'lucide-react';

interface Checkpoint {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  createdAt: string;
  sponsorName?: string;
  description?: string;
  logoUrl?: string;
  reward?: number;
  task?: string;
  participations?: number;
}

const CheckpointDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCheckpoint();
  }, [id]);

  const loadCheckpoint = () => {
    try {
      const savedCheckpoints = localStorage.getItem('checkpoints');
      if (savedCheckpoints && id) {
        const allCheckpoints: Checkpoint[] = JSON.parse(savedCheckpoints);
        const foundCheckpoint = allCheckpoints.find(cp => cp.id === id);
        setCheckpoint(foundCheckpoint || null);
      }
    } catch (error) {
      console.error('Error loading checkpoint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartTask = () => {
    // TODO: Navigate to Stone Paper Scissors game
    alert('Stone Paper Scissors game would start here!');
  };

  const handleViewOnMap = () => {
    if (checkpoint) {
      navigate('/game', {
        state: {
          centerLocation: [checkpoint.longitude, checkpoint.latitude],
          zoom: 18
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading checkpoint...</div>
      </div>
    );
  }

  if (!checkpoint) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Checkpoint Not Found</h2>
          <p className="text-gray-400 mb-6">The checkpoint you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/game')}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors"
          >
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Checkpoint Details</h1>
              <p className="text-gray-400 text-sm">Complete the task to earn rewards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Checkpoint Header */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="flex items-start space-x-6">
                {/* Logo */}
                {checkpoint.logoUrl ? (
                  <div className="w-20 h-20 bg-white/10 rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                    <img
                      src={checkpoint.logoUrl}
                      alt={`${checkpoint.sponsorName} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-yellow-400/20 rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                    <MapPin className="w-10 h-10 text-yellow-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{checkpoint.name}</h2>
                  {checkpoint.sponsorName && (
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full">
                        Sponsored by {checkpoint.sponsorName}
                      </span>
                    </div>
                  )}
                  {checkpoint.description && (
                    <p className="text-gray-300 leading-relaxed">{checkpoint.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Task Section */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Complete the Challenge</h3>
              
              <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{checkpoint.task}</h4>
                      <p className="text-gray-300 text-sm">Interactive mini-game</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Coins className="w-5 h-5" />
                      <span className="text-xl font-bold">{checkpoint.reward}</span>
                    </div>
                    <p className="text-gray-400 text-sm">Token Reward</p>
                  </div>
                </div>

                <button
                  onClick={handleStartTask}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Challenge</span>
                </button>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Location</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-5 h-5" />
                  <div>
                    <p className="font-mono text-sm">
                      {checkpoint.latitude.toFixed(6)}, {checkpoint.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-400">Latitude, Longitude</p>
                  </div>
                </div>

                <button
                  onClick={handleViewOnMap}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Participations</span>
                  </div>
                  <span className="text-white font-bold">{checkpoint.participations || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Total Rewards</span>
                  </div>
                  <span className="text-yellow-400 font-bold">
                    {((checkpoint.participations || 0) * (checkpoint.reward || 100)).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Created</span>
                  </div>
                  <span className="text-white text-sm">
                    {formatDate(checkpoint.createdAt).split(',')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Sponsor Info */}
            {checkpoint.sponsorName && (
              <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sponsor</h3>
                
                <div className="flex items-center space-x-3">
                  {checkpoint.logoUrl ? (
                    <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden border border-white/20">
                      <img
                        src={checkpoint.logoUrl}
                        alt={`${checkpoint.sponsorName} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center border border-white/20">
                      <MapPin className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">{checkpoint.sponsorName}</p>
                    <p className="text-gray-400 text-sm">Checkpoint Sponsor</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckpointDetailPage;
