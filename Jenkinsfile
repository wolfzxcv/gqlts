pipeline {
    agent { label 'docker' }

    environment {
        PATH = "$PATH:/usr/local/bin"
    }

    stages {
        stage('Fetch from GitHub') {
            steps {
                sh 'git pull'
                sh 'git checkout develop'
                sh 'git branch'
            }
        }
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
                sh '/usr/local/bin/docker-compose -f docker-compose.yml up -d --build'
            }
        }
    }
}
