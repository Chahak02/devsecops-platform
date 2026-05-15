import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, GitBranch, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', repo: '' });
  const navigate = useNavigate();

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
      console.error('Error fetching projects:', error);
      setProjects([]);
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/projects', newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects([...projects, response.data]);
      setShowModal(false);
      setNewProject({ name: '', repo: '' });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to connect repository: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <Loader2 className="spinner" size={32} />
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card glass-panel">
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="header-actions">
                  <span className={`badge ${
                    project.status === 'Deployed' ? 'badge-success' : 
                    project.status === 'Failed' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {project.status}
                  </span>
                  <button className="delete-btn" onClick={() => handleDeleteProject(project._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="project-repo">
                <GitBranch size={16} />
                <span>{project.repo}</span>
              </div>
              <div className="project-meta">
                <span className="meta-item">v1.0.4</span>
                <span className="meta-item">devsecops-prod</span>
              </div>
              <div className="project-actions">
                <button
		  className="btn btn-secondary"
		  onClick={() =>navigate(`/monitoring?project=proj-${project._id.slice(-5)}`)}
		>
  		  Monitoring
		</button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate(`/logs?project=proj-${project._id.slice(-5)}`)}
                >
                  Logs
                </button>
              </div>
              <div className="project-footer">
                <a href={`http://localhost:${project.port || 30001}`} target="_blank" rel="noreferrer" className="live-link">
                  View Live Site <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal glass-panel">
            <h2>Connect New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="e.g. My Awesome App"
                  required 
                />
              </div>
              <div className="form-group">
                <label>GitHub Repository URL</label>
                <input 
                  type="text" 
                  value={newProject.repo}
                  onChange={(e) => setNewProject({...newProject, repo: e.target.value})}
                  placeholder="https://github.com/username/repo"
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Connect Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
