require('dotenv').config();
const axios = require('axios'); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Basic Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'DevSecOps API is running smoothly.' });
});

// Mock Projects API
const projects = [
    { id: 1, name: 'Calculator App', status: 'Deployed', repo: 'github.com/user/calc' },
    { id: 2, name: 'E-commerce API', status: 'Failed', repo: 'github.com/user/ecommerce' }
];

app.get('/api/projects', (req, res) => {
    res.status(200).json(projects);
});

// app.post('/api/projects', (req, res) => {
//     const { name, repo } = req.body;
//     if (!name || !repo) {
//         return res.status(400).json({ message: 'Name and Repo are required.' });
//     }
//     const newProject = { id: projects.length + 1, name, repo, status: 'Pending' };
//     projects.push(newProject);
//     res.status(201).json(newProject);
// });

app.post('/api/projects', async (req, res) => {
    const { name, repo } = req.body;
    if (!name || !repo) {
        return res.status(400).json({ message: 'Name and Repo are required.' });
    }
    const newProject = { id: projects.length + 1, name, repo, status: 'Building' };
    projects.push(newProject);

        // Trigger Jenkins Pipeline
        try {
            const JENKINS_URL = 'http://localhost:8080';
            const JOB_NAME = 'DevSecOps-Pipeline';
            const TOKEN = 'devsecops_secret_token';
            
            // Add auth object with your Jenkins username and the new API Token
            await axios.post(`${JENKINS_URL}/job/${JOB_NAME}/build?token=${TOKEN}`, {}, {
                auth: {
                    username: 'chahak', // <-- Change this if your username isn't 'admin'
                    //password: '110271c0537557939e8fa15f4441301e23' // <-- Paste the token here
                    password: '11abaa1d14da9cee881cfb2c6048c5771f'
                }
            });
            console.log('Successfully triggered Jenkins pipeline!');
        } catch (error) {
            console.error('Failed to trigger Jenkins:', error.message);
        }
        res.status(201).json(newProject);
});
    


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
