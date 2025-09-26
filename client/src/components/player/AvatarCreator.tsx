import React, { useState } from 'react';
import Button from '../ui/Button';

interface AvatarCreatorProps {
    onAvatarCreated: (avatarUrl: string) => void;
}

const AvatarCreator: React.FC<AvatarCreatorProps> = ({ onAvatarCreated }) => {
    const [avatarUrl, setAvatarUrl] = useState('');

    const handleCreate = () => {
        if (avatarUrl.trim()) {
            onAvatarCreated(avatarUrl.trim());
        }
    };

    const handleUseDefault = () => {
        const defaultAvatarUrl = 'https://api.readyplayer.me/v1/avatars/default.glb';
        onAvatarCreated(defaultAvatarUrl);
    };

    return (
        <div className="text-white">
            <h2 className="text-xl font-bold mb-4">Create Your Avatar</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Ready Player Me URL:
                </label>
                <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://api.readyplayer.me/v1/avatars/..."
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                />
            </div>

            <div className="flex space-x-2">
                <Button onClick={handleCreate}>
                    Create Avatar
                </Button>
                <Button onClick={handleUseDefault} variant="secondary">
                    Use Default
                </Button>
            </div>
        </div>
    );
};

export default AvatarCreator;
