'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTestStore } from '@/stores/test-store';
import { HeroLanding } from '@/components/ui/HeroLanding';
import { Consent } from '@/components/test/Consent';
import { AssessmentStage } from '@/components/test/AssessmentStage';
import { Checkpoint } from '@/components/test/Checkpoint';
import { ReportDashboard } from '@/components/report/ReportDashboard';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const phase = useTestStore((s) => s.phase);
  const currentDimIndex = useTestStore((s) => s.currentDimIndex);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4efe6] text-stone-800">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#8b2626] animate-ping" />
          <span className="text-xs font-mono tracking-widest text-stone-600">
            KHỞI TẠO MVAB v2.1...
          </span>
        </div>
      </div>
    );
  }

  const renderCurrentPhase = () => {
    switch (phase) {
      case 'landing':
        return <HeroLanding key="landing" />;
      case 'consent':
        return <Consent key="consent" />;
      case 'test':
        return <AssessmentStage key={`test-${currentDimIndex}`} />;
      case 'checkpoint':
        return <Checkpoint key={`checkpoint-${currentDimIndex}`} />;
      case 'report':
        return <ReportDashboard key="report" />;
      default:
        return <HeroLanding key="default" />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${phase}-${phase === 'test' || phase === 'checkpoint' ? currentDimIndex : ''}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="w-full h-full"
      >
        {renderCurrentPhase()}
      </motion.div>
    </AnimatePresence>
  );
}
