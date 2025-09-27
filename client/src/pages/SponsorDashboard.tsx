import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Trophy, Eye, Calendar, Coins } from 'lucide-react';

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

const SponsorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [stats, setStats] = useState({
    totalCheckpoints: 0,
    totalParticipations: 0,
    totalRewardsDistributed: 0,
  });

  useEffect(() => {
    loadCheckpoints();
  }, []);

  const loadCheckpoints = () => {
    try {
      const savedCheckpoints = localStorage.getItem('checkpoints');
      if (savedCheckpoints) {
        const allCheckpoints: Checkpoint[] = JSON.parse(savedCheckpoints);
        // Filter only sponsor checkpoints (ones with sponsorName)
        const sponsorCheckpoints = allCheckpoints.filter(cp => cp.sponsorName);
        setCheckpoints(sponsorCheckpoints);
        
        // Calculate stats
        const totalParticipations = sponsorCheckpoints.reduce((sum, cp) => sum + (cp.participations || 0), 0);
        const totalRewardsDistributed = totalParticipations * 100; // 100 tokens per participation
        
        setStats({
          totalCheckpoints: sponsorCheckpoints.length,
          totalParticipations,
          totalRewardsDistributed,
        });
      }
    } catch (error) {
      console.error('Error loading checkpoints:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const viewOnMap = (checkpoint: Checkpoint) => {
    // Navigate to game page and center on checkpoint
    navigate('/game', { 
      state: { 
        centerLocation: [checkpoint.longitude, checkpoint.latitude],
        zoom: 18 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg border border-white/20"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Sponsor Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage your checkpoints and track engagement</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Create Checkpoint</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Checkpoints</p>
                <p className="text-2xl font-bold text-white">{stats.totalCheckpoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Participations</p>
                <p className="text-2xl font-bold text-white">{stats.totalParticipations}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Rewards Distributed</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.totalRewardsDistributed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkpoints List */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white">Your Checkpoints</h2>
            <p className="text-gray-400 text-sm mt-1">Monitor performance and engagement</p>
          </div>

          {checkpoints.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Checkpoints Yet</h3>
              <p className="text-gray-400 mb-6">Create your first sponsored checkpoint to start engaging with users</p>
              <button
                onClick={() => navigate('/create')}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors"
              >
                Create Your First Checkpoint
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/20">
              {checkpoints.map((checkpoint) => (
                <div key={checkpoint.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Logo */}
                      {checkpoint.logoUrl ? (
                        <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden border border-white/20">
                          <img
                            src={checkpoint.logoUrl}
                            alt={`${checkpoint.sponsorName} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                          <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{checkpoint.name}</h3>
                          <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">
                            {checkpoint.sponsorName}
                          </span>
                        </div>
                        
                        {checkpoint.description && (
                          <p className="text-gray-300 text-sm mb-3 max-w-2xl">
                            {checkpoint.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created {formatDate(checkpoint.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{checkpoint.participations || 0} participations</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-4 h-4" />
                            <span>{checkpoint.task}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400">{checkpoint.reward} tokens</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewOnMap(checkpoint)}
                        className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View on Map</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;
