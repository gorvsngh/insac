'use client';

import React from 'react';

interface WordCounterProps {
  currentCount: number;
  maxLimit: number;
}

export default function WordCounter({ currentCount, maxLimit }: WordCounterProps) {
  const percentage = Math.min(100, Math.round((currentCount / maxLimit) * 100));
  const isOver = currentCount > maxLimit;
  const isClose = currentCount >= maxLimit * 0.9 && !isOver;

  let progressColor = 'var(--teal-500)';
  if (isOver) progressColor = 'var(--danger-500)';
  else if (isClose) progressColor = 'var(--gold-500)';

  return (
    <div style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
        <span style={{ color: isOver ? 'var(--danger-500)' : 'var(--slate-500)', fontWeight: isOver ? 700 : 500 }}>
          {currentCount} / {maxLimit} words
          {isOver && ` (${currentCount - maxLimit} words over limit)`}
        </span>
        <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
          Configurable abstract limit: {maxLimit} words
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'var(--slate-200)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '0.25rem',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: progressColor,
          transition: 'width 0.2s ease, background-color 0.2s ease',
        }} />
      </div>
    </div>
  );
}
