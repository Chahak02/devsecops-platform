import React, { useState } from 'react';
import { User, Bell, Shield, Server, Key, Save } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [jenkinsUrl, setJenkinsUrl] = useState('http://localhost:8080');
  const [jenkinsJob, setJenkinsJob] = useState('DevSecOps-Pipeline');
  const [vaultUrl, setVaultUrl] = useState('http://localhost:8200');
  const [grafanaUrl, setGrafanaUrl] = useState('http://localhost:3000');
  const [notifications, setNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>

      <div className="settings-grid">

        {/* Profile Section */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper blue"><User size={20} /></div>
            <h2>Profile</h2>
          </div>
          <div className="settings-fields">
            <div className="field-group">
              <label>Full Name</label>
              <input type="text" defaultValue="Chahak A" className="settings-input" />
            </div>
            <div className="field-group">
              <label>Email</label>
              <input type="email" defaultValue="chahak@devsecops.io" className="settings-input" />
            </div>
            <div className="field-group">
              <label>Role</label>
              <input type="text" defaultValue="DevSecOps Engineer" className="settings-input" readOnly />
            </div>
          </div>
        </div>

        {/* Jenkins Integration */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper green"><Server size={20} /></div>
            <h2>Jenkins Integration</h2>
          </div>
          <div className="settings-fields">
            <div className="field-group">
              <label>Jenkins URL</label>
              <input type="text" value={jenkinsUrl} onChange={e => setJenkinsUrl(e.target.value)} className="settings-input" />
            </div>
            <div className="field-group">
              <label>Pipeline Job Name</label>
              <input type="text" value={jenkinsJob} onChange={e => setJenkinsJob(e.target.value)} className="settings-input" />
            </div>
            <div className="field-group">
              <label>Status</label>
              <span className="status-badge connected">● Connected</span>
            </div>
          </div>
        </div>

        {/* Vault & Security */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper red"><Key size={20} /></div>
            <h2>HashiCorp Vault</h2>
          </div>
          <div className="settings-fields">
            <div className="field-group">
              <label>Vault URL</label>
              <input type="text" value={vaultUrl} onChange={e => setVaultUrl(e.target.value)} className="settings-input" />
            </div>
            <div className="field-group">
              <label>Secret Path</label>
              <input type="text" defaultValue="secret/sonarcloud" className="settings-input" readOnly />
            </div>
            <div className="field-group">
              <label>Status</label>
              <span className="status-badge connected">● Sealed: No</span>
            </div>
          </div>
        </div>

        {/* Monitoring */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper purple"><Shield size={20} /></div>
            <h2>Monitoring</h2>
          </div>
          <div className="settings-fields">
            <div className="field-group">
              <label>Grafana URL</label>
              <input type="text" value={grafanaUrl} onChange={e => setGrafanaUrl(e.target.value)} className="settings-input" />
            </div>
            <div className="field-group">
              <label>Prometheus Namespace</label>
              <input type="text" defaultValue="monitoring" className="settings-input" readOnly />
            </div>
            <div className="field-group">
              <label>Status</label>
              <span className="status-badge connected">● Active</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card glass-panel full-width">
          <div className="settings-card-header">
            <div className="settings-icon-wrapper orange"><Bell size={20} /></div>
            <h2>Notifications</h2>
          </div>
          <div className="settings-fields toggle-fields">
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Build Notifications</p>
                <p className="toggle-desc">Get notified when a Jenkins pipeline completes or fails.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Security Alerts</p>
                <p className="toggle-desc">Get notified when SonarCloud detects a critical vulnerability.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={securityAlerts} onChange={() => setSecurityAlerts(!securityAlerts)} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <div className="settings-footer">
        <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
