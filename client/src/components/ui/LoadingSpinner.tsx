const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
    );
};

export default LoadingSpinner;
