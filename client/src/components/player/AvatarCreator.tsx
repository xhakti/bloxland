/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Button from '../ui/Button';

interface AvatarCreatorProps {
    onAvatarCreated: (avatarUrl: string) => void;
    onClose?: () => void;
}

const AvatarCreator: React.FC<AvatarCreatorProps> = ({ onAvatarCreated, onClose }) => {
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Some sample Ready Player Me avatar URLs for testing
    const sampleAvatars = [
        'https://d1a370nemizbjq.cloudfront.net/b69e04ec-6ca7-4b67-aa4f-dd0ebe88a973.glb',
        'https://d1a370nemizbjq.cloudfront.net/f9deab8a-7a0e-4d05-9da4-94b25f86158c.glb',
        'https://d1a370nemizbjq.cloudfront.net/2b6f0c64-b6a8-4a8b-9b4f-c1e2a8a1e4d3.glb'
    ];

    const handleCreate = async () => {
        if (!avatarUrl.trim()) return;

        setIsLoading(true);
        try {
            // You could add validation here to check if the URL is valid
            onAvatarCreated(avatarUrl.trim());
        } catch (error) {
            console.error('Error creating avatar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseSample = (url: string) => {
        setAvatarUrl(url);
    };

    return (
        <div className="bg-black/80 backdrop-blur-lg rounded-lg p-6 text-white max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Load Avatar</h2>
                {onClose && (
                    <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">
                        ×
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Ready Player Me Avatar URL:
                    </label>
                    <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://d1a370nemizbjq.cloudfront.net/..."
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-white/50 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Or choose a sample avatar:
                    </label>
                    <div className="space-y-2">
                        {sampleAvatars.map((url, index) => (
                            <button
                                key={index}
                                onClick={() => handleUseSample(url)}
                                className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-sm transition-colors"
                            >
                                Sample Avatar {index + 1}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex space-x-2 pt-2">
                    <Button
                        onClick={handleCreate}
                        className="flex-1"
                    >
                        {isLoading ? 'Loading...' : 'Load Avatar'}
                    </Button>
                    {onClose && (
                        <Button onClick={onClose} variant="secondary">
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-4 text-xs text-white/60">
                <p>Get your own avatar at: <br />
                    <a
                        href="https://readyplayer.me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                    >
                        readyplayer.me
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AvatarCreator;
