import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:justify-end">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ x: '100%', opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white relative z-10 w-full max-w-sm h-full max-h-[800px] md:h-auto md:min-h-screen rounded-2xl md:rounded-l-2xl md:rounded-r-none flex flex-col shadow-2xl overflow-hidden md:fixed md:right-0 md:top-0"
          >
            {/* Header Area */}
            <div className="bg-primary/10 p-6 flex items-start justify-between">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center font-black text-primary text-2xl shadow-sm border-4 border-white">
                {user.initials}
              </div>
              <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider rounded-full mb-6">
                {user.role}
              </div>

              <div className="space-y-6">
                {/* Info Block */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Account Details</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email || `${user.initials.toLowerCase()}@foodbridge.com`}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      Member since Jan 2026
                    </div>
                  </div>
                </div>

                {/* Trust Score Block */}
                {user.role !== 'admin' && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Performance</h3>
                    <div className={clsx("rounded-xl p-5 flex items-center gap-4", user.trustScore >= 80 ? "bg-green-50" : user.trustScore >= 50 ? "bg-amber-50" : "bg-red-50")}>
                      <Shield className={clsx("w-8 h-8", user.trustScore >= 80 ? "text-green-500" : user.trustScore >= 50 ? "text-amber-500" : "text-red-500")} />
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Trust Score</div>
                        <div className="text-2xl font-black">{user.trustScore}<span className="text-sm font-semibold text-gray-400">/100</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Block */}
                {user.role !== 'admin' && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Activity</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <CheckCircle className="w-5 h-5 text-primary mb-2" />
                        <div className="text-2xl font-black">{user.role === 'donor' ? user.donationCount : user.completedPickups}</div>
                        <div className="text-xs font-bold text-gray-500">{user.role === 'donor' ? 'Donations' : 'Pickups'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <Clock className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="text-2xl font-black">100%</div>
                        <div className="text-xs font-bold text-gray-500">On-Time Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Close
              </button>
              <button onClick={() => { onClose(); logout(); }} className="flex-1 py-3 bg-red-50 border border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors">
                Log Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
