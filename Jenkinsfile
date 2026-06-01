// ══════════════════════════════════════════════════════════════════
// DevOps Tool 2: Jenkins CI/CD Pipeline
// Online Quiz & Practice System
// Pipeline: Test → Quality → Build → Stage → Approve → Production
// ══════════════════════════════════════════════════════════════════

pipeline {
    agent any

    environment {
        APP_NAME              = 'online-quiz-system'
        DOCKER_IMAGE_BACKEND  = "quiz-backend:${BUILD_NUMBER}"
        DOCKER_IMAGE_FRONTEND = "quiz-frontend:${BUILD_NUMBER}"
        SONAR_HOST            = 'http://localhost:9000'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Stage 1: Checking out source code...'
                checkout scm
            }
        }

        // ── Stage 2: Backend Unit Tests (Pytest) ───────────────
        stage('Backend Tests') {
            steps {
                echo '🧪 Stage 2: Running Python unit & ML tests with pytest...'
                dir('backend') {
                    sh '''
                        pip install -r requirements.txt
                        python -m pytest tests/ -v --tb=short --junitxml=test-results.xml
                    '''
                }
            }
            post {
                always { junit 'backend/test-results.xml' }
            }
        }

        // ── Stage 3: Frontend Tests ────────────────────────────
        stage('Frontend Tests') {
            steps {
                echo '🧪 Stage 3: Running frontend tests...'
                dir('frontend') {
                    sh 'npm ci && npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        // ── Stage 4: SonarQube Code Quality Analysis ───────────
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Stage 4: Running SonarQube static analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner -Dsonar.projectKey=online-quiz-system'
                }
            }
        }

        // ── Stage 5: Quality Gate Check ────────────────────────
        stage('Quality Gate') {
            steps {
                echo '🚦 Stage 5: Checking SonarQube quality gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ── Stage 6: Docker Build ──────────────────────────────
        stage('Docker Build') {
            steps {
                echo '🐳 Stage 6: Building Docker images...'
                sh "docker build -f Dockerfile.backend -t ${DOCKER_IMAGE_BACKEND} ."
                sh "docker build -f Dockerfile.frontend -t ${DOCKER_IMAGE_FRONTEND} ."
            }
        }

        // ── Stage 7: Deploy to Staging ─────────────────────────
        stage('Deploy Staging') {
            steps {
                echo '🚀 Stage 7: Deploying to staging...'
                sh '''
                    docker-compose down --remove-orphans || true
                    docker-compose up -d backend frontend
                    sleep 10
                    curl -f http://localhost:5000/api/health && echo "✅ API health check passed!"
                '''
            }
        }

        // ── Stage 8: Manual Approval for Production ────────────
        stage('Approve Production') {
            when { branch 'main' }
            input {
                message "Deploy to PRODUCTION?"
                ok "Yes, Deploy Now!"
            }
            steps {
                echo '✅ Production deployment approved!'
            }
        }

        // ── Stage 9: Production Deploy ─────────────────────────
        stage('Deploy Production') {
            when { branch 'main' }
            steps {
                echo '🌐 Stage 9: Deploying to production...'
                sh 'docker-compose up -d'
                echo '🎉 Production deployment complete!'
            }
        }
    }

    post {
        success { echo "🎉 Pipeline SUCCESS — Build #${BUILD_NUMBER} deployed!" }
        failure { echo "❌ Pipeline FAILED — Check logs above." }
        always  { cleanWs() }
    }
}
