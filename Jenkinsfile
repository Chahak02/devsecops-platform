pipeline {
    agent any

    tools {
        // This must match the name you gave in Step 1
        nodejs 'NodeJS 20' 
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                // Later, we will add git checkout commands here
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building React Dashboard...'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Running SonarCloud SAST Scan (Mock for now)...'
                // This is where SonarCloud will go in Phase 3
            }
        }

        stage('Containerize') {
            steps {
                echo 'Building Docker Images...'
                // This is where Docker build/push will go in Phase 4
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Minikube...'
                // This is where kubectl commands will go
            }
        }
    }
}
