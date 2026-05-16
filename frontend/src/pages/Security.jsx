import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, ShieldX, Terminal, ExternalLink, Loader2 } from 'lucide-react';
import './Security.css';

const Security = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects for security reports:', error);
      setProjects([]);
      setLoading(false);
    }
  };

  // Map the real security data from the project objects
  // const securityData = projects.map((project) => ({
  //   id: project._id,
  //   project: project.name,
  //   sonarQube: project.sonarResults || { 
  //     status: 'N/A', 
  //     bugs: 0, 
  //     vulnerabilities: 0, 
  //     codeSmells: 0 
  //   },
  //   trivy: project.trivyResults || { 
  //     critical: 0, 
  //     high: 0, 
  //     medium: 0 
  //   },
  //   lastScan: project.lastBuild ? new Date(project.lastBuild).toLocaleTimeString() : 'Never'
  // }));
  const securityData = projects.map((project) => ({
    id: project._id,
    project: project.name,
  
    sonarQube: project.sonarResults || {
      status: 'N/A',
      bugs: 0,
      vulnerabilities: 0,
      codeSmells: 0
    },
  
    trivy: project.trivyResults || {
      critical: 0,
      high: 0,
      medium: 0
    },
  
    sonarReportUrl: project.sonarReportUrl || '',
    trivyReportUrl: project.trivyReportUrl || '',
  
    lastScan: project.lastBuild
      ? new Date(project.lastBuild).toLocaleTimeString()
      : 'Never'
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Security Reports</h1>
        <div className="security-badge">
          <ShieldCheck size={18} />
          <span>Policy: Enforced</span>
        </div>
      </div>

      {loading ? (
        <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : securityData.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ShieldX size={48} className="empty-icon" style={{ opacity: 0.5, marginBottom: '1rem', color: '#888' }} />
          <h3>No Projects Found</h3>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>Connect a repository in the Projects tab to view its security scan reports here.</p>
        </div>
      ) : (
        <div className="security-grid">
          {securityData.map((report) => (
            <div key={report.id} className="security-card glass-panel">
              <div className="card-header">
                <h3>{report.project}</h3>
                <span className="scan-time">{report.lastScan}</span>
              </div>

              <div className="scan-sections">
                <div className="scan-block sonar">
                  <div className="block-title">
                    <Terminal size={16} />
                    <h4>SonarQube Analysis</h4>
                  </div>
                  <div className="sonar-stats">
                    <div className={`status-pill ${report.sonarQube.status.toLowerCase()}`}>
                      {report.sonarQube.status}
                    </div>
                    <div className="stats-row">
                      <span>Bugs: <strong>{report.sonarQube.bugs}</strong></span>
                      <span>Vulnerabilities: <strong>{report.sonarQube.vulnerabilities}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="scan-block trivy">
                  <div className="block-title">
                    <ShieldAlert size={16} />
                    <h4>Trivy Image Scan</h4>
                  </div>
                  <div className="trivy-stats">
                    <div className="severity-item critical">
                      <span>Critical</span>
                      <strong>{report.trivy.critical}</strong>
                    </div>
                    <div className="severity-item high">
                      <span>High</span>
                      <strong>{report.trivy.high}</strong>
                    </div>
                    <div className="severity-item medium">
                      <span>Medium</span>
                      <strong>{report.trivy.medium}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                {/* <button className="btn btn-secondary btn-sm">
                  Full Sonar Report <ExternalLink size={14} />
                </button>
                <button className="btn btn-secondary btn-sm">
                  Trivy Details <ExternalLink size={14} />
                </button> */}
                <button
  className="btn btn-secondary btn-sm"
  onClick={() => {
    if (report.sonarReportUrl) {
      window.open(report.sonarReportUrl, '_blank');
    } else {
      alert('No Sonar report available');
    }
  }}
>
  Full Sonar Report <ExternalLink size={14} />
</button>

<button
  className="btn btn-secondary btn-sm"
  onClick={() => {
    if (report.trivyReportUrl) {
      window.open(report.trivyReportUrl, '_blank');
    } else {
      alert('No Trivy report available');
    }
  }}
>
  Trivy Details <ExternalLink size={14} />
</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Security;
