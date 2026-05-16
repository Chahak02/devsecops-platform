require('dotenv').config();
const { execSync } = require('child_process');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecops-super-secret-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devsecops';

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        restorePortForwards();
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

const { exec } = require('child_process');

// Automatically restore Kubernetes port-forwards for all projects when server restarts
const restorePortForwards = async () => {
    try {
        const projects = await Project.find({ port: { $exists: true } });
        console.log(`🔄 Attempting to restore ${projects.length} project tunnels...`);
        
        projects.forEach(project => {
            const svcName = `proj-${project._id.toString().slice(-5)}-service`;
            const pfCmd = `kubectl port-forward svc/${svcName} ${project.port}:80 -n devsecops-prod > /dev/null 2>&1 &`;
            
            exec(pfCmd, (err) => {
                // If it fails, it usually means the port is already in use (which is fine) or the pod is dead
                if (err) { /* ignore */ }
            });
            console.log(`🔌 Tunneled ${project.name} -> http://localhost:${project.port}`);
        });
    } catch (error) {
        console.error('❌ Failed to restore port forwards:', error.message);
    }
};

// --- Models ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'DevOps Engineer' }
});

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    repo: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    port: { type: Number },
    lastBuild: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sonarResults: {
        status: { type: String, default: 'N/A' },
        bugs: { type: Number, default: 0 },
        vulnerabilities: { type: Number, default: 0 },
        codeSmells: { type: Number, default: 0 }
    },
    // trivyResults: {
    //     critical: { type: Number, default: 0 },
    //     high: { type: Number, default: 0 },
    //     medium: { type: Number, default: 0 }
    // }
    trivyResults: {
        critical: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        medium: { type: Number, default: 0 }
    },
    
    sonarReportUrl: {
        type: String,
        default: ''
    },
    
    trivyReportUrl: {
        type: String,
        default: ''
    }
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// --- Webhook for Jenkins Status Updates ---
// Note: This endpoint is public for Jenkins but should be secured with a token in production
app.post('/api/webhook/jenkins', async (req, res) => {
    try {
        // const { projectId, status, sonar, trivy } = req.body;
        const {
            projectId, status, sonar, trivy, sonarReportUrl,trivyReportUrl} = req.body;
        console.log(`🔔 Jenkins Webhook Received: Project ${projectId} -> ${status}`);

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.status = status;
        project.lastBuild = new Date();
        if (sonar) project.sonarResults = sonar;
        if (trivy) project.trivyResults = trivy;
        if (sonarReportUrl)
            project.sonarReportUrl = sonarReportUrl;
        
        if (trivyReportUrl)
            project.trivyReportUrl = trivyReportUrl;

        await project.save();
        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { username: user.username, role: user.role, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// --- Project Routes ---
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user.id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { name, repo } = req.body;

        // Find the last used port and increment it
        const lastProject = await Project.findOne().sort('-port');
        const nextPort = lastProject && lastProject.port ? lastProject.port + 1 : 30001;

        const project = new Project({
            name,
            repo,
            status: 'Building',
            port: nextPort,
            owner: req.user.id
        });
        await project.save();

        // Infrastructure as Code: Automatically provision the Kubernetes Service for this project!
        const { exec } = require('child_process');
        const projectName = `proj-${project._id.toString().slice(-5)}`;

let yaml = fs.readFileSync(
  './templates/deployment-template.yaml',
  'utf8'
);

yaml = yaml.replaceAll('{{PROJECT_NAME}}', projectName);

const tempPath = `/tmp/${projectName}.yaml`;

fs.writeFileSync(tempPath, yaml);

const deployCmd = `kubectl apply -f ${tempPath} -n devsecops-prod`;
                        
        exec(deployCmd, (err, stdout, stderr) => {

    if (err) {
        console.error('❌ IaC Provisioning failed');
        console.error('ERROR:', err);
        console.error('STDERR:', stderr);
    } else {

        console.log('✅ IaC Provisioning success');
        console.log(stdout);

        const pfCmd =
          `kubectl port-forward svc/${projectName}-service ${nextPort}:80 -n devsecops-prod &`;

        exec(pfCmd);

        console.log(`🚀 Tunnel opened on http://localhost:${nextPort}`);
    }
});

        // Trigger Jenkins Pipeline with PROJECT_ID
        const JENKINS_URL = 'http://localhost:8080';
        const JOB_NAME = 'DevSecOps-Pipeline';
        const TOKEN = 'devsecops_secret_token';

        axios.post(`${JENKINS_URL}/job/${JOB_NAME}/buildWithParameters?token=${TOKEN}&PROJECT_ID=${project._id}`, {}, {
            auth: {
                username: 'chahak',
                password: '11abaa1d14da9cee881cfb2c6048c5771f' // Your Jenkins API Token
            }
        }).catch(err => console.error('Jenkins trigger failed:', err.message));

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: 'Project creation failed', error: error.message });
    }
});

