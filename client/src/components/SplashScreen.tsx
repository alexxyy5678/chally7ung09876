import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <img
            src="/bantzzlogo.svg"
            alt="Bantzz Logo"
            className="w-32 h-32 mx-auto"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Chally7ung
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-slate-400"
        >
          Loading your challenges...
        </motion.p>
      </motion.div>
    </div>
  );
}