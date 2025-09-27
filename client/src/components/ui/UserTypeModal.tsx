import React from 'react';
import { User, Building2, X } from 'lucide-react';

interface UserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUserType: (userType: 'user' | 'sponsor') => void;
}

const UserTypeModal: React.FC<UserTypeModalProps> = ({ isOpen, onClose, onSelectUserType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/20 rounded-lg max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-white text-xl font-bold">Choose Your Role</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-sm mb-6 text-center">
            Select how you want to use Bloxland
          </p>

          <div className="space-y-4">
            {/* User Option */}
            <button
              onClick={() => onSelectUserType('user')}
              className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold text-lg">User</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Explore the map, discover checkpoints, and earn rewards by completing tasks
                  </p>
                </div>
              </div>
            </button>

            {/* Sponsor Option */}
            <button
              onClick={() => onSelectUserType('sponsor')}
              className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                  <Building2 className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold text-lg">Sponsor</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Create branded checkpoints, set rewards, and engage with the community
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-gray-500 text-xs text-center">
            You can change your role later in settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserTypeModal;
