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
                sh 'ssh pmduser@10.20.30.215'
                sh 'cd ~/cicd/jenkins_home/workspace && docker-compose up -d --build'
                // sh 'ls'
                // sh 'cat .env'
                // dir('../') {
                // sh 'cat docker-compose.yml'
                // sh 'docker-compose up -d --build'
                // }
                // sh 'sudo cp /Desktop/docker-compose.yml ~/workspace/'
                // sh 'sudo /usr/local/bin/ docker-compose up -d --build'
            }
        }
    }
}
