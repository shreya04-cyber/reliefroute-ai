import React, { useState } from 'react';
import { Shield, Home, Users } from 'lucide-react';

export default function InteractiveMap({ requests, selectedRequestId, onSelectRequest, shelters }) {
  const [hoveredRequest, setHoveredRequest] = useState(null);

  // SVG dimensions
  const width = 600;
  const height = 340;

  // Coordinate boundaries
  const minLat = 22.500;
  const maxLat = 22.580;
  const minLng = 88.300;
  const maxLng = 88.400;

  // Translate lat/lng to SVG canvas x/y
  const getCoordinates = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * height;
    return { x, y };
  };

  // Determine marker color based on urgency score
  const getUrgencyColor = (score) => {
    if (score >= 8.5) return 'var(--color-critical)'; // Red
    if (score >= 7.0) return 'var(--color-high)';     // Orange
    if (score >= 4.0) return 'var(--color-medium)';   // Yellow
    return 'var(--color-low)';                        // Slate Grey
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px' }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="map-svg"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f1f5f9',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          display: 'block',
          cursor: 'grab'
        }}
      >
        {/* Grid Background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Legend / Sector Text */}
        <text x="20" y="30" fill="#94a3b8" fontSize="10" fontWeight="bold">SECTOR A (NORTH)</text>
        <text x="20" y="320" fill="#94a3b8" fontSize="10" fontWeight="bold">SECTOR C (SOUTH-WEST)</text>
        <text x="440" y="320" fill="#94a3b8" fontSize="10" fontWeight="bold">SECTOR D (EAST)</text>

        {/* River (Disaster Source) */}
        <path 
          d="M -20 120 C 150 100, 220 220, 360 210 C 500 200, 520 80, 620 60" 
          fill="none" 
          stroke="#93c5fd" 
          strokeWidth="32" 
          strokeLinecap="round"
          opacity="0.5" 
        />
        <path 
          d="M -20 120 C 150 100, 220 220, 360 210 C 500 200, 520 80, 620 60" 
          fill="none" 
          stroke="#60a5fa" 
          strokeWidth="8" 
          strokeLinecap="round"
          opacity="0.3" 
        />

        {/* Flooded Zones overlay (Red translucent areas) */}
        {/* Zone 1: West/Central Lowland */}
        <path 
          d="M -10 110 L 180 90 L 260 210 L 150 310 L -10 260 Z" 
          fill="var(--color-critical)" 
          opacity="0.08" 
        />
        <text x="70" y="180" fill="#f87171" fontSize="12" fontWeight="bold" opacity="0.6">ZONE 1 (HEAVILY FLOODED)</text>

        {/* Zone 2: East Bank Lowland */}
        <path 
          d="M 330 220 C 420 220, 500 180, 580 120 L 610 300 L 400 320 Z" 
          fill="var(--color-high)" 
          opacity="0.06" 
        />
        <text x="440" y="240" fill="#fb923c" fontSize="12" fontWeight="bold" opacity="0.6">ZONE 2 (MODERATE)</text>

        {/* Safe dry zone boundary */}
        <line x1="280" y1="0" x2="350" y2="340" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
        <text x="310" y="20" fill="var(--color-success)" fontSize="10" fontWeight="bold" opacity="0.7">◄ FLOOD BARRIER LEVEE</text>

        {/* Draw Shelters (Green Staging Points) */}
        {shelters && shelters.map(s => {
          const { x, y } = getCoordinates(s.lat, s.lng);
          return (
            <g key={s.id} transform={`translate(${x}, ${y})`}>
              {/* Outer Glow */}
              <circle r="12" fill="var(--color-success)" opacity="0.15" />
              {/* Core pin */}
              <circle r="7" fill="var(--color-success)" stroke="#ffffff" strokeWidth="1.5" />
              {/* Shelter label */}
              <text y="-12" textAnchor="middle" fill="var(--color-success-dark)" fontSize="9" fontWeight="bold" backgroundColor="white">
                🏠 {s.name.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* Draw Citizen Help Requests */}
        {requests && requests.map(r => {
          // If approved, hide or show with green check checkmark. Let's show as small hollow circles or fade them out.
          const isApproved = r.status === 'approved';
          const isSelected = r.id === selectedRequestId;
          const { x, y } = getCoordinates(r.location.lat, r.location.lng);
          const baseColor = isApproved ? 'var(--color-success)' : getUrgencyColor(r.aiAnalysis.urgencyScore);
          
          return (
            <g 
              key={r.id} 
              transform={`translate(${x}, ${y})`}
              onClick={() => onSelectRequest(r.id)}
              onMouseEnter={() => setHoveredRequest(r)}
              onMouseLeave={() => setHoveredRequest(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulsing effect for highly critical requests */}
              {!isApproved && r.aiAnalysis.urgencyScore >= 8.5 && (
                <circle r="18" fill={baseColor} opacity="0.3">
                  <animate 
                    attributeName="r" 
                    values="10;22;10" 
                    dur="2s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="opacity" 
                    values="0.4;0;0.4" 
                    dur="2s" 
                    repeatCount="indefinite" 
                  />
                </circle>
              )}

              {/* Outer Selection Highlight Ring */}
              {isSelected && (
                <circle r="14" fill="none" stroke="var(--primary-blue)" strokeWidth="3" />
              )}

              {/* Main Dot */}
              <circle 
                r={isSelected ? "9" : "7"} 
                fill={baseColor} 
                stroke="#ffffff" 
                strokeWidth="1.5" 
                style={{
                  transition: 'r 0.2s ease',
                  filter: isSelected ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' : 'none'
                }}
              />

              {/* Inner dot symbol */}
              {isApproved ? (
                <circle r="2.5" fill="#ffffff" />
              ) : r.aiAnalysis.urgencyScore >= 8.5 ? (
                <circle r="3" fill="#ffffff" />
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Floating Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        fontSize: '11px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(4px)',
        zIndex: 5
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '2px', color: 'var(--text-main)' }}>Map Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-critical)' }}></span>
          <span>Critical Alert (&ge; 8.5)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-high)' }}></span>
          <span>High Urgency (7.0 - 8.4)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-medium)' }}></span>
          <span>Medium Urgency (4.0 - 6.9)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
          <span>Approved / Dispatched Case</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '4px', marginTop: '2px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)', border: '2px solid white', boxSizing: 'border-box' }}></span>
          <span>🏠 Shelter / Staging Hub</span>
        </div>
      </div>

      {/* Hover Tooltip overlay */}
      {hoveredRequest && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'white',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '12px',
          maxWidth: '240px',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 'bold' }}>{hoveredRequest.id}</span>
            <span className={`badge badge-${hoveredRequest.aiAnalysis.urgencyScore >= 8.5 ? 'critical' : hoveredRequest.aiAnalysis.urgencyScore >= 7.0 ? 'high' : hoveredRequest.aiAnalysis.urgencyScore >= 4.0 ? 'medium' : 'low'}`} style={{ fontSize: '9px', marginLeft: 'auto' }}>
              Score: {hoveredRequest.aiAnalysis.urgencyScore}
            </span>
          </div>
          <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', color: 'var(--text-light)', marginBottom: '4px' }}>
            Need: {hoveredRequest.category}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineBreak: 'anywhere' }}>
            {hoveredRequest.location.address}
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4px', marginTop: '6px', color: 'var(--text-light)', fontSize: '10px' }}>
            Affected: {hoveredRequest.peopleAffected} {hoveredRequest.peopleAffected > 1 ? 'people' : 'person'}
          </div>
        </div>
      )}
    </div>
  );
}
