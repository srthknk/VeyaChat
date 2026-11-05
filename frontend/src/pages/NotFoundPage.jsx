import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center px-4"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl text-textSecondary mb-8">Page Not Found</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-[#075e54] transition"
        >
          Go Home
        </button>
      </div>
    </motion.div>
  );
}
