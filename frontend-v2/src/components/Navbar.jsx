// // src/components/Navbar.jsx
// import CarbonMeter from "./CarbonMeter";

// export default function Navbar({ carbonData, modelUsed }) {
//   return (
//     <nav className="w-full px-6 py-4 border-b border-white/10 bg-[#0F1012] flex items-center justify-between">

//       {/* Brand */}
//       <div className="text-2xl font-semibold tracking-wide">
//         Carbonsight
//       </div>

//       {/* The Right Side: Carbon Bubble */}
//       <div className="flex items-center">
//         {carbonData ? (
//           <CarbonMeter carbon={carbonData} model={modelUsed} />
//         ) : (
//           <div className="text-xs text-white/40">
//             No carbon data yet
//           </div>
//         )}
//       </div>

//     </nav>
//   );
// }
// src/components/Navbar.jsx
import CarbonMeter from "./CarbonMeter";

export default function Navbar({ carbonData, modelUsed, isCached }) {
  return (
    <nav className="w-full px-6 py-4 border-b border-white/10 bg-[#0F1012] flex items-center justify-between">

      {/* Brand */}
      <div className="text-2xl font-semibold tracking-wide">
        Carbonsight
      </div>

      {/* Right side: Carbon bubble */}
      <div className="flex items-center">
        {isCached || carbonData ? (
          <CarbonMeter 
            carbon={carbonData} 
            model={modelUsed} 
            cached={isCached} 
          />
        ) : (
          <div className="text-xs text-white/40">
            No carbon data yet
          </div>
        )}
      </div>

    </nav>
  );
}
