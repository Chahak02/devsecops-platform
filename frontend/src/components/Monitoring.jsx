import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ServerOff, Loader2 } from 'lucide-react';
import './Monitoring.css';

const Monitoring = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    
    const initialProject = searchParams.get('project');
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/projects', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fetchedProjects = response.data;
            setProjects(fetchedProjects);
            
            if (fetchedProjects.length > 0) {
                // If a project was passed in URL, try to select it, otherwise select the first one
                const matchedProject = fetchedProjects.find(p => p.name === initialProject);
                if (matchedProject) {
                    setSelectedProjectId(matchedProject._id);
                } else {
                    setSelectedProjectId(fetchedProjects[0]._id);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects for monitoring:', error);
            setProjects([]);
            setLoading(false);
        }
    };
    
    const fetchMetrics = async (projectId) => {

    try {

        const res = await axios.get(
            `http://localhost:5000/api/monitoring/proj-${projectId.slice(-5)}`
        );

        setMetrics(res.data);

    } catch (error) {

        console.error('Monitoring fetch failed:', error);
    }
};

useEffect(() => {
        fetchProjects();
    }, []);

useEffect(() => {

    if (selectedProjectId) {

        fetchMetrics(selectedProjectId);

        const interval = setInterval(() => {
            fetchMetrics(selectedProjectId);
        }, 5000);

        return () => clearInterval(interval);
    }

}, [selectedProjectId]);

    if (loading) {
        return (
            <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                <Loader2 className="spinner" size={32} />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="monitoring-container">
                <div className="monitoring-header">
                    <h2>Performance & Resource Monitoring</h2>
                </div>
                <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <ServerOff size={48} className="empty-icon" style={{ opacity: 0.5, marginBottom: '1rem', color: '#888' }} />
                    <h3>No Projects to Monitor</h3>
                    <p style={{ color: '#888', marginTop: '0.5rem' }}>Deploy a project first to see its live Prometheus metrics and Grafana dashboards here.</p>
                </div>
            </div>
        );
    }

    const selectedProject = projects.find(p => p._id === selectedProjectId) || projects[0];

    // Append a variable to the Grafana URL so it isolates data per project (assuming Grafana is configured with variables like var-namespace or var-pod)
    // We use var-project to make it generic for the demo, which makes the iframe reload and look distinct for each project.
    const grafanaUrl = `http://localhost:3000/d/7d57716318ee0dddbac5a7f451fb7753/node-exporter-nodes?orgId=1&refresh=10s&kiosk&var-project=${selectedProject.name}`;

    return (
        <div className="monitoring-container">
            <div className="monitoring-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Performance & Resource Monitoring</h2>
                    <p>
                        Live metrics powered by <strong>Prometheus</strong> and <strong>Grafana</strong>.
                        (Ensure <code>kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring</code> is running!)
                    </p>
                </div>
                <div className="project-selector" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: '#aaa' }}>Select Project:</label>
                    <select 
                        value={selectedProjectId || ''} 
                        onChange={(e) => {
                            setSelectedProjectId(e.target.value);
                            const p = projects.find(proj => proj._id === e.target.value);
                            if (p) {
                                navigate(`/monitoring?project=proj-${p._id.slice(-5)}`, {
  replace: true
});
                            }
                        }}
                        style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                    >
                        {projects.map(p => (
                            <option key={p._id} value={p._id} style={{ background: '#1e1e2d', color: '#fff' }}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  }}
>

  <div className="metric-card">
    <h3>Project</h3>
    <p>{metrics?.project || 'Loading...'}</p>
  </div>

  <div className="metric-card">
    <h3>CPU Usage</h3>
    <p>{metrics?.cpu?.toFixed(4) || 0}</p>
  </div>

  <div className="metric-card">
    <h3>Memory Usage</h3>
    <p>{metrics?.memory || 0} bytes</p>
  </div>

</div>

            <div className="iframe-wrapper" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                <iframe 
                    key={selectedProject._id} // Force iframe to reload when project changes
                    src={grafanaUrl}
                    title={`Grafana Dashboard for ${selectedProject.name}`}
                    className="grafana-iframe"
                    frameBorder="0"
                    style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: '600px', display: 'block' }}
                ></iframe>
            </div>
        </div>
    );
};

export default Monitoring;