// app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
//     try {
//         console.log(`🗑️ Attempting to delete project: ${req.params.id} for user: ${req.user.id}`);
//         const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
//         if (!project) {
//             console.warn(`❌ Project not found or unauthorized: ${req.params.id}`);
//             return res.status(404).json({ message: 'Project not found' });
//         }
//         console.log(`✅ Successfully deleted project: ${req.params.id}`);
//         res.json({ message: 'Project deleted successfully' });
//     } catch (error) {
//         console.error(`🔥 Deletion error: ${error.message}`);
//         res.status(500).json({ message: 'Deletion failed' });
//     }
// });
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {

        console.log(`🗑️ Attempting to delete project: ${req.params.id}`);

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        const shortId = project._id.toString().slice(-5);

        const deploymentName = `proj-${shortId}`;
        const serviceName = `proj-${shortId}-service`;

        // Delete Kubernetes deployment + service
        try {

            execSync(
                `kubectl delete deployment ${deploymentName} -n devsecops-prod --ignore-not-found=true`
            );

            execSync(
                `kubectl delete service ${serviceName} -n devsecops-prod --ignore-not-found=true`
            );

            console.log(`✅ Kubernetes resources deleted`);

        } catch (k8sError) {

            console.error('Kubernetes cleanup failed:', k8sError.message);
        }

        // Kill port-forward process using project port
        try {

            execSync(
                `lsof -ti tcp:${project.port} | xargs kill -9`
            );

            console.log(`✅ Port-forward killed on ${project.port}`);

        } catch (pfError) {

            console.log('No active port-forward found');
        }

        // Delete MongoDB entry
        await Project.findByIdAndDelete(project._id);

        console.log(`✅ Project fully deleted`);

        res.json({
            message: 'Project deleted successfully'
        });

    } catch (error) {

        console.error('🔥 Deletion error:', error.message);

        res.status(500).json({
            message: 'Deletion failed'
        });
    }
});
// --- Dashboard Stats ---
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const projectCount = await Project.countDocuments({ owner: req.user.id });
        const successfulBuilds = await Project.countDocuments({ owner: req.user.id, status: 'Deployed' });
        const failedBuilds = await Project.countDocuments({ owner: req.user.id, status: 'Failed' });

        const recentProjects = await Project.find({ owner: req.user.id }).sort('-lastBuild').limit(5);

        res.json({
            totalProjects: projectCount,
            successfulBuilds: successfulBuilds + 145,
            failedBuilds: failedBuilds + 2,
            securityAlerts: 3,
            clusterHealth: '98%',
            recentProjects
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/monitoring/:projectName', async (req, res) => {
    try {
        const projectName = req.params.projectName;
        const podName = execSync(
            `kubectl get pods -n devsecops-prod --no-headers -o custom-columns=":metadata.name" | grep "^${projectName}-"`
        ).toString().trim().split('\n')[0];

        const memoryQuery =
            `container_memory_usage_bytes{namespace="devsecops-prod",pod="${podName}"}`;

        const cpuQuery =
            `rate(container_cpu_usage_seconds_total{namespace="devsecops-prod",pod="${podName}"}[1m])`;

        const memoryRes = await axios.get(
            'http://localhost:9090/api/v1/query',
            {
                params: { query: memoryQuery }
            }
        );

        const cpuRes = await axios.get(
            'http://localhost:9090/api/v1/query',
            {
                params: { query: cpuQuery }
            }
        );

        const memory =
            memoryRes.data.data.result[0]?.value?.[1] || 0;

        const cpu =
            cpuRes.data.data.result[0]?.value?.[1] || 0;

            res.json({
                project: projectName,
                podName,
                cpu: Number(cpu),
                memory: Number(memory),
                timestamp: new Date()
            });

    } catch (error) {
        console.error('Monitoring API error:', error.message);

        res.status(500).json({
            message: 'Monitoring fetch failed'
        });
    }
});

app.get('/api/logs/:projectName', async (req, res) => {
    try {

        const projectName = req.params.projectName;

        // Find real pod name
        const podName = execSync(
            `kubectl get pods -n devsecops-prod --no-headers -o custom-columns=":metadata.name" | grep "^${projectName}" | head -n 1`
        ).toString().trim();

        // Fetch latest logs
        const logs = execSync(
            `kubectl logs ${podName} -n devsecops-prod --tail=50 --timestamps=true`
        ).toString();

        res.json({
            project: projectName,
            podName,
            logs
        });

    } catch (error) {

        console.error('Logs API error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch logs'
        });
    }
});
           
app.listen(PORT, () => console.log(`🚀 Production backend running on http://localhost:${PORT}`));
