"use client";

import React, { useState, useEffect } from 'react';
import { BellRing, X } from 'lucide-react';
import { subscribeToPushNotifications } from '../lib/pushNotifications';

const NotificationPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Only show if supported and permission not yet granted/denied
    if (!('Notification' in window)) return;

    const checkPermission = async () => {
      // If already granted, no need to show
      if (Notification.permission === 'granted') return;
      
      // If denied, don't nag too much, but maybe show after some time? 
      // For now, only show if default (not yet asked)
      if (Notification.permission === 'default') {
        // Check localStorage to see if user dismissed it recently
        const lastDismissed = localStorage.getItem('notification_prompt_dismissed');
        const now = Date.now();
        
        // Show if never dismissed or dismissed more than 3 days ago
        if (!lastDismissed || now - parseInt(lastDismissed) > 3 * 24 * 60 * 60 * 1000) {
          // Delay a bit to let the page load
          const timer = setTimeout(() => setIsVisible(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    setStatus('loading');
    try {
      await subscribeToPushNotifications();
      setStatus('success');
      // Hide after success
      setTimeout(() => setIsVisible(false), 2000);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setStatus('error');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('notification_prompt_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-dock bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <BellRing className="text-amber-400" size={20} />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Stay Updated!</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Enable notifications for your daily mess menu alerts.</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleEnable}
            disabled={status === 'loading'}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
              status === 'success' ? 'bg-emerald-500 text-white' :
              status === 'error' ? 'bg-red-500 text-white' :
              'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {status === 'loading' ? 'Enabling...' : 
             status === 'success' ? 'Notifications Enabled!' :
             status === 'error' ? 'Failed - Try Again' :
             'Enable Mess Alerts'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-white/10 text-white hover:bg-white/5 transition-all"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
