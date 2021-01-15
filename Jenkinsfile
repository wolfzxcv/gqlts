pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo '---start build---'
                nodejs(nodeJSInstallationName: 'node14.15.4') {
                sh 'npm i'
                sh 'npm run build'
                }
            }
        }
        stage('Test') {
            steps {
                echo '---start test---'
                echo 'Do check'
            }
        }
        stage('Deploy') {
            steps {
                echo '---start deploy---'
                sh 'docker-compose up -d --build'
            }
        }
    }
}