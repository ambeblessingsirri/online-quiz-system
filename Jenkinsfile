pipeline {
    agent any

    environment {
        APP_NAME        = 'online-quiz-system'
        DOCKER_IMAGE    = "quizmaster/${APP_NAME}"
        NODE_VERSION    = '20'
        COVERAGE_MIN    = '70'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                echo '════════════════════════════════════════'
                echo '  Stage 1 ▶ Checkout source code'
                echo '════════════════════════════════════════'
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '════════════════════════════════════════'
                echo '  Stage 2 ▶ npm ci (clean install)'
                echo '════════════════════════════════════════'
                sh 'node --version && npm --version'
                sh 'npm ci'
            }
        }

        stage('Code Quality') {
            parallel {
                stage('ESLint') {
                    steps {
                        echo '  ▷ Running ESLint...'
                        sh 'npm run lint:check'
                    }
                }
                stage('Prettier') {
                    steps {
                        echo '  ▷ Checking Prettier formatting...'
                        sh 'npm run format:check'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo '════════════════════════════════════════'
                echo '  Stage 4 ▶ Jest unit & integration tests'
                echo '════════════════════════════════════════'
                sh 'npm run test:coverage'
            }
            post {
                always {
                    echo 'Publishing test coverage report...'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '════════════════════════════════════════'
                echo '  Stage 5 ▶ Build Docker image'
                echo '════════════════════════════════════════'
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} -t ${DOCKER_IMAGE}:latest ."
                sh "docker images | grep ${APP_NAME}"
            }
        }

        stage('Push to Docker Hub') {
            when {
                branch 'main'
            }
            steps {
                echo '════════════════════════════════════════'
                echo '  Stage 6 ▶ Push image to Docker Hub'
                echo '════════════════════════════════════════'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                    sh "docker logout"
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo '════════════════════════════════════════'
                echo '  Stage 7 ▶ Deploy to staging'
                echo '════════════════════════════════════════'
                sh 'docker-compose down --remove-orphans || true'
                sh 'docker-compose up -d --build'
                sh 'sleep 10'
                sh 'docker-compose ps'
                sh 'curl -sf http://localhost/api/health && echo "Health check passed!"'
            }
        }

    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Image: ${DOCKER_IMAGE}:${BUILD_NUMBER} is live."
        }
        failure {
            echo '❌ Pipeline FAILED — check logs above.'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
