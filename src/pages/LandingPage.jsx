import React from 'react';
import { ShieldCheck, Flame, Compass, CheckSquare, HeartHandshake, EyeOff } from 'lucide-react';

export default function LandingPage({ navigate }) {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-tagline">Disaster Response & Triage Platform</div>
        <h1 className="landing-title">Turn urgent requests into coordinated relief.</h1>
        <p className="landing-desc">
          An AI-augmented coordination system connecting citizens in disaster areas with volunteers, shelters, and vital supply inventory. Powered by a collaborative multi-agent architecture.
        </p>
        <div className="landing-ctas">
          <button 
            onClick={() => navigate('citizen-request')} 
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '16px' }}
          >
            Submit Help Request
          </button>
          <button 
            onClick={() => navigate('dashboard')} 
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '16px' }}
          >
            Coordinator Dashboard
          </button>
        </div>
      </section>

      {/* Multi-Agent Workflow Explanation */}
      <section className="workflow-section">
        <div className="container">
          <div className="workflow-header">
            <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Intelligent Multi-Agent Relief Pipeline</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              From citizen submit to responder dispatch, our specialized agents analyze, cross-reference, and match requests safely under human supervision.
            </p>
          </div>

          <div className="workflow-steps">
            {/* Step 1 */}
            <div className="workflow-card">
              <div className="step-num">1</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <EyeOff size={20} style={{ color: 'var(--primary-blue)' }} />
                <h3>Verification Agent</h3>
              </div>
              <p>
                Masks Personally Identifiable Information (PII) to protect privacy. Checks coordinates and runs immediate duplicate analysis to merge duplicate submissions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="workflow-card">
              <div className="step-num">2</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Flame size={20} style={{ color: 'var(--color-critical)' }} />
                <h3>Prioritization Agent</h3>
              </div>
              <p>
                Assesses urgency based on category, vulnerable populations (infants, elderly, pregnant, disabled), and semantic indicators of distress to calculate a triage score (1-10).
              </p>
            </div>

            {/* Step 3 */}
            <div className="workflow-card">
              <div className="step-num">3</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Compass size={20} style={{ color: 'var(--color-success)' }} />
                <h3>Resource Matcher</h3>
              </div>
              <p>
                Calculates distances to find nearest volunteers with matching skills, matches shelter space, and reserves critical supplies (water kits, food kits, medical packs).
              </p>
            </div>

            {/* Step 4 */}
            <div className="workflow-card">
              <div className="step-num">4</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CheckSquare size={20} style={{ color: 'var(--primary-deep)' }} />
                <h3>Human Coordination</h3>
              </div>
              <p>
                Synthesizes AI reasoning and presents matching results. Coordinators review, verify safety, and approve dispatches with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flood Simulation Alert Box */}
      <section style={{ padding: '60px 24px', backgroundColor: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <HeartHandshake size={36} style={{ color: 'var(--primary-blue)', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '10px' }}>Active Simulation: Metro City Flood Relief</h3>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
              The system is currently pre-loaded with mock data representing 12 incoming help requests (including medical emergencies, rescues, and duplicate submissions) and a set of operational relief assets.
            </p>
            <button onClick={() => navigate('dashboard')} className="btn btn-primary">
              Launch Coordinator Space
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
