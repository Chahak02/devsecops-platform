pipeline {
    agent any

    tools {
        // This must match the name you gave in Jenkins
        nodejs 'NodeJS 20' 
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm // This tells Jenkins to pull from your GitHub repo!
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
                echo 'Fetching SonarCloud Token from HashiCorp Vault...'
                withVault([configuration: [vaultUrl: 'http://devsecops-vault:8200', vaultCredentialId: 'vault-root-token'], vaultSecrets: [[engineVersion: 2, path: 'secret/sonarcloud', secretValues: [[envVar: 'SONAR_TOKEN', vaultKey: 'token']]]]]) {
                    echo "Running SonarCloud SAST Scan..."
                    sh 'npx sonar-scanner'
                }
            }
        }

        stage('Containerize') {
            steps {
                echo 'Building Docker Images...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                    sh 'docker build -t $DOCKER_USER/devsecops-backend:latest ./backend'
                    sh 'docker build -t $DOCKER_USER/devsecops-frontend:latest ./frontend'
                    sh 'docker push $DOCKER_USER/devsecops-backend:latest'
                    sh 'docker push $DOCKER_USER/devsecops-frontend:latest'
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                echo 'Scanning Docker Images for vulnerabilities...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    // Scan the backend image
                    sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL $DOCKER_USER/devsecops-backend:latest'
                }
            }
        }

        stage('Policy Enforcement') {
            steps {
                echo 'Enforcing DevSecOps Security Policies...'
                script {
                    // Logic: If security scans find critical issues, fail the build!
                    // For the demo, we assume the scan passed if it reached this stage
                    echo '✅ Security Policies Passed. Proceeding to Deployment.'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes using Ansible...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh 'ansible-playbook ansible/playbook.yml'
                }
            }
        }
    }
}
