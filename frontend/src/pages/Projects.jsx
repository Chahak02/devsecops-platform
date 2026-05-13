import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, GitBranch, Loader2 } from 'lucide-react';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', repo: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Use standard axios config, mock for now if backend isn't up
      const response = await axios.get('http://localhost:5000/api/projects').catch(() => {
        return { data: [
          { id: 1, name: 'Calculator App', status: 'Deployed', repo: 'github.com/user/calc' },
          { id: 2, name: 'E-commerce API', status: 'Failed', repo: 'github.com/user/ecommerce' }
        ]};
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/projects', newProject).catch(() => {
        return { data: { id: Date.now(), ...newProject, status: 'Pending' } };
      });
      setProjects([...projects, response.data]);
      setShowModal(false);
      setNewProject({ name: '', repo: '' });
    } catch (error) {
      console.error('Error creating project:', error);
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
            <div key={project.id} className="project-card glass-panel">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`badge ${
                  project.status === 'Deployed' ? 'badge-success' : 
                  project.status === 'Failed' ? 'badge-error' : 'badge-warning'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="project-repo">
                <GitBranch size={16} />
                <span>{project.repo}</span>
              </div>
              <div className="project-actions">
                <button className="btn btn-secondary">View Deployments</button>
                <button className="btn btn-secondary">Settings</button>
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
