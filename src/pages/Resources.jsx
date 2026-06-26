import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, Package, Shield, Users, Home, Truck, 
  MapPin, CheckCircle, HelpCircle, Activity 
} from 'lucide-react';

export default function Resources() {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingInventory, setEditingInventory] = useState(false);
  const [suppliesStock, setSuppliesStock] = useState({
    foodKits: 0,
    waterKits: 0,
    medicalPacks: 0,
    hygieneKits: 0,
    blankets: 0
  });

  const [newVol, setNewVol] = useState({
    name: '',
    skill: 'logistics',
    phone: '',
    address: 'Sector 4 Staging Area',
    lat: 22.540,
    lng: 88.350
  });

  const [volSuccess, setVolSuccess] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data);
      setSuppliesStock({
        foodKits: data.supplies.foodKits.count,
        waterKits: data.supplies.waterKits.count,
        medicalPacks: data.supplies.medicalPacks.count,
        hygieneKits: data.supplies.hygieneKits.count,
        blankets: data.supplies.blankets.count
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleStockChange = (e) => {
    const { name, value } = e.target;
    setSuppliesStock(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSaveInventory = async () => {
    try {
      const res = await fetch('/api/resources/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplies: suppliesStock })
      });
      if (!res.ok) throw new Error('Failed to update inventory');
      await fetchResources();
      setEditingInventory(false);
    } catch (err) {
      console.error(err);
      alert('Error updating supplies inventory.');
    }
  };

  const handleVolChange = (e) => {
    const { name, value } = e.target;
    setNewVol(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterVolunteer = async (e) => {
    e.preventDefault();
    if (!newVol.name || !newVol.phone) {
      alert('Please fill out Name and Phone.');
      return;
    }

    try {
      // Random coordinates in disaster zone
      const randomLat = 22.51 + Math.random() * 0.07;
      const randomLng = 88.31 + Math.random() * 0.08;

      const res = await fetch('/api/resources/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newVolunteer: {
            name: newVol.name,
            skill: newVol.skill,
            phone: newVol.phone,
            lat: randomLat,
            lng: randomLng
          }
        })
      });

      if (!res.ok) throw new Error('Failed to add volunteer');
      await fetchResources();
      setVolSuccess(true);
      setNewVol({
        name: '',
        skill: 'logistics',
        phone: '',
        address: 'Sector 4 Staging Area',
        lat: 22.540,
        lng: 88.350
      });
      setTimeout(() => setVolSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error adding volunteer.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <h3>Loading Operational Resources...</h3>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2>Relief Resource Coordination Hub</h2>
          <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>
            Manage personnel, active shelters, supply counts, and vehicle fleet routing.
          </p>
        </div>
      </div>

      <div className="resource-grid">
        {/* LEFT COLUMN: SUPPLIES & SHELTERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Supplies Inventory */}
          <div className="section-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} style={{ color: 'var(--primary-blue)' }} />
                Supplies Stockroom
              </h3>
              {!editingInventory ? (
                <button onClick={() => setEditingInventory(true)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Adjust Stock Levels
                </button>
              ) : (
                <button onClick={handleSaveInventory} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <Save size={14} /> Save Stock
                </button>
              )}
            </div>
            <div className="card-body">
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>Item Type</th>
                    <th style={{ textAlign: 'center' }}>Available</th>
                    <th style={{ textAlign: 'center' }}>Allocated / Out</th>
                    <th style={{ textAlign: 'right' }}>Total Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(resources.supplies).map(key => {
                    const item = resources.supplies[key];
                    const available = item.count - item.allocated;
                    return (
                      <tr key={key}>
                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                        <td style={{ textAlign: 'center', color: 'var(--color-success)', fontWeight: 'bold' }}>
                          {available}
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                          {item.allocated}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {editingInventory ? (
                            <input 
                              type="number" 
                              name={key}
                              value={suppliesStock[key]} 
                              onChange={handleStockChange}
                              style={{ width: '60px', padding: '4px', textAlign: 'right', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                              min={item.allocated}
                            />
                          ) : (
                            <strong>{item.count}</strong>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Shelter Capacity */}
          <div className="section-card">
            <div className="card-header">
              <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Home size={18} style={{ color: 'var(--color-success)' }} />
                Emergency Shelters
              </h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {resources.shelters.map(s => {
                const pct = Math.round((s.occupied / s.capacity) * 100);
                let progressColor = 'var(--color-success)';
                if (pct > 90) progressColor = 'var(--color-critical)';
                else if (pct > 70) progressColor = 'var(--color-high)';

                return (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: '600' }}>{s.name}</span>
                      <span>
                        <strong>{s.occupied}</strong> / {s.capacity} beds <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="resource-hub-bar" style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, backgroundColor: progressColor, height: '100%', transition: 'width 0.4s' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>📍 {s.address}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: VOLUNTEERS & TRANSPORT FLEET */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 3: Volunteer Personnel */}
          <div className="section-card">
            <div className="card-header">
              <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--color-high)' }} />
                Active Volunteer Personnel ({resources.volunteers.length})
              </h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table className="resource-table" style={{ margin: '0' }}>
                  <thead style={{ position: 'sticky', top: '0', backgroundColor: 'white', zIndex: 2 }}>
                    <tr>
                      <th>Name</th>
                      <th>Capability</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.volunteers.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: '500' }}>{v.name}</td>
                        <td>
                          <span className="badge badge-low" style={{ fontSize: '10px' }}>{v.skill}</span>
                        </td>
                        <td>
                          {v.status === 'available' ? (
                            <span className="badge badge-success" style={{ fontSize: '9px' }}>Ready</span>
                          ) : (
                            <span className="badge badge-high" style={{ fontSize: '9px' }}>Assigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Form to Register Volunteer */}
              <form onSubmit={handleRegisterVolunteer} style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                marginTop: '6px'
              }}>
                <h4 style={{ fontSize: '13px', marginBottom: '10px' }}>Register Field Responder</h4>
                {volSuccess && (
                  <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-dark)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Volunteer registered and mapped successfully.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input 
                    type="text" 
                    name="name" 
                    value={newVol.name}
                    onChange={handleVolChange}
                    className="form-input" 
                    placeholder="Volunteer Name" 
                    style={{ padding: '8px' }}
                    required 
                  />
                  <select 
                    name="skill" 
                    value={newVol.skill}
                    onChange={handleVolChange}
                    className="form-input"
                    style={{ padding: '8px' }}
                  >
                    <option value="medical">Medical</option>
                    <option value="rescue">Search & Rescue</option>
                    <option value="logistics">Logistics/Food</option>
                    <option value="sanitation">Sanitation</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
                  <input 
                    type="text" 
                    name="phone" 
                    value={newVol.phone}
                    onChange={handleVolChange}
                    className="form-input" 
                    placeholder="Contact Number" 
                    style={{ padding: '8px' }}
                    required 
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px', fontSize: '12px', borderRadius: 'var(--radius-md)' }}>
                    <Plus size={14} /> Add Volunteer
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Card 4: Transport Fleet status */}
          <div className="section-card">
            <div className="card-header">
              <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} style={{ color: 'var(--primary-deep)' }} />
                Transport Fleet Dispatch Status
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resources.transport.map(t => (
                  <div key={t.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{t.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Hub: {t.hub}</div>
                    </div>
                    <div>
                      {t.status === 'available' ? (
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>Standby</span>
                      ) : (
                        <span className="badge badge-critical" style={{ fontSize: '10px' }}>Dispatched</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
