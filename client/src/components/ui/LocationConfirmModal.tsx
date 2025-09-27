import React from 'react';
import { MapPin, Check, X } from 'lucide-react';

interface LocationConfirmModalProps {
  isOpen: boolean;
  location: [number, number] | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const LocationConfirmModal: React.FC<LocationConfirmModalProps> = ({
  isOpen,
  location,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/20">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Location Info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Confirm Location</h3>
              <p className="text-gray-400 text-sm font-mono">
                {location[1].toFixed(6)}, {location[0].toFixed(6)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Cancel</span>
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">Confirm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirmModal;
