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
                sh 'ssh -t pmduser@10.20.30.215 "cd ~/cicd/jenkins_home/workspace && docker-compose up -d --build"'
            }
        }
    }
}