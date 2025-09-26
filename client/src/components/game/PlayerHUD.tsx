import React from 'react';

interface PlayerHUDProps {
    userLocation: [number, number] | null;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({ userLocation }) => {
    return (
        <div className="absolute top-4 left-4 z-10">
            <div className="bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
                <h3 className="font-semibold mb-2">Player Info</h3>
                <div className="text-sm">
                    <p>Location: {userLocation ? `${userLocation[1].toFixed(4)}, ${userLocation[0].toFixed(4)}` : 'Unknown'}</p>
                    <p>Status: Online</p>
                </div>
            </div>
        </div>
    );
};

export default PlayerHUD;
