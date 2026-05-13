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
                
                // We securely fetch the token from Vault without hardcoding it!
                withVault([configuration: [vaultUrl: 'http://devsecops-vault:8200', vaultCredentialId: 'vault-root-token'], vaultSecrets: [[engineVersion: 2, path: 'secret/sonarcloud', secretValues: [[envVar: 'SONAR_TOKEN', vaultKey: 'token']]]]]) {
                    echo "Running SonarCloud SAST Scan..."
                    // We use npx to run the scanner so we don't have to install it globally
                    sh 'npx sonar-scanner'
                }
            }
        }

        stage('Containerize') {
            steps {
                echo 'Building Docker Images...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    script {
                        // This fetches the Docker CLI we installed in Jenkins
                        def dockerHome = tool 'docker'
                        env.PATH = "${dockerHome}/bin:${env.PATH}"
                    }
                    
                    // Securely login to Docker Hub
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    
                    // Build the images
                    sh 'docker build -t $DOCKER_USER/devsecops-backend:latest ./backend'
                    sh 'docker build -t $DOCKER_USER/devsecops-frontend:latest ./frontend'
                    
                    // Push them to Docker Hub!
                    sh 'docker push $DOCKER_USER/devsecops-backend:latest'
                    sh 'docker push $DOCKER_USER/devsecops-frontend:latest'
                }
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
