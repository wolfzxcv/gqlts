pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                nodejs(nodeJSInstallationName: 'node14.15.4') {
                sh 'npm --version'
                sh 'npm i'
                sh 'npm run build'
                }
            }
        }
        stage('Test') {
            steps {
                echo 'Do check'
            }
        }
        stage('Deploy') {
            steps {
                sh 'sudo docker-compose.yml up -d --build'
            }
        }
    }
}
