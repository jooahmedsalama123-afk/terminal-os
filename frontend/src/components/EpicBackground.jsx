import React from 'react';

export default function EpicBackground() {
  return (
    <div className="epic-bg-container">
      {/* Dynamic Gradient Blobs */}
      <div className="epic-blob blob-1"></div>
      <div className="epic-blob blob-2"></div>
      <div className="epic-blob blob-3"></div>
      
      {/* Subtle Grid Overlay */}
      <div className="epic-grid-overlay"></div>

      {/* Floating Particles */}
      <div className="particles-layer">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="epic-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
              opacity: Math.random() * 0.5 + 0.1,
              transform: `scale(${Math.random() * 1.5 + 0.5})`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
