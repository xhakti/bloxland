/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDisconnect } from "wagmi";
import { useAuthStore } from "../stores/authStore";
import MapContainer from "../components/map/MapContainer";
import BottomBar from "../components/BottomBar";
import UserTypeModal from "../components/ui/UserTypeModal";
import useEnergyContract from "../hooks/contracts/useEnergyContract";
import useBloxLand from "../hooks/contracts/useBloxLand";

const GamePage: React.FC = () => {
    const navigate = useNavigate();
    const { disconnect } = useDisconnect();
    const { logout, username, ensName, userType, setUserType } = useAuthStore();
    const [showUserTypeModal, setShowUserTypeModal] = useState(false);

    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null
    );
    const [isMapReady, setIsMapReady] = useState(false);
    const [_mapInstance, setMapInstance] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const energy = useEnergyContract();
    const blox = useBloxLand();

    const tokenDecimals = useMemo(() => 18, []); // can fetch via energy.useDecimals()

    // Your provided Ready Player Me avatar URL
    const [avatarUrl] = useState<string>(
        "https://models.readyplayer.me/68c92d1a7a525019305da2eb.glb"
    );

    const handleUserLocationChange = useCallback(
        (location: [number, number] | null) => {
            console.log("Location changed to:", location);
            setUserLocation(location);
        },
        []
    );

    const handleMapReady = useCallback((map: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        // Don't log the entire map object, just set the state
        console.log("Map ready - avatar system initialized");
        setMapInstance(map);
        setIsMapReady(true);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            // Clear auth state
            logout();
            // Disconnect wallet
            disconnect();
            // Navigate to home page
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if disconnect fails, still clear auth and redirect
            logout();
            navigate("/");
        }
    }, [logout, disconnect, navigate]);

    // Show user type selection modal if user type is not set
    useEffect(() => {
        if (!userType) {
            setShowUserTypeModal(true);
        }
    }, [userType]);

    const handleUserTypeSelection = (selectedUserType: "user" | "sponsor") => {
        setUserType(selectedUserType);
        setShowUserTypeModal(false);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
            {/* Map Container with Ready Player Me Avatar */}
            <MapContainer
                onUserLocationChange={handleUserLocationChange}
                onMapReady={handleMapReady}
                avatarUrl={avatarUrl}
                showCheckpoints={true}
            />
            <BottomBar
                username={username || undefined}
                ensName={ensName || undefined}
                onLogout={handleLogout}
            />

            {/* User Type Selection Modal */}
            <UserTypeModal
                isOpen={showUserTypeModal}
                onClose={() => { }} // Prevent closing without selection
                onSelectUserType={handleUserTypeSelection}
            />
        </div>
    );
};

export default GamePage;
