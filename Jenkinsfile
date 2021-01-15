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
                // sh 'sudo cp /Desktop/docker-compose.yml ~/workspace/'
                sh 'sudo /usr/local/bin/docker-compose docker-compose up -d --build'
            }
        }
    }
}
