'use client'

import React, { useState } from 'react'
import { AlertCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { authService } from '@/services/auth'
import Link from 'next/link'

interface KYCBannerProps {
  status: string;
  onRefresh?: () => void;
}

export const KYCBanner = ({ status, onRefresh }: KYCBannerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartKYC = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await authService.submitKYC();
      if (response.status === 'success' && response.url) {
        window.location.href = response.url;
      } else {
        setError('Failed to initiate verification. Please try again.');
      }
    } catch (err: any) {
      setError(err || 'Verification service unavailable');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'verified') {
    return (
      <div className="card-zed glass-premium border-zed-success/40 mb-8 flex items-center justify-between animate-zed-fade-up">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zed-success/20 rounded-full text-zed-success floating">
            <CheckCircle size={20} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div>
            <h3 className="font-bold text-zed-success mb-0.5 glow-counter text-sm">Identity Verified</h3>
            <p className="text-[10px] text-zed-foreground-secondary uppercase tracking-widest font-black">Ready for the Arena</p>
          </div>
        </div>
        <div className="badge-success glow-success">
          <span>Verified</span>
        </div>
      </div>
    );
  }

  if (status === 'pending' || status === 'review') {
    return (
      <div className="card-zed glass-premium border-yellow-500/40 mb-8 flex items-center justify-between animate-zed-fade-up">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-500 floating-delayed">
            <Clock size={20} className="drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
          </div>
          <div>
            <h3 className="font-bold text-yellow-500 mb-0.5 text-sm">Verification Under Review</h3>
            <p className="text-[10px] text-zed-foreground-secondary uppercase tracking-widest font-black">Est. 24 Hours</p>
          </div>
        </div>
        <button onClick={onRefresh} className="btn-secondary text-[10px] py-1 px-4 click-push">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="card-zed glass-premium border-zed-primary/40 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-zed-fade-up perspective-1000 tilt-3d">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-zed-primary/20 rounded-2xl text-zed-primary floating">
          <AlertCircle size={32} className="drop-shadow-[0_0_12px_rgba(79,70,229,1)]" />
        </div>
        <div>
          <h3 className="text-xl font-black text-zed-foreground mb-1 tracking-tight">Access Restricted</h3>
          <p className="text-sm text-zed-foreground-secondary max-w-sm leading-relaxed">
            Verify your identity via <span className="text-zed-primary font-bold">Didit.me</span> to unlock submissions and prize pool eligibility.
          </p>
          {error && <p className="text-xs text-red-500 mt-2 font-bold animate-pulse">{error}</p>}
        </div>
      </div>
      <button 
        disabled={loading}
        onClick={handleStartKYC}
        className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm glow-primary click-push"
      >
        {loading ? 'Initiating...' : 'Start 3D Verification'}
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
