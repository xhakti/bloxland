import React from 'react';

interface GlassmorphismModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const GlassmorphismModal: React.FC<GlassmorphismModalProps> = ({
    isOpen,
    onClose,
    children
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 max-w-md w-full mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white hover:text-gray-300 text-2xl"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 ${className}`}>
            {children}
        </div>
    );
};
