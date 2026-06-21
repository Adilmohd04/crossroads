'use client';

import React from 'react';

export default function PhaseDivider() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #dedad2, transparent)' }} />
      <div className="mx-6 h-2 w-2 rounded-full" style={{ background: '#2d6a4f' }} />
      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #dedad2, transparent)' }} />
    </div>
  );
}
