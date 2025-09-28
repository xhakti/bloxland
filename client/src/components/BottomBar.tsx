import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Home,
  Trophy,
  Settings,
  LogOut,
  User,
  MapPin,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useEnergyStore } from "../stores/energyStore";
import "../App.css";

interface BottomBarProps {
  username?: string;
  ensName?: string;
  onLogout: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  username,
  ensName,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { userType } = useAuthStore();
  const { resetEnergy } = useEnergyStore();
  const [pressTimer, setPressTimer] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-black grid-bg border-t border-white/20">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Bloxland" className="w-8 h-8" />
            <span className="text-white font-bold text-xl">BLOXLAND</span>
          </div>

          {/* Right Angle Button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors rounded-lg border border-white/20"
          >
            <ChevronRight
              className={`w-6 h-6 text-white transition-transform duration-300 ${showSidebar ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed right-0 bottom-0 top-0 z-60 w-80 bg-black border-l border-white/20 transform transition-transform duration-300 grid-bg  ease-in-out ${showSidebar ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-white font-medium text-lg">
                  {username || "Explorer"}
                </p>
                <p className="text-gray-400 text-sm">{ensName || "No ENS"}</p>
                {userType && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${userType === "sponsor"
                      ? "bg-yellow-400/20 text-yellow-400"
                      : "bg-blue-400/20 text-blue-400"
                      }`}
                  >
                    {userType === "sponsor" ? "Sponsor" : "User"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setShowSidebar(false);
                navigate("/");
              }}
              className="w-full flex items-center space-x-3 px-4 py-3  text-white hover:bg-white/20 backdrop-blur-sm bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-lg">Home</span>
            </button>

            {/* Sponsor-specific menu items */}
            {userType === "sponsor" && (
              <>
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    navigate("/sponsor-dashboard");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3  text-white hover:bg-white/20 backdrop-blur-sm bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg">Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setShowSidebar(false);
                    navigate("/create-checkpoint");
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-white bg-black hover:bg-white/10 border border-white/90 rounded-lg transition-colors"
                >
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg">Create Checkpoint</span>
                </button>
              </>
            )}

            {/* User-specific menu items */}
            {userType === "user" && (
              <button
                onClick={() => {
                  setShowSidebar(false);
                  navigate("/leaderboard");
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 backdrop-blur-sm bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <Trophy className="w-5 h-5" />
                <span className="text-lg">Leaderboard</span>
              </button>
            )}

            {/* Secret energy reset: long press (600ms) or double-click */}
            <button
              onDoubleClick={() => {
                resetEnergy();
                setShowSidebar(false);
              }}
              onMouseDown={() => {
                const timer = window.setTimeout(() => {
                  resetEnergy();
                  setShowSidebar(false);
                }, 600);
                setPressTimer(timer);
              }}
              onMouseUp={() => {
                if (pressTimer) {
                  window.clearTimeout(pressTimer);
                  setPressTimer(null);
                }
              }}
              onMouseLeave={() => {
                if (pressTimer) {
                  window.clearTimeout(pressTimer);
                  setPressTimer(null);
                }
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-white opacity-60 hover:opacity-90 hover:bg-white/5 rounded-lg transition-colors select-none"
            >
              <Settings className="w-5 h-5" />
              <span className="text-lg">Settings</span>
            </button>
            {/* Lighting Presets */}
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Lighting Presets
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Auto", value: "auto" },
                  { label: "Dawn", value: "dawn" },
                  { label: "Noon", value: "noon" },
                  { label: "Evening", value: "evening" },
                  { label: "Night", value: "night" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("lightPresetChange", {
                          detail: { preset: p.value },
                        })
                      );
                      setShowSidebar(false); // close after selection
                    }}
                    className="w-full px-3 py-2 text-xs font-medium rounded-md bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={() => {
                setShowSidebar(false);
                onLogout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 backdrop-blur-sm bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-lg">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay - Click outside to close sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </>
  );
};

export default BottomBar;
