import { motion } from "framer-motion";

export default function PlanSteps({ steps }) {
  return (
    <div className="bg-[#1A1C1E] border border-white/10 p-4 rounded-xl shadow-lg max-w-2xl">
      <h3 className="text-green-400 font-semibold mb-3 text-sm tracking-wide">
        Eco-Plan Generated
      </h3>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="text-xs text-white/40 mb-1">
              Step {i + 1}
            </div>
            <div className="text-sm text-white">{step}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
