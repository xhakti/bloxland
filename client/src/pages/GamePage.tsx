// GamePage with energy accumulation based on distance travelled
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDisconnect } from "wagmi";
import { useAuthStore } from "../stores/authStore";
import MapContainer from "../components/map/MapContainer";
import BottomBar from "../components/BottomBar";
import UserTypeModal from "../components/ui/UserTypeModal";
import useEnergyContract from "../hooks/contracts/useEnergyContract";
import useBloxLand from "../hooks/contracts/useBloxLand";
import energyIcon from "../assets/energy.svg";
import { useEnergyStore } from "../stores/energyStore";

const GamePage: React.FC = () => {
    const navigate = useNavigate();
    const { disconnect } = useDisconnect();
    const { logout, username, ensName, userType, setUserType } = useAuthStore();
    const [showUserTypeModal, setShowUserTypeModal] = useState(false);

    const [userLocation, setUserLocation] = useState<[number, number] | null>(
        null
    );
    const [isMapReady, setIsMapReady] = useState(false);
    // Energy system from global store
    const { energyPoints, totalDistanceMeters, addDistance, MAX_ENERGY, METERS_PER_REWARD, ENERGY_PER_CHUNK } = useEnergyStore();
    // Refs for stable location diff
    const lastEnergyLocationRef = useRef<[number, number] | null>(null);
    const [_mapInstance, setMapInstance] = useState<any>(null);

    const energyContract = useEnergyContract();
    const blox = useBloxLand();

    const tokenDecimals = useMemo(() => 18, []); // can fetch via energy.useDecimals()

    // Your provided Ready Player Me avatar URL
    const [avatarUrl] = useState<string>(
        "https://models.readyplayer.me/68c92d1a7a525019305da2eb.glb"
    );

    const handleUserLocationChange = useCallback((location: [number, number] | null) => {
        setUserLocation(location);
        if (!location) return;
        const prev = lastEnergyLocationRef.current;
        if (prev) {
            const toRad = (d: number) => d * Math.PI / 180;
            const R = 6371000;
            const dLat = toRad(location[1] - prev[1]);
            const dLng = toRad(location[0] - prev[0]);
            const lat1 = toRad(prev[1]);
            const lat2 = toRad(location[1]);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const meters = R * c;
            addDistance(meters);
        }
        lastEnergyLocationRef.current = location;
    }, [addDistance]);

    const handleMapReady = useCallback((map: any) => {
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
            {/* Energy Bar */}
            <div className="absolute top-0 left-0 z-30 pl-4 pt-3 pointer-events-none select-none w-[min(520px,70%)]">
                <div className="bg-gray-950/90 backdrop-blur-sm border border-indigo-500/40 shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_16px_-2px_rgba(0,0,0,0.6),0_0_32px_-4px_rgba(79,70,229,0.35)] rounded-2xl px-4 py-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/15 via-fuchsia-500/10 to-cyan-400/15 pointer-events-none mix-blend-overlay" />
                    <div className="flex items-center gap-3 mb-2 relative">
                        <div className="relative">
                            <img src={energyIcon} alt="Energy" className="w-7 h-7 drop-shadow-md" />
                            <div className="absolute inset-0 animate-ping rounded-full bg-amber-300/30" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-white bg-clip-text text-transparent drop-shadow">ENERGY</span>
                        <span className="text-xs text-amber-200/90 font-mono">{energyPoints}/{MAX_ENERGY}</span>
                        <span className="ml-auto text-[10px] uppercase tracking-wider text-indigo-200/80 font-medium">
                            +{ENERGY_PER_CHUNK}/{METERS_PER_REWARD}m
                        </span>
                    </div>
                    {/* Bar */}
                    <div className="relative h-4 rounded-md bg-gradient-to-r from-gray-800/90 via-gray-800/70 to-gray-900/80 border border-gray-700/60 shadow-inner overflow-hidden">
                        <div
                            className="h-full rounded-md bg-[linear-gradient(120deg,#fcd34d,#fde68a_40%,#fca311_70%,#fcd34d)] bg-[length:200%_100%] animate-[pulse_6s_linear_infinite] shadow-[0_0_10px_-2px_rgba(252,211,77,0.8),0_0_30px_-4px_rgba(252,211,77,0.5)] transition-[width] duration-700 ease-out"
                            style={{ width: `${(energyPoints / MAX_ENERGY) * 100}%` }}
                        />
                        {/* Gloss */}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_60%)] mix-blend-overlay pointer-events-none" />
                        {/* Milestones */}
                        {[...Array(Math.floor(MAX_ENERGY / 50)).keys()].map(i => (
                            <div key={i} className="absolute top-0 bottom-0 w-px bg-amber-300/30" style={{ left: `${((i + 1) * 50 / MAX_ENERGY) * 100}%` }} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] font-mono tracking-wider">
                        <span className="text-indigo-200/70">{(totalDistanceMeters / 1000).toFixed(2)} km</span>
                        <span className="text-amber-300/80">{((energyPoints / MAX_ENERGY) * 100).toFixed(0)}%</span>
                    </div>
                    {/* Subtle corner accents */}
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-600/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -right-8 w-28 h-28 bg-fuchsia-500/20 rounded-full blur-3xl" />
                </div>
            </div>
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
