import React, { useState, useEffect } from 'react';
import { 
  Users, AlertCircle, ShieldAlert, Sparkles, MapPin, 
  PhoneCall, Shield, Check, X, RotateCcw, Clock, Layers 
} from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap.jsx';
import VisualCharts from '../components/VisualCharts.jsx';

export default function Dashboard({ navigate, selectedRequestId, setSelectedRequestId }) {
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [role, setRole] = useState('coordinator'); // 'coordinator' or 'field_responder'

  // Fetch all dashboard data
  const fetchData = async () => {
    try {
      const [reqRes, resRes, auditRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/resources'),
        fetch('/api/audit-logs')
      ]);

      if (!reqRes.ok || !resRes.ok || !auditRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const reqData = await reqRes.json();
      const resData = await resRes.json();
      const auditData = await auditRes.json();

      setRequests(reqData);
      setResources(resData);
      setAuditLogs(auditData.reverse()); // Show newest logs first
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll data every 4 seconds to simulate real-time flood emergency
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Set default selection on load if none exists
  useEffect(() => {
    if (requests.length > 0 && !selectedRequestId) {
      // Find first pending request
      const firstPending = requests.find(r => r.status === 'pending');
      if (firstPending) {
        setSelectedRequestId(firstPending.id);
      } else {
        setSelectedRequestId(requests[0].id);
      }
    }
  }, [requests, selectedRequestId]);

  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${id}/approve`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Approval failed');
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to approve action.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to mark this request as resolved/rejected?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${id}/reject`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Action failed');
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Reset database to default mock flood scenario? Any custom submissions will be deleted.')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      await fetchData();
      setSelectedRequestId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to reset database.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Clock size={40} className="text-muted" style={{ animation: 'spin 2s linear infinite', marginBottom: '10px' }} />
          <h3>Loading ReliefRoute Dashboard...</h3>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const criticalCases = pendingRequests.filter(r => r.aiAnalysis.urgencyScore >= 8.5);
  
  const totalVolunteers = resources?.volunteers?.length || 0;
  const availableVolunteers = resources?.volunteers?.filter(v => v.status === 'available').length || 0;
  
  // Calculate inventory allocation metric
  let totalSupplies = 0;
  let allocatedSupplies = 0;
  if (resources?.supplies) {
    Object.keys(resources.supplies).forEach(k => {
      totalSupplies += resources.supplies[k].count;
      allocatedSupplies += resources.supplies[k].allocated;
    });
  }
  const inventoryHealth = totalSupplies > 0 ? Math.round(((totalSupplies - allocatedSupplies) / totalSupplies) * 100) : 100;

  // Selected Request detail
  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  // Sorting: Pending first, sorted by Urgency Score (descending), then resolved cases
  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    if (a.status === 'pending' && b.status === 'pending') {
      return b.aiAnalysis.urgencyScore - a.aiAnalysis.urgencyScore;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Calculate relative time ago
  const formatTimeAgo = (isoString) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  // Helper to mask sensitive information
  const maskText = (text, type = 'name') => {
    if (!text) return '[Not Provided]';
    if (type === 'name') {
      const parts = text.trim().split(' ');
      return parts.map(p => p[0] + '*'.repeat(Math.max(3, p.length - 1))).join(' ');
    }
    if (type === 'phone') {
      // e.g. +91 98301 23456 => +91 ******3456
      return text.substring(0, 4) + '******' + text.substring(text.length - 4);
    }
    return '[MASKED]';
  };

  return (
    <div className="dashboard-grid">
      {/* 1. Sidebar: Priority Triage Queue */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--primary-blue)' }} />
            Priority Queue ({pendingRequests.length})
          </h3>
          <button onClick={handleResetDb} title="Reset Data" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', hover: { color: 'var(--primary-blue)' } }}>
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="request-list">
          {sortedRequests.map(r => {
            const isSelected = r.id === selectedRequestId;
            const isPending = r.status === 'pending';
            const urgency = r.aiAnalysis.urgencyScore;
            
            let badgeClass = 'low';
            if (urgency >= 8.5) badgeClass = 'critical';
            else if (urgency >= 7.0) badgeClass = 'high';
            else if (urgency >= 4.0) badgeClass = 'medium';

            return (
              <div 
                key={r.id} 
                onClick={() => handleSelectRequest(r.id)}
                className={`request-item ${isSelected ? 'selected' : ''}`}
                style={{ opacity: r.status !== 'pending' ? 0.65 : 1 }}
              >
                <div className="request-item-header">
                  <span className="request-item-category">{r.category}</span>
                  <span className="request-item-time">{formatTimeAgo(r.createdAt)}</span>
                </div>
                <div className="request-item-desc">
                  {r.urgencyDescription}
                </div>
                <div className="request-item-footer">
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-light)' }}>
                    {r.id}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {r.status === 'approved' && (
                      <span className="badge badge-success" style={{ fontSize: '9px', padding: '2px 4px' }}>Dispatched</span>
                    )}
                    {r.status === 'rejected' && (
                      <span className="badge badge-low" style={{ fontSize: '9px', padding: '2px 4px' }}>Closed</span>
                    )}
                    {isPending && (
                      <span className={`badge badge-${badgeClass}`} style={{ fontSize: '9px', padding: '2px 4px' }}>
                        Urgency: {urgency}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* 2. Main Dashboard Workspace */}
      <div className="dashboard-main">
        {/* KPI Cards Row */}
        <section className="metrics-row">
          {/* Card 1: Incoming requests */}
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-blue)' }}>
              <AlertCircle size={22} />
            </div>
            <div className="kpi-details">
              <h3>Pending Triage</h3>
              <div className="kpi-value">{pendingRequests.length}</div>
            </div>
          </div>

          {/* Card 2: Critical Cases */}
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}>
              <ShieldAlert size={22} />
            </div>
            <div className="kpi-details">
              <h3>Critical Cases</h3>
              <div className="kpi-value" style={{ color: 'var(--color-critical)' }}>{criticalCases.length}</div>
            </div>
          </div>

          {/* Card 3: Volunteers */}
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <Users size={22} />
            </div>
            <div className="kpi-details">
              <h3>Ready Responders</h3>
              <div className="kpi-value">{availableVolunteers} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-light)' }}>/ {totalVolunteers}</span></div>
            </div>
          </div>

          {/* Card 4: Inventory Status */}
          <div className="kpi-card">
            <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Clock size={22} />
            </div>
            <div className="kpi-details">
              <h3>Inventory Reserve</h3>
              <div className="kpi-value">{inventoryHealth}% <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--color-success)' }}>Stock</span></div>
            </div>
          </div>
        </section>

        {/* Top Section: Map & Analytics Charts */}
        <section className="dashboard-top-section">
          {/* Map Card */}
          <div className="section-card">
            <div className="card-header">
              <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--color-critical)' }} />
                Disaster Relief SVG Map Coordinate Grid (Metro Flood Region)
              </h3>
              <span className="badge badge-low" style={{ textTransform: 'none' }}>Live coordinates mapping</span>
            </div>
            <div className="map-container">
              <InteractiveMap 
                requests={requests}
                selectedRequestId={selectedRequestId}
                onSelectRequest={handleSelectRequest}
                shelters={resources?.shelters || []}
              />
            </div>
          </div>

          {/* Analytics/Charts Card */}
          <div className="section-card">
            <div className="card-header">
              <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary-blue)' }} />
                Real-Time Agentic Analytics
              </h3>
            </div>
            <div className="card-body">
              <VisualCharts requests={requests} resources={resources} />
            </div>
          </div>
        </section>

        {/* Inspector: Selected Request Panels */}
        {selectedRequest ? (
          <section className="inspector-row">
            {/* Request Detail Inspector */}
            <div className="section-card">
              <div className="card-header">
                <h3 style={{ fontSize: '14px' }}>
                  Citizen Request Detail Panel — <strong>{selectedRequest.id}</strong>
                </h3>
                <span className="text-muted" style={{ fontSize: '12px' }}>
                  Submitted {formatTimeAgo(selectedRequest.createdAt)}
                </span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="panel-section-title">Citizen Submissions Data</div>
                <div className="data-grid">
                  <div className="data-item">
                    <label>Citizen Name</label>
                    {selectedRequest.status === 'approved' ? (
                      <span>{selectedRequest.name || 'Anonymous citizen'}</span>
                    ) : (
                      <span style={{ color: 'var(--color-high)', fontWeight: 'bold' }}>
                        {selectedRequest.name ? maskText(selectedRequest.name, 'name') : 'Anonymous'} 
                        <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--text-light)', marginLeft: '6px' }}>(MASKED)</span>
                      </span>
                    )}
                  </div>
                  <div className="data-item">
                    <label>Contact Channel</label>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PhoneCall size={12} className="text-muted" />
                      {selectedRequest.contactPreference.toUpperCase()}
                    </span>
                  </div>
                  <div className="data-item">
                    <label>Contact Info</label>
                    {selectedRequest.status === 'approved' ? (
                      <span>{selectedRequest.phone || 'N/A'}</span>
                    ) : (
                      <span style={{ color: 'var(--color-high)', fontWeight: 'bold' }}>
                        {selectedRequest.phone ? maskText(selectedRequest.phone, 'phone') : 'N/A'}
                        <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--text-light)', marginLeft: '6px' }}>(MASKED)</span>
                      </span>
                    )}
                  </div>
                  <div className="data-item">
                    <label>Approximate Location</label>
                    <span>{selectedRequest.location.address}</span>
                  </div>
                </div>

                <div className="panel-section-title">Urgency Context</div>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="data-item"><label>Citizen Statement</label></label>
                  <p style={{ 
                    fontSize: '13px', 
                    padding: '12px', 
                    backgroundColor: 'var(--bg-main)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic'
                  }}>
                    "{selectedRequest.urgencyDescription}"
                  </p>
                </div>

                <div className="data-grid" style={{ marginTop: '10px', gridTemplateColumns: '1fr' }}>
                  <div className="data-item">
                    <label>Vulnerabilities Flags</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {selectedRequest.vulnerable.children && <span className="badge badge-high" style={{ fontSize: '10px' }}>Children / Infants</span>}
                      {selectedRequest.vulnerable.elderly && <span className="badge badge-high" style={{ fontSize: '10px' }}>Elderly</span>}
                      {selectedRequest.vulnerable.disability && <span className="badge badge-high" style={{ fontSize: '10px' }}>Disability</span>}
                      {selectedRequest.vulnerable.pregnancy && <span className="badge badge-critical" style={{ fontSize: '10px' }}>Pregnancy</span>}
                      {!selectedRequest.vulnerable.children && 
                       !selectedRequest.vulnerable.elderly && 
                       !selectedRequest.vulnerable.disability && 
                       !selectedRequest.vulnerable.pregnancy && (
                         <span className="badge badge-low" style={{ fontSize: '10px' }}>No Special Vulnerabilities flagged</span>
                       )}
                    </div>
                  </div>
                </div>

                {/* Privacy Warning */}
                {selectedRequest.status !== 'approved' && (
                  <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    color: '#b45309',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: 'auto'
                  }}>
                    <Shield size={16} style={{ flexShrink: 0 }} />
                    <span>PII masked under Safety Standard. Approve this action to unmask phone details and dispatch responders.</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Reasoning and Matching Panel */}
            <div className="section-card">
              <div className="card-header">
                <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary-blue)' }} />
                  Multi-Agent Reasoning & Resource Matcher
                </h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Urgency Score Card */}
                <div className="urgency-gauge">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Assessed Urgency Score</span>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '800', 
                      color: selectedRequest.aiAnalysis.urgencyScore >= 8.5 ? 'var(--color-critical)' : selectedRequest.aiAnalysis.urgencyScore >= 7.0 ? 'var(--color-high)' : selectedRequest.aiAnalysis.urgencyScore >= 4.0 ? 'var(--color-medium)' : 'var(--color-low)'
                    }}>
                      {selectedRequest.aiAnalysis.urgencyScore} / 10
                    </span>
                  </div>
                  <div className="urgency-bar-container">
                    <div 
                      className="urgency-bar"
                      style={{ 
                        width: `${selectedRequest.aiAnalysis.urgencyScore * 10}%`,
                        backgroundColor: selectedRequest.aiAnalysis.urgencyScore >= 8.5 ? 'var(--color-critical)' : selectedRequest.aiAnalysis.urgencyScore >= 7.0 ? 'var(--color-high)' : selectedRequest.aiAnalysis.urgencyScore >= 4.0 ? 'var(--color-medium)' : 'var(--color-low)'
                      }}
                    />
                  </div>
                </div>

                {/* Verification Confidence */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Verification Confidence</span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: selectedRequest.aiAnalysis.verificationConfidence < 50 ? 'var(--color-critical)' : 'var(--color-success)'
                  }}>
                    {selectedRequest.aiAnalysis.verificationConfidence}%
                  </span>
                </div>

                {selectedRequest.aiAnalysis.duplicateOf && (
                  <div style={{
                    backgroundColor: '#fff5f5',
                    border: '1px solid #ffe3e3',
                    color: 'var(--color-critical)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong>Duplicate Request Detected!</strong> Relates to primary ticket <strong>{selectedRequest.aiAnalysis.duplicateOf}</strong>. Actions should be unified to avoid double logistics deployment.
                    </div>
                  </div>
                )}

                {/* Resource Allocation List */}
                <div className="panel-section-title">Matched Relief Resources</div>
                <div className="resource-match-list">
                  {selectedRequest.aiAnalysis.matchedResources && selectedRequest.aiAnalysis.matchedResources.length > 0 ? (
                    selectedRequest.aiAnalysis.matchedResources.map((res, i) => (
                      <div key={i} className="matched-item" style={{
                        backgroundColor: selectedRequest.status === 'approved' ? 'var(--color-success-bg)' : '#eff6ff',
                        borderColor: selectedRequest.status === 'approved' ? '#bbf7d0' : '#bfdbfe'
                      }}>
                        <div className="matched-item-left" style={{
                          color: selectedRequest.status === 'approved' ? 'var(--color-success-dark)' : 'var(--primary-navy)'
                        }}>
                          {res.type === 'volunteer' && <span>👷 Volunteer: {res.name} ({res.skill})</span>}
                          {res.type === 'shelter' && <span>🏠 Shelter Space: {res.name}</span>}
                          {res.type === 'supply' && <span>📦 Inventory: {res.quantity}x {res.name}</span>}
                          {res.type === 'transport' && <span>🚚 Vehicle: {res.name}</span>}
                        </div>
                        {res.distance && (
                          <span className="matched-item-dist" style={{
                            backgroundColor: selectedRequest.status === 'approved' ? '#dcfce7' : '#dbeafe',
                            color: selectedRequest.status === 'approved' ? '#166534' : '#1e40af'
                          }}>
                            {res.distance} km
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                      No resource allocations recommended. Flagged for custom dispatcher routing.
                    </div>
                  )}
                </div>

                {/* Agent Action Box */}
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--bg-main)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Agent recommendation
                  </div>
                  <strong>{selectedRequest.aiAnalysis.recommendedAction}</strong>
                  <div style={{ color: 'var(--text-light)', fontSize: '11px', marginTop: '6px' }}>
                    Reasoning: {selectedRequest.aiAnalysis.reasoning}
                  </div>
                </div>

                {/* Human Approval Action Row */}
                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '10px' }}>
                  {selectedRequest.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleReject(selectedRequest.id)}
                        disabled={actionLoading}
                        className="btn btn-secondary"
                        style={{ flex: 1, color: 'var(--color-critical)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        <X size={16} /> Resolve / Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={actionLoading}
                        className="btn btn-success"
                        style={{ flex: 1.5 }}
                      >
                        <Check size={16} /> Approve & Dispatch Action
                      </button>
                    </>
                  ) : selectedRequest.status === 'approved' ? (
                    <div className="badge badge-success" style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      gap: '8px',
                      textTransform: 'none'
                    }}>
                      <Check size={18} /> Action Approved & Dispatched (PII Unlocked for Field Teams)
                    </div>
                  ) : (
                    <div className="badge badge-low" style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      gap: '8px',
                      textTransform: 'none'
                    }}>
                      <X size={18} /> Request Marked Closed / Resolved
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            No Request Selected in Queue.
          </div>
        )}

        {/* Audit Log / Action History Feed */}
        <section className="section-card audit-log-card">
          <div className="card-header">
            <h3 style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--text-light)' }} />
              Security Audit Log & Agent Operations feed
            </h3>
            <span className="badge badge-low" style={{ textTransform: 'none', fontSize: '10px' }}>Cryptographically signed events</span>
          </div>
          <div className="card-body">
            <div className="audit-log-list">
              {auditLogs.map((log, i) => (
                <div key={i} className="audit-log-item" style={{
                  borderLeftColor: log.source === 'Verification Agent' ? 'var(--primary-blue)' : 
                                   log.source === 'Prioritization Agent' ? 'var(--color-critical)' : 
                                   log.source === 'Resource Matcher Agent' ? 'var(--color-success)' : 'var(--color-high)'
                }}>
                  <span className="audit-log-item-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="audit-log-item-source">{log.source}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
