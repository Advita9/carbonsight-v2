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
import { Link, useLocation } from "react-router-dom";
import CarbonMeter from "./CarbonMeter";

const NAV_LINKS = [
  { path: "/dashboard", label: "My Stats" },
  { path: "/team",      label: "Team" },
  { path: "/leaderboard", label: "Leaderboard" },
  { path: "/admin",     label: "Admin" },
];

export default function Navbar({ carbonData, modelUsed, isCached }) {
  const location = useLocation();

  return (
    <nav className="w-full px-6 py-4 border-b border-white/10 bg-[#0F1012] flex items-center justify-between">

      {/* Brand */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-semibold tracking-wide hover:text-green-400 transition">
          Carbonsight
        </Link>

        {/* Dashboard nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ path, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  active
                    ? "bg-green-500/20 text-green-400 font-medium"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
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
          <div className="text-xs text-white/40">No carbon data yet</div>
        )}
      </div>

    </nav>
  );
}
