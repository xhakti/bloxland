import "../App.css";
import Hero from "../components/ui/Hero";
import Gameplay from "../components/ui/Gameplay";
import HowItWorks from "../components/ui/HowItWorks";
import RealRewards from "../components/ui/RealRewards";

const HomePage = () => {
  return (
    <div className="w-full text-white overflow-x-hidden relative" style={{ backgroundColor: "#000000" }}>
      {/* Background Image with low opacity */}
      <div
        className="absolute inset-0 w-full h-full grayscale-75"
        style={{
          backgroundImage: "url('./bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.05,
        }}
      ></div>
      
      {/* Hero Section */}
      <div className="relative z-10">
        <Hero />
        <Gameplay />
        <HowItWorks />
        <RealRewards />
      </div>
    </div>
  );
};

export default HomePage;
