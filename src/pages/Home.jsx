// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Rocket, Cpu, Stars } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white min-h-screen flex flex-col font-[Inter] overflow-x-hidden">
      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-gray-800 backdrop-blur-md bg-white/5 sticky top-0 z-50">
        <motion.h1
          className="text-2xl font-extrabold tracking-wide flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Cpu className="text-indigo-400 w-6 h-6" />
          AI Startup Partner
        </motion.h1>

        <nav className="space-x-6 flex items-center">
          <Link to="/login" className="hover:text-indigo-400 transition">
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full transition shadow-md hover:shadow-indigo-500/30"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-28 px-6 relative">
        <motion.div
          className="absolute -top-10 -z-10 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.h1
          className="text-6xl font-extrabold max-w-4xl leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Build Your <span className="text-indigo-500">Dream Startup</span> with{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">AI</span>
        </motion.h1>
        <motion.p
          className="mt-6 text-gray-400 max-w-xl text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Instantly generate startup ideas, names, taglines, and investor-ready pitches — powered by your AI co-founder.
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/register"
            className="mt-10 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-purple-500/30 transition"
          >
            <Rocket className="w-5 h-5" />
            Try Now — It’s Free
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-10 mt-32 px-10 text-center">
        {[
          {
            icon: <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-4" />,
            title: "AI-Powered Ideas",
            desc: "Get unique startup names and taglines that stand out instantly.",
          },
          {
            icon: <Stars className="w-8 h-8 text-purple-400 mx-auto mb-4" />,
            title: "Instant Copywriting",
            desc: "Generate hero texts, descriptions, and slogans with one click.",
          },
          {
            icon: <Rocket className="w-8 h-8 text-pink-400 mx-auto mb-4" />,
            title: "Pitch Like a Pro",
            desc: "Craft problem and solution statements that impress investors.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-b from-gray-900/70 to-gray-950/40 border border-gray-800 rounded-2xl p-10 backdrop-blur-md hover:-translate-y-2 transition transform shadow-lg hover:shadow-indigo-500/10"
            whileHover={{ scale: 1.05 }}
          >
            {item.icon}
            <h3 className="text-xl font-semibold mb-3 text-indigo-400">
              {item.title}
            </h3>
            <p className="text-gray-400">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA Footer */}
      <footer className="text-center mt-32 mb-10">
        <motion.h2
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Ready to bring your idea to life?
        </motion.h2>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/register"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-10 py-4 rounded-full font-semibold shadow-md hover:shadow-purple-500/30 transition text-lg"
          >
            Generate My Startup 🚀
          </Link>
        </motion.div>
        <p className="text-gray-500 mt-10 text-sm">
          © 2025 AI Startup Partner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
