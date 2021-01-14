pipeline {
    agent { label 'docker' }

    stages {
        stage('Initialize') {
        echo 'Initializing...'
        def node = tool name: 'Node-14.15.4', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        env.PATH = "${node}/bin:${env.PATH}"

        sh 'node -v'
        }

        stage('Build') {
            steps {
                npm i
                npm run build
            }
        }
        stage('Test') {
            steps {
                echo 'Do check'
            }
        }
        stage('Deploy') {
            steps {
                sh 'docker-compose -f build.yml up --exit-code-from fpm_build --remove-orphans fpm_build'
            }
        }
    }
}
