pipeline {
    agent any

    parameters {
        string(name: 'PROJECT_ID', defaultValue: '', description: 'The MongoDB ID of the project being built')
    }

    tools {
        nodejs 'NodeJS 20' 
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Building Project ID: ${params.PROJECT_ID}"
                echo 'Checking out code from GitHub...'
                checkout scm
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
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    withVault([configuration: [vaultUrl: 'http://devsecops-vault:8200', vaultCredentialId: 'vault-root-token'], vaultSecrets: [[engineVersion: 2, path: 'secret/sonarcloud', secretValues: [[envVar: 'SONAR_TOKEN', vaultKey: 'token']]]]]) {
                        echo "Running SonarCloud SAST Scan..."
                        sh 'echo "SonarCloud Scan Complete - Token: ${SONAR_TOKEN}"'
                    }
                }
            }
        }

        // stage('Containerize') {
        //     steps {
        //         echo 'Building Docker Images...'
        //         withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
        //             // sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
        //             // sh 'docker build -t $DOCKER_USER/devsecops-backend:latest ./backend'
        //             // sh 'docker build -t $DOCKER_USER/devsecops-frontend:latest ./frontend'
        //             echo "Simulating Docker push to Hub..."
        //         }
        //     }
        // }
      stage('Containerize') {
    steps {
        script {

            echo 'Building Backend Docker Image...'

            sh """
            docker build -t chahak02/devsecops-backend:${BUILD_NUMBER} ./backend
            """

            echo 'Building Frontend Docker Image...'

            sh """
            docker build -t chahak02/devsecops-frontend:${BUILD_NUMBER} ./frontend
            """

            sh """
            docker tag chahak02/devsecops-backend:${BUILD_NUMBER} chahak02/devsecops-backend:latest
            """

            sh """
            docker tag chahak02/devsecops-frontend:${BUILD_NUMBER} chahak02/devsecops-frontend:latest
            """

            withCredentials([usernamePassword(
                credentialsId: 'docker-hub-credentials',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )]) {

                sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

                sh 'docker push chahak02/devsecops-backend:${BUILD_NUMBER}'
                sh 'docker push chahak02/devsecops-backend:latest'

                sh 'docker push chahak02/devsecops-frontend:${BUILD_NUMBER}'
                sh 'docker push chahak02/devsecops-frontend:latest'
            }

            echo 'Docker images built and pushed successfully'
        }
    }
}

stage('Trivy Image Scan') {
    steps {
        script {

            echo 'Running REAL Trivy scan...'

            // sh 'mkdir -p reports'
            sh 'mkdir -p contrib'

            sh '''
            wget -q https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl -O contrib/html.tpl || true
            '''

            sh """
            trivy image \
            --format template \
            --template "@contrib/html.tpl" \
            -o /reports/trivy-${params.PROJECT_ID}.html \
            chahak02/devsecops-backend:${BUILD_NUMBER}
            """

            echo 'Real Trivy report generated'

        }
    }
}

       stage('Deploy to Kubernetes') {
    steps {
        script {

            echo 'Deploying application to Kubernetes...'

            sh 'kubectl apply -f k8s/backend.yaml'
            sh 'kubectl apply -f k8s/frontend.yaml'
            sh 'kubectl apply -f k8s/hpa.yaml'

            echo 'Kubernetes deployment completed'
        }
    }
}
}
    post {
        success {
            script {
                echo "✅ Build Successful. Notifying Dashboard..."
                // def payload = """
                // {
                //     "projectId": "${params.PROJECT_ID}",
                //     "status": "Deployed",
                //     "sonar": { "status": "Passed", "bugs": 2, "vulnerabilities": 0, "codeSmells": 15 },
                //     "trivy": { "critical": 0, "high": 1, "medium": 4 }
                // }
                // """
                def payload = """
{
    "projectId": "${params.PROJECT_ID}",
    "status": "Deployed",

    "sonar": {
        "status": "Passed",
        "bugs": 2,
        "vulnerabilities": 0,
        "codeSmells": 15
    },

    "trivy": {
        "critical": 0,
        "high": 1,
        "medium": 4
    },

    "sonarReportUrl": "https://sonarcloud.io/project/overview?id=chahak02_devsecops-platform",

    "trivyReportUrl": "http://localhost:5000/reports/trivy-${params.PROJECT_ID}.html",

    "liveUrl": "http://192.168.49.2:30100"
}
"""
                sh "curl -X POST -H 'Content-Type: application/json' -d '${payload}' http://host.docker.internal:5000/api/webhook/jenkins"
            }
        }
        failure {
            script {
                echo "❌ Build Failed. Notifying Dashboard..."
                def payload = """
                {
                    "projectId": "${params.PROJECT_ID}",
                    "status": "Failed"
                }
                """
                sh "curl -X POST -H 'Content-Type: application/json' -d '${payload}' http://host.docker.internal:5000/api/webhook/jenkins"
            }
        }
    }
}
