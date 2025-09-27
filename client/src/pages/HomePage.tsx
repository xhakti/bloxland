import "../App.css";
import RotatingGlobe from "../components/ui/RotatingGlobe";
import Gameplay from "../components/ui/Gameplay";
import HowItWorks from "../components/ui/HowItWorks";
import RealRewards from "../components/ui/RealRewards";

const HomePage = () => {
  return (
    <div
      className="min-h-[100dvh] w-full text-white overflow-x-hidden"
      style={{
        backgroundColor: "#000000",
        opacity: 1,
        backgroundImage:
          "radial-gradient(#3a3838 0.5px, transparent 0.5px), radial-gradient(#3a3838 0.5px, #000000 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
      }}
    >
      <div className="min-h-[100dvh] w-full">
        <div className="w-full min-h-[100dvh]">
          {/* Header */}
          <div className="flex items-center p-4">
            <img src="./logo.png" alt="logo" className="w-8 h-8 sm:w-10 sm:h-10" />
            <p className="text-xl sm:text-2xl font-bold ml-2">BLOXLAND</p>
          </div>
          
          {/* Main Content */}
          <div className=" h-[calc(100dvh-72px)] ">
            {/* Mobile Layout (Stacked) */}
            <div className="lg:hidden flex flex-col h-full">
               {/* Content Section - Mobile */}
               <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 px-6 sm:px-8">
                 <div className="space-y-3 sm:space-y-4 text-center">
                   <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                     Walk. Discover. Collect.
                   </h1>
                   <p className="text-base sm:text-lg text-white leading-relaxed max-w-md mx-auto px-2">
                     The revolutionary Web3 game where your real-world steps unlock digital treasures at every checkpoint.
                   </p>
                   <p className="text-sm sm:text-base text-white max-w-sm mx-auto px-2">
                     Explore your city, complete challenges, and earn crypto rewards while building your unique avatar collection.
                   </p>
                 </div>
                
                 {/* Buttons - Mobile */}
                 <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 px-4 sm:px-0 sm:justify-center">
                   <button className="px-6 sm:px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95">
                     Start Exploring
                   </button>
                   <button className="px-6 sm:px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300">
                     View Rewards
                   </button>
                 </div>
              </div>
              
              <div className="h-64 sm:h-80 w-full">
                <RotatingGlobe />
              </div>
            </div>
            
             <div className="hidden lg:grid lg:grid-cols-2 gap-8 h-full">
               <div className="flex flex-col justify-center space-y-6 px-8 xl:px-12">
                 <div className="space-y-4">
                   <h1 className="text-4xl xl:text-6xl font-bold text-white leading-tight">
                     Walk. Discover. Collect.
                   </h1>
                   <p className="text-lg xl:text-xl text-white leading-relaxed pr-4">
                     The revolutionary Web3 game where your real-world steps unlock digital treasures at every checkpoint.
                   </p>
                   <p className="text-base xl:text-lg text-white pr-4">
                     Explore your city, complete challenges, and earn crypto rewards while building your unique avatar collection.
                   </p>
                 </div>
                 <div className="flex space-x-4 mt-8">
                   <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                     Start Exploring
                   </button>
                   <button className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300">
                     View Rewards
                   </button>
                 </div>
              </div>
              <div className="h-full">
                <RotatingGlobe />
              </div>
            </div>
           </div>
         </div>
       </div>
       
      {/* Gameplay Section */}
      <Gameplay />
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* Real Rewards Section */}
      <RealRewards />
      
    </div>
   );
 };

export default HomePage;
