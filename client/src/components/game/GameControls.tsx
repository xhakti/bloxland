import React from 'react';
import Button from '../ui/Button';

const GameControls: React.FC = () => {
    const handleSettings = () => {
        console.log('Open settings');
    };

    return (
        <div className="absolute bottom-4 right-4 z-10">
            {/* <div className="flex flex-col space-y-2">
                <Button onClick={handleSettings} variant="secondary">
                    Settings
                </Button>
            </div> */}
        </div>
    );
};

export default GameControls;
