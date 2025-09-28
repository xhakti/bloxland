import "../App.css";
import Hero from "../components/ui/Hero";
import Gameplay from "../components/ui/Gameplay";
import HowItWorks from "../components/ui/HowItWorks";
import RealRewards from "../components/ui/RealRewards";
import BloxlandCheckpoints from "../components/ui/BloxlandCheckpoints";

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
        
        {/* Bloxland Checkpoints Section */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <BloxlandCheckpoints />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
