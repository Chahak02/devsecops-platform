pipeline {
    agent any

    tools {
        // This must match the name you gave in Jenkins
        nodejs 'NodeJS 26' 
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
                withVault([configuration: [vaultUrl: 'http://devsecops-vault:8200', vaultCredentialId: 'vault-root-token'], vaultSecrets: [[path: 'secret/data/sonarcloud', secretValues: [[envVar: 'SONAR_TOKEN', vaultKey: 'token']]]]]) {
                    echo "Running SonarCloud SAST Scan..."
                    // We use npx to run the scanner so we don't have to install it globally
                    sh 'npx sonar-scanner'
                }
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
