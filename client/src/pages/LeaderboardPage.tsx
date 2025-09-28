import "../App.css";
import { useLeaderboard } from "../hooks/useApi";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const LeaderboardPage = () => {
  const { isAuthenticated, isConnected, isOnCorrectNetwork, username, address } = useAuthStore();
  const { data, isLoading, error } = useLeaderboard();

  const formatDistance = (distance: string) => {
    const num = parseFloat(distance);
    if (num === 0) return "0 km";
    if (num < 1) return `${(num * 1000).toFixed(0)} m`;
    return `${num.toFixed(2)} km`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-white";
      case 1:
        return "text-gray-300";
      case 2:
        return "text-gray-400";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-[100dvh] w-full text-white overflow-x-hidden relative" style={{ backgroundColor: "#000000" }}>
      {/* Background Image with low opacity */}
      <div
        className="absolute inset-0 w-full h-full grayscale-75"
        style={{
          backgroundImage: "url('./bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.05,
        }}
      ></div>
      <div className="min-h-[100dvh] w-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="./logo.png" alt="logo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <p className="text-xl sm:text-2xl font-bold ml-2">BLOXLAND</p>
            </Link>
          </div>

          {/* Auth Status Indicator */}
          {isConnected && (
            <div className="hidden sm:flex items-center space-x-2 text-xs overflow-hidden">
              {isAuthenticated && isOnCorrectNetwork ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white">Authenticated</span>
                  {username && (
                    <span className="text-gray-400">({username})</span>
                  )}
                </div>
              ) : isConnected && !isOnCorrectNetwork ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Wrong Network</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500">Setup Incomplete</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="h-[calc(100dvh-72px)] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Leaderboard
              </h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
                See how you stack up against other explorers in the BLOXLAND universe
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-white font-semibold mb-2">Error Loading Leaderboard</h3>
                  <p className="text-gray-300 text-sm">
                    {error.message || "Failed to load leaderboard data"}
                  </p>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            {data && data.data && (
              <div className="space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {data.data.pagination.totalCount}
                    </div>
                    <div className="text-sm text-gray-300">Total Players</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {data.data.users.reduce((sum, user) => sum + (user.checkpointsConquered || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-300">Checkpoints Conquered</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {data.data.users.reduce((sum, user) => sum + parseFloat(user.distanceTravelled || "0"), 0).toFixed(2)} km
                    </div>
                    <div className="text-sm text-gray-300">Total Distance</div>
                  </div>
                </div>

                {/* Leaderboard List */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
                  <div className="bg-white/10 px-6 py-4 border-b border-white/20">
                    <h2 className="text-lg font-semibold text-white">Top Explorers</h2>
                  </div>

                  <div className="divide-y divide-white/10">
                    {data.data.users.map((user, index) => (
                      <div
                        key={user.id}
                        className={`px-6 py-4 hover:bg-white/5 transition-colors ${user.userAddress === address ? "bg-blue-500/20 border-l-4 border-blue-400" : ""
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Rank */}
                            <div className={`text-2xl font-bold ${getRankColor(index)}`}>
                              {getRankIcon(index)}
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-white">
                                  {user.username}
                                </h3>
                                {user.userAddress === address && (
                                  <span className="bg-white text-black text-xs px-2 py-1 rounded-full font-semibold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-400 font-mono">
                                  {formatAddress(user.userAddress)}
                                </span>
                                <span className="text-sm text-gray-400">
                                  Level {user.level}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-6 text-right">
                            <div>
                              <div className="text-lg font-semibold text-white">
                                {formatDistance(user.distanceTravelled || "0")}
                              </div>
                              <div className="text-xs text-gray-400">Distance</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-white">
                                {user.checkpointsConquered || 0}
                              </div>
                              <div className="text-xs text-gray-400">Checkpoints</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination Info */}
                {data.data.pagination && (
                  <div className="text-center text-sm text-gray-400">
                    Showing {data.data.users.length} of {data.data.pagination.totalCount} players
                    {(data.data.pagination.page < data.data.pagination.totalPages) && (
                      <span className="ml-2">• More players available</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {data && data.data && data.data.users.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md mx-auto">
                  <h3 className="text-white font-semibold mb-2">No Players Yet</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Be the first to explore and conquer checkpoints!
                  </p>
                  <Link
                    to="/connect"
                    className="inline-block px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors border-2 border-white"
                  >
                    Start Playing
                  </Link>
                </div>
              </div>
            )}

            {/* Call to Action */}
            {!isAuthenticated && (
              <div className="mt-12 text-center">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-white font-semibold mb-2">Join the Competition</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Connect your wallet and start exploring to climb the leaderboard!
                  </p>
                  <Link
                    to="/connect"
                    className="inline-block px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors border-2 border-white"
                  >
                    Connect Wallet
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

