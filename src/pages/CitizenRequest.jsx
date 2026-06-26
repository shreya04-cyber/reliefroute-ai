import React, { useState } from 'react';
import { 
  Soup, Droplet, Stethoscope, Home, LifeBuoy, Sparkles, 
  CheckCircle, Shield, AlertTriangle, ArrowRight, UserCheck 
} from 'lucide-react';

export default function CitizenRequest({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    contactPreference: 'phone',
    address: '',
    category: 'food',
    peopleAffected: 1,
    children: false,
    elderly: false,
    disability: false,
    pregnancy: false,
    urgencyDescription: '',
    consent: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCategorySelect = (cat) => {
    setFormData(prev => ({ ...prev, category: cat }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      setErrorMsg('You must consent to data processing for triage purposes.');
      return;
    }
    if (!formData.address) {
      setErrorMsg('Please specify an approximate location.');
      return;
    }
    if (formData.contactPreference !== 'none' && !formData.phone) {
      setErrorMsg('Please provide a contact number or email.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        contactPreference: formData.contactPreference,
        address: formData.address,
        category: formData.category,
        peopleAffected: parseInt(formData.peopleAffected) || 1,
        vulnerable: {
          children: formData.children,
          elderly: formData.elderly,
          disability: formData.disability,
          pregnancy: formData.pregnancy
        },
        urgencyDescription: formData.urgencyDescription,
        consent: formData.consent
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const result = await response.json();
      setSuccessResult(result);
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while submitting your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'food', label: 'Food Supply', icon: Soup },
    { id: 'water', label: 'Clean Water', icon: Droplet },
    { id: 'medical', label: 'Medical Care', icon: Stethoscope },
    { id: 'shelter', label: 'Dry Shelter', icon: Home },
    { id: 'rescue', label: 'Rescue Evac', icon: LifeBuoy },
    { id: 'sanitation', label: 'Sanitation', icon: Sparkles }
  ];

  if (successResult) {
    return (
      <div className="container" style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          <CheckCircle size={56} style={{ color: 'var(--color-success)', marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '12px' }}>Request Submitted Successfully</h2>
          <p className="text-muted" style={{ fontSize: '15px', marginBottom: '24px' }}>
            Your request has been securely uploaded to our system. The **ReliefRoute AI** multi-agent pipeline is already processing your request details.
          </p>

          {/* AI Immediate Processing Card */}
          <div style={{
            textAlign: 'left',
            backgroundColor: 'var(--bg-main)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '30px'
          }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> AI Pipeline Triage Report
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <strong>Ticket ID:</strong> <span style={{ fontFamily: 'monospace' }}>{successResult.id}</span>
              </div>
              <div>
                <strong>Verification Confidence:</strong> {successResult.aiAnalysis.verificationConfidence}% 
                {successResult.aiAnalysis.duplicateOf ? (
                  <span style={{ color: 'var(--color-high)', marginLeft: '8px' }}>(Potential duplicate of {successResult.aiAnalysis.duplicateOf})</span>
                ) : (
                  <span style={{ color: 'var(--color-success)', marginLeft: '8px' }}>(Unique Verified Case)</span>
                )}
              </div>
              <div>
                <strong>Calculated Urgency:</strong> {successResult.aiAnalysis.urgencyScore} / 10
              </div>
              <div>
                <strong>System Action recommendation:</strong> {successResult.aiAnalysis.recommendedAction}
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <em>Note: Your contact details are masked. A human coordinator will review this and dispatch the designated resources.</em>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setSuccessResult(null);
                setFormData({
                  name: '',
                  phone: '',
                  contactPreference: 'phone',
                  address: '',
                  category: 'food',
                  peopleAffected: 1,
                  children: false,
                  elderly: false,
                  disability: false,
                  pregnancy: false,
                  urgencyDescription: '',
                  consent: false
                });
              }}
              className="btn btn-secondary"
            >
              Submit Another Request
            </button>
            <button 
              onClick={() => navigate('dashboard', successResult.id)} 
              className="btn btn-primary"
            >
              View in Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 24px' }}>
      <div className="form-container">
        <div className="form-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={28} style={{ color: 'var(--primary-blue)' }} />
            Citizen Help Request Form
          </h2>
          <p className="text-muted" style={{ fontSize: '14px', marginTop: '6px' }}>
            If you are affected by the flood and require assistance, please fill in the details below. Our AI agents will verify and route your request to the closest relief crew.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category Selector */}
          <div className="form-group">
            <label className="form-label">What is your primary need? <span style={{ color: 'var(--color-critical)' }}>*</span></label>
            <div className="category-grid">
              {categories.map(cat => {
                const IconComp = cat.icon;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`category-card ${formData.category === cat.id ? 'selected' : ''}`}
                  >
                    <IconComp />
                    <span style={{ fontSize: '12px' }}>{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: 'var(--text-light)', fontWeight: 'normal' }}>(Optional)</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="e.g. John Doe"
              />
            </div>

            {/* People affected */}
            <div className="form-group">
              <label className="form-label">Number of People Affected <span style={{ color: 'var(--color-critical)' }}>*</span></label>
              <input 
                type="number" 
                name="peopleAffected"
                min="1"
                max="50"
                value={formData.peopleAffected}
                onChange={handleInputChange}
                className="form-input" 
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Contact Preference */}
            <div className="form-group">
              <label className="form-label">Preferred Contact Channel</label>
              <select 
                name="contactPreference" 
                value={formData.contactPreference}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="phone">Phone Call</option>
                <option value="whatsapp">WhatsApp Message</option>
                <option value="sms">SMS Text</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Contact Details */}
            <div className="form-group">
              <label className="form-label">Contact Details <span style={{ color: 'var(--color-critical)' }}>*</span></label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="e.g. +91 98300 12345"
                required
              />
            </div>
          </div>

          {/* Approximate Location */}
          <div className="form-group">
            <label className="form-label">Approximate Location / Address <span style={{ color: 'var(--color-critical)' }}>*</span></label>
            <input 
              type="text" 
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input" 
              placeholder="e.g. Block C, Sector 3 (Near Santoshpur Post Office)"
              required
            />
          </div>

          {/* Vulnerable Checkboxes */}
          <div className="form-group">
            <label className="form-label">Vulnerable members in your group? <span style={{ color: 'var(--text-light)', fontWeight: 'normal' }}>(Select all that apply)</span></label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="children"
                  checked={formData.children}
                  onChange={handleCheckboxChange}
                />
                <span>Children / Infants</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="elderly"
                  checked={formData.elderly}
                  onChange={handleCheckboxChange}
                />
                <span>Elderly (Age 60+)</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="disability"
                  checked={formData.disability}
                  onChange={handleCheckboxChange}
                />
                <span>People with Disabilities</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="pregnancy"
                  checked={formData.pregnancy}
                  onChange={handleCheckboxChange}
                />
                <span>Pregnant Women</span>
              </label>
            </div>
          </div>

          {/* Urgency Description */}
          <div className="form-group">
            <label className="form-label">Describe your situation & urgency <span style={{ color: 'var(--color-critical)' }}>*</span></label>
            <textarea 
              name="urgencyDescription"
              value={formData.urgencyDescription}
              onChange={handleInputChange}
              rows="4" 
              className="form-input"
              style={{ resize: 'vertical' }}
              placeholder="e.g., We are stranded on the terrace due to rising water. No food for 24 hours. My child has a mild fever."
              required
            />
          </div>

          {/* Privacy Note */}
          <div className="privacy-box">
            <Shield size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Privacy Protection Policy:</strong> Personally Identifiable Information (PII) is encrypted and masked. Only vetted NGO coordinators can access contact information to verify rescue details.
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="checkbox-label" style={{ fontWeight: 500 }}>
              <input 
                type="checkbox" 
                name="consent"
                checked={formData.consent}
                onChange={handleCheckboxChange}
                required
              />
              <span>I consent to having my location and urgency details processed by the ReliefRoute AI agentic system to match matching resources.</span>
            </label>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            {submitting ? 'Processing Triage & Routing...' : 'Submit Help Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
