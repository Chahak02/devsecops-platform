import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, ShieldAlert, GitMerge, Activity, Loader2, Trash2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStats();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) return <div className="loader-container"><Loader2 className="spinner" size={40} /></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Platform Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue">
            <Server size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Projects</h3>
            <p className="stat-value">{stats?.totalProjects || 0}</p>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper green">
            <GitMerge size={24} />
          </div>
          <div className="stat-info">
            <h3>Successful Builds</h3>
            <p className="stat-value">{stats?.successfulBuilds || 0}</p>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper red">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <h3>Security Alerts</h3>
            <p className="stat-value">{stats?.securityAlerts || 0}</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper purple">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Cluster Health</h3>
            <p className="stat-value">{stats?.clusterHealth || '98%'}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card recent-deployments">
          <h2>Recent Deployments</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Port</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentProjects?.length > 0 ? (
                stats.recentProjects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.name}</td>
                    <td>
                      <span className={`badge ${
                        project.status === 'Deployed' ? 'badge-success' : 
                        project.status === 'Failed' ? 'badge-error' : 'badge-warning'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td><code className="commit-hash">{project.port || 'N/A'}</code></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="delete-btn-table" 
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No active projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
