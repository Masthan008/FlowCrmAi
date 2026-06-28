pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['local', 'remote_ssh'],
            description: 'Where to deploy: "local" (Jenkins runs directly on the VPS) or "remote_ssh" (Jenkins runs on a separate server).'
        )
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'The Git branch to check out and deploy (e.g., main, develop).'
        )
        choice(
            name: 'ACTION',
            choices: ['deploy', 'down', 'restart', 'logs'],
            description: '''Choose the action to execute:
1. deploy  - Pulls the branch, builds/starts containers, runs migrations.
2. down    - Stops and removes all containers.
3. restart - Restarts all services.
4. logs    - Displays logs of running containers.'''
        )
        string(
            name: 'SSH_CREDENTIAL_ID',
            defaultValue: 'vps-ssh-key',
            description: 'Jenkins Credential ID for VPS SSH Private Key (only used for remote_ssh).'
        )
        string(
            name: 'VPS_USER',
            defaultValue: 'root',
            description: 'SSH user for the VPS (only used for remote_ssh).'
        )
        string(
            name: 'VPS_IP',
            defaultValue: 'srv1705207',
            description: 'IP Address or Domain of the VPS (only used for remote_ssh).'
        )
        string(
            name: 'VPS_DEPLOY_DIR',
            defaultValue: '/home/FlowCrmAi',
            description: 'Absolute path to the deployment directory on the VPS (only used for remote_ssh).'
        )
    }

    stages {
        stage('Local Checkout') {
            when {
                expression { params.DEPLOY_TARGET == 'local' }
            }
            steps {
                script {
                    echo "Checking out and pulling latest changes for branch: ${params.BRANCH}..."
                    sh """
                        git fetch --all
                        git checkout ${params.BRANCH}
                        git pull origin ${params.BRANCH}
                    """
                }
            }
        }

        stage('Local Verify Permissions') {
            when {
                allOf {
                    expression { params.DEPLOY_TARGET == 'local' }
                    expression { params.ACTION == 'deploy' }
                }
            }
            steps {
                echo 'Checking deploy script permissions...'
                sh '''
                    if [ -f deploy.sh ]; then
                        chmod +x deploy.sh
                        echo "✅ Granted execution permissions to deploy.sh"
                    else
                        echo "❌ deploy.sh not found!"
                        exit 1
                    fi
                '''
            }
        }

        stage('Local Execute Action') {
            when {
                expression { params.DEPLOY_TARGET == 'local' }
            }
            steps {
                script {
                    def dockerCmd = "docker compose"
                    if (sh(script: "command -v docker-compose >/dev/null 2>&1", returnStatus: true) == 0) {
                        dockerCmd = "docker-compose"
                    }

                    switch(params.ACTION) {
                        case 'deploy':
                            echo '🚀 Executing local deploy.sh script...'
                            sh './deploy.sh'
                            break
                            
                        case 'down':
                            echo '🛑 Stopping and removing all Docker containers locally...'
                            sh "export COMPOSE_PROJECT_NAME=flow-crm-ai && ${dockerCmd} down --remove-orphans"
                            break

                        case 'restart':
                            echo '🔄 Restarting running Docker containers locally...'
                            sh "export COMPOSE_PROJECT_NAME=flow-crm-ai && ${dockerCmd} restart"
                            break

                        case 'logs':
                            echo '📋 Fetching local container logs...'
                            sh "export COMPOSE_PROJECT_NAME=flow-crm-ai && ${dockerCmd} logs --tail=100"
                            break
                    }
                }
            }
        }

        stage('Remote SSH Deploy/Action') {
            when {
                expression { params.DEPLOY_TARGET == 'remote_ssh' }
            }
            steps {
                script {
                    echo "🔗 Connecting to VPS (${params.VPS_USER}@${params.VPS_IP}) via SSH using Credential ID: ${params.SSH_CREDENTIAL_ID}..."
                    
                    // We wrap the remote execution inside sshagent
                    sshagent(credentials: [params.SSH_CREDENTIAL_ID]) {
                        // Commands to run on the VPS
                        def remoteCmd = ""
                        
                        switch(params.ACTION) {
                            case 'deploy':
                                remoteCmd = """
                                    cd ${params.VPS_DEPLOY_DIR}
                                    echo "🌿 Pulling branch ${params.BRANCH} on VPS..."
                                    git fetch --all
                                    git checkout ${params.BRANCH}
                                    git pull origin ${params.BRANCH}
                                    chmod +x deploy.sh
                                    ./deploy.sh
                                """
                                break
                                
                            case 'down':
                                remoteCmd = """
                                    cd ${params.VPS_DEPLOY_DIR}
                                    echo "🛑 Stopping and removing containers on VPS..."
                                    docker compose down --remove-orphans || docker-compose down --remove-orphans
                                """
                                break

                            case 'restart':
                                remoteCmd = """
                                    cd ${params.VPS_DEPLOY_DIR}
                                    echo "🔄 Restarting containers on VPS..."
                                    docker compose restart || docker-compose restart
                                """
                                break

                            case 'logs':
                                remoteCmd = """
                                    cd ${params.VPS_DEPLOY_DIR}
                                    echo "📋 Fetching logs on VPS..."
                                    docker compose logs --tail=100 || docker-compose logs --tail=100
                                """
                                break
                        }

                        sh """
                            ssh -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "
                                if [ ! -d \\"${params.VPS_DEPLOY_DIR}\\" ]; then
                                    echo \\"❌ Error: Deployment directory ${params.VPS_DEPLOY_DIR} does not exist on the VPS!\\"
                                    exit 1
                                fi
                                ${remoteCmd}
                            "
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Jenkins Pipeline completed successfully!"
        }
        failure {
            echo "❌ Jenkins Pipeline execution failed. Please check the build logs above."
        }
    }
}
