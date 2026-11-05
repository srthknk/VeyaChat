import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-primary to-[#075e54] text-white flex flex-col items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Veya</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Private, real-time conversations
        </p>
        <p className="text-lg mb-12 max-w-2xl opacity-80">
          Find people by username, share your profile, and keep conversations close.
        </p>

        <div className="space-y-4 flex flex-col items-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:shadow-lg transition transform hover:scale-105"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary transition"
          >
            Register
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
      >
        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
          <h3 className="text-xl font-bold mb-2">🔒 Secure</h3>
          <p>End-to-end encrypted messages</p>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
          <h3 className="text-xl font-bold mb-2">⚡ Fast</h3>
          <p>Real-time communication with Socket.IO</p>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
          <h3 className="text-xl font-bold mb-2">✨ Smart</h3>
          <p>See drafts before messages are sent</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
