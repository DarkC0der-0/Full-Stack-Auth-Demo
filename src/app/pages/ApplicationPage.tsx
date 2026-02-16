import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { protectedApi, WelcomeResponse } from '../services/api';
import { LogOut, User, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function ApplicationPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [welcomeData, setWelcomeData] = useState<WelcomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWelcomeData = async () => {
      try {
        const data = await protectedApi.getWelcome();
        setWelcomeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        // If unauthorized, redirect to signin
        if (err instanceof Error && err.message.includes('401')) {
          signOut();
          navigate('/signin');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWelcomeData();
  }, [signOut, navigate]);

  const handleLogout = () => {
    signOut();
    navigate('/signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.header 
        className="bg-white shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div 
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <User className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{welcomeData?.user?.name || user?.name}</h2>
                <p className="text-sm text-gray-500">{welcomeData?.user?.email || user?.email}</p>
              </div>
            </motion.div>
            
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <LogOut className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Logout</span>
              <span className="absolute inset-0 bg-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-12 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}
        >
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
              whileHover={{ scale: 1.1, rotate: 360 }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {welcomeData?.message || 'Welcome to the application'}
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              You have successfully signed in to your account. This is your protected application dashboard.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div 
                className="p-6 bg-blue-50 rounded-xl cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)' }}
              >
                <motion.div 
                  className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </motion.div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
                <p className="text-sm text-gray-600">
                  Your account is protected with authentication
                </p>
              </motion.div>

              <motion.div 
                className="p-6 bg-indigo-50 rounded-xl cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)' }}
              >
                <motion.div 
                  className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </motion.div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast</h3>
                <p className="text-sm text-gray-600">
                  Quick and responsive user experience
                </p>
              </motion.div>

              <motion.div 
                className="p-6 bg-purple-50 rounded-xl cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(147, 51, 234, 0.5)' }}
              >
                <motion.div 
                  className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                </motion.div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy</h3>
                <p className="text-sm text-gray-600">
                  Simple and intuitive interface
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}