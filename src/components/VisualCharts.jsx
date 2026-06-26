import React from 'react';

export default function VisualCharts({ requests, resources }) {
  // --- 1. Category Distribution (Horizontal Bar Chart) ---
  const categories = ['food', 'water', 'medical', 'shelter', 'rescue', 'sanitation'];
  const categoryLabels = {
    food: 'Food Supply',
    water: 'Clean Water',
    medical: 'Medical Care',
    shelter: 'Dry Shelter',
    rescue: 'Rescue Evac',
    sanitation: 'Sanitation'
  };
  const categoryColors = {
    food: '#3b82f6',       // Blue
    water: '#0ea5e9',      // Sky
    medical: '#ef4444',    // Red
    shelter: '#f59e0b',    // Amber
    rescue: '#f97316',     // Orange
    sanitation: '#10b981'  // Emerald
  };

  const catCounts = categories.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {});

  requests.forEach(r => {
    if (catCounts[r.category] !== undefined) {
      catCounts[r.category]++;
    }
  });

  const maxCatCount = Math.max(...Object.values(catCounts), 1);

  // --- 2. Urgency Distribution (Percentage Triage Bar) ---
  let critical = 0; // >= 8.5
  let high = 0;     // 7.0 - 8.4
  let medium = 0;   // 4.0 - 6.9
  let low = 0;      // < 4.0

  requests.forEach(r => {
    const score = r.aiAnalysis.urgencyScore;
    if (score >= 8.5) critical++;
    else if (score >= 7.0) high++;
    else if (score >= 4.0) medium++;
    else low++;
  });

  const totalUrgency = requests.length || 1;
  const pctCritical = (critical / totalUrgency) * 100;
  const pctHigh = (high / totalUrgency) * 100;
  const pctMedium = (medium / totalUrgency) * 100;
  const pctLow = (low / totalUrgency) * 100;

  // --- 3. Resource Stock Allocation (Progress Bars) ---
  const supplyKeys = ['foodKits', 'waterKits', 'medicalPacks', 'hygieneKits', 'blankets'];
  const supplyLabels = {
    foodKits: 'Food Kits',
    waterKits: 'Clean Water Kits',
    medicalPacks: 'Medical Packs',
    hygieneKits: 'Hygiene Kits',
    blankets: 'Blankets'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Urgency Distribution Bar Meter */}
      <div style={{
        backgroundColor: 'var(--bg-main)',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
      }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
          Urgency Triage Distribution ({requests.length} Cases)
        </h4>
        <div style={{
          height: '24px',
          borderRadius: '6px',
          overflow: 'hidden',
          display: 'flex',
          backgroundColor: '#e2e8f0',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
          marginBottom: '12px'
        }}>
          {critical > 0 && (
            <div 
              style={{ width: `${pctCritical}%`, backgroundColor: 'var(--color-critical)', transition: 'width 0.5s' }} 
              title={`Critical: ${critical} cases (${Math.round(pctCritical)}%)`}
            />
          )}
          {high > 0 && (
            <div 
              style={{ width: `${pctHigh}%`, backgroundColor: 'var(--color-high)', transition: 'width 0.5s' }} 
              title={`High: ${high} cases (${Math.round(pctHigh)}%)`}
            />
          )}
          {medium > 0 && (
            <div 
              style={{ width: `${pctMedium}%`, backgroundColor: 'var(--color-medium)', transition: 'width 0.5s' }} 
              title={`Medium: ${medium} cases (${Math.round(pctMedium)}%)`}
            />
          )}
          {low > 0 && (
            <div 
              style={{ width: `${pctLow}%`, backgroundColor: 'var(--color-low)', transition: 'width 0.5s' }} 
              title={`Low: ${low} cases (${Math.round(pctLow)}%)`}
            />
          )}
        </div>
        {/* Triage Legends */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>
          <div style={{ color: 'var(--color-critical)' }}>CRITICAL ({critical})</div>
          <div style={{ color: 'var(--color-high)' }}>HIGH ({high})</div>
          <div style={{ color: 'var(--color-medium)' }}>MEDIUM ({medium})</div>
          <div style={{ color: 'var(--color-low)' }}>LOW ({low})</div>
        </div>
      </div>

      {/* Side by Side layout for Categories & Resources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Categories Bar Chart */}
        <div>
          <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '10px' }}>
            Requests by Category
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(cat => {
              const count = catCounts[cat];
              const percentage = (count / maxCatCount) * 100;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ width: '80px', fontWeight: '500', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {categoryLabels[cat]}
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '14px', borderRadius: '4px', overflow: 'hidden', margin: '0 10px' }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: categoryColors[cat], 
                        height: '100%', 
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out' 
                      }} 
                    />
                  </div>
                  <div style={{ width: '20px', fontWeight: 'bold', textAlign: 'right' }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resources Stock Progress */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '10px' }}>
            Supply Inventory Allocation
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resources && supplyKeys.map(key => {
              const item = resources.supplies[key];
              if (!item) return null;
              
              const total = item.count;
              const allocated = item.allocated;
              const pctAlloc = total > 0 ? (allocated / total) * 100 : 0;
              
              // Color changes to red if running low (i.e. allocation percentage is high)
              let fillCol = 'var(--primary-blue)';
              if (pctAlloc > 75) fillCol = 'var(--color-critical)';
              else if (pctAlloc > 40) fillCol = 'var(--color-high)';

              return (
                <div key={key} style={{ fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: '500' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{supplyLabels[key]}</span>
                    <span>
                      <strong>{allocated}</strong> / {total} <span style={{ color: 'var(--text-light)', fontSize: '10px' }}>({Math.round(pctAlloc)}%)</span>
                    </span>
                  </div>
                  <div style={{ backgroundColor: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${pctAlloc}%`, 
                        backgroundColor: fillCol, 
                        height: '100%', 
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-out' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
