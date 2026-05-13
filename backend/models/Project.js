const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    githubRepoUrl: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Building', 'Scanning', 'Deployed', 'Failed'],
        default: 'Pending'
    },
    lastDeploymentId: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
