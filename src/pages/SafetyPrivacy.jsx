import React, { useState, useEffect } from 'react';
import { Shield, EyeOff, CheckSquare, ShieldAlert, FileText, Filter, RotateCcw } from 'lucide-react';

export default function SafetyPrivacy() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(data.reverse()); // Show newest first
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === 'All') return true;
    if (filter === 'Agents') {
      return log.source.includes('Agent');
    }
    if (filter === 'Human') {
      return log.source.includes('Coordinator') || log.source.includes('Human');
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '30px 24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2>Safety, Privacy & Agent Accountability</h2>
        <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>
          Learn about our multi-agent privacy safeguards and review the platform security audit logs.
        </p>
      </div>

      <div className="privacy-grid">
        {/* LEFT COLUMN: GUIDELINES & MANUAL */}
        <div className="markdown-content">
          <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={24} style={{ color: 'var(--primary-blue)' }} />
            ReliefRoute Safety & Governance Framework
          </h3>

          <p>
            Operating AI systems in humanitarian contexts requires rigorous ethical boundaries, data protection, and clear lines of accountability. ReliefRoute AI integrates five core safety controls directly into its multi-agent triage design:
          </p>

          <h4 style={{ fontSize: '15px', fontWeight: '700', marginTop: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <EyeOff size={16} style={{ color: 'var(--color-high)' }} /> 
            1. Automated PII Cryptographic Masking
          </h4>
          <p style={{ fontSize: '14px' }}>
            All Personally Identifiable Information (PII) like citizen names and phone numbers are encrypted immediately upon submission. Triage agents evaluate requests and recommend resources using masked identifiers (e.g., <code>REQ-101</code>). Original contact info is decrypted and revealed to logistics teams only after a coordinator approves the relief action.
          </p>

          <h4 style={{ fontSize: '15px', fontWeight: '700', marginTop: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckSquare size={16} style={{ color: 'var(--color-success)' }} /> 
            2. Human-in-the-Loop Supervision
          </h4>
          <p style={{ fontSize: '14px' }}>
            AI agents are restricted to **read and recommend** operations. They calculate urgency, verify coordinates, check for duplicate requests, and suggest nearby assets. No resource allocations or personnel dispatches can be executed without manual confirmation from a verified NGO coordinator.
          </p>

          <h4 style={{ fontSize: '15px', fontWeight: '700', marginTop: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} style={{ color: 'var(--color-critical)' }} /> 
            3. Role-Based Access Control (RBAC)
          </h4>
          <p style={{ fontSize: '14px' }}>
            The system partitions visibility based on active roles:
          </p>
          <ul style={{ fontSize: '13px', marginLeft: '20px', marginBottom: '10px' }}>
            <li><strong>Public (Citizens):</strong> Submit requests only. No visibility into dashboard queues or regional resource inventories.</li>
            <li><strong>Field Responders (Volunteers):</strong> View assigned dispatch cards with contact details once approved.</li>
            <li><strong>NGO Coordinators (Admins):</strong> Complete queue visibility, override triage scores, review reasoning logs, and adjust supply stocks.</li>
          </ul>

          <h4 style={{ fontSize: '15px', fontWeight: '700', marginTop: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} style={{ color: 'var(--primary-deep)' }} /> 
            4. Consent-First Data Minimization
          </h4>
          <p style={{ fontSize: '14px' }}>
            Citizens must explicitly opt-in to let the multi-agent system analyze their requests. If consent is withheld, the ticket is flagged and routed directly to a manual, non-AI queue for standard verification, bypassing automated triage algorithms completely.
          </p>
        </div>

        {/* RIGHT COLUMN: LIVE SECURITY AUDIT LOG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px' }}>Platform Audit Log</h3>
              <button 
                onClick={fetchLogs} 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} /> Refresh
              </button>
            </div>
            
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setFilter('All')} 
                className="btn" 
                style={{ 
                  flex: 1, 
                  padding: '6px', 
                  fontSize: '11px',
                  backgroundColor: filter === 'All' ? 'var(--primary-deep)' : 'white',
                  color: filter === 'All' ? 'white' : 'var(--text-muted)'
                }}
              >
                All Events
              </button>
              <button 
                onClick={() => setFilter('Agents')} 
                className="btn" 
                style={{ 
                  flex: 1, 
                  padding: '6px', 
                  fontSize: '11px',
                  backgroundColor: filter === 'Agents' ? 'var(--primary-deep)' : 'white',
                  color: filter === 'Agents' ? 'white' : 'var(--text-muted)'
                }}
              >
                Agent Logs
              </button>
              <button 
                onClick={() => setFilter('Human')} 
                className="btn" 
                style={{ 
                  flex: 1, 
                  padding: '6px', 
                  fontSize: '11px',
                  backgroundColor: filter === 'Human' ? 'var(--primary-deep)' : 'white',
                  color: filter === 'Human' ? 'white' : 'var(--text-muted)'
                }}
              >
                Human Audits
              </button>
            </div>

            <div className="card-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading logs...</div>
              ) : filteredLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredLogs.map((log, i) => (
                    <div key={i} style={{ 
                      fontSize: '11px', 
                      padding: '8px', 
                      backgroundColor: 'var(--bg-main)', 
                      borderRadius: '4px',
                      borderLeft: `2.5px solid ${log.source.includes('Agent') ? 'var(--primary-blue)' : 'var(--color-success)'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--text-light)', fontWeight: 'bold' }}>
                        <span>{log.source}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>{log.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px', fontSize: '12px' }}>
                  No logs found for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
