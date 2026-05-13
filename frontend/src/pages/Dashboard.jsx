import React from 'react';
import { Server, ShieldAlert, GitMerge, Activity } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Platform Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue">
            <Server size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Deployments</h3>
            <p className="stat-value">12</p>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper green">
            <GitMerge size={24} />
          </div>
          <div className="stat-info">
            <h3>Successful Builds</h3>
            <p className="stat-value">148</p>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper red">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <h3>Security Alerts</h3>
            <p className="stat-value">3</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper purple">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Cluster Health</h3>
            <p className="stat-value">98%</p>
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
                <th>Commit</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Calculator App</td>
                <td><span className="badge badge-success">Success</span></td>
                <td><code className="commit-hash">a1b2c3d</code></td>
                <td>2 mins ago</td>
              </tr>
              <tr>
                <td>E-Commerce API</td>
                <td><span className="badge badge-error">Failed</span></td>
                <td><code className="commit-hash">f9e8d7c</code></td>
                <td>1 hour ago</td>
              </tr>
              <tr>
                <td>Auth Service</td>
                <td><span className="badge badge-success">Success</span></td>
                <td><code className="commit-hash">b4a5c6d</code></td>
                <td>3 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
