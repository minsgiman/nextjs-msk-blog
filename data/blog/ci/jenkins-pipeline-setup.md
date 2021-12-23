---
title: Jenkins Pipeline 설정 (with Jenkinsfile)
date: '2019-02-15'
tags: ['jenkins', 'ci']
draft: false
summary: 'JenkinsFile을 통해 Jenkins GUI 에서 jobs를 설정하는 대신 script로 pipeline job 을 설정할 수 있다.'
---

## JenkinsFile

- JenkinsFile을 통해 Jenkins GUI 에서 jobs를 설정하는 대신 script로 pipeline job 을 설정할 수 있다.
- JenkinsFile 작성 방법
  - [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
  - Declarative Pipeline : 보다 쉽게 작성 할 수 있게, 커스텀 되어 있음. Groovy-syntax기반 - Groovy 문법을 잘 몰라도 작성 가능
  - Scripted Pipeline : Groovy기반, Declarative보다 효과적으로 많은 기능을 포함하여 작성 가능. 하지만 작성 난이도가 높음 - Groovy 문법을 잘 알아야 함

## Syntax

- agent : pipeline을 실행할 agent설정. Jenkins cluster (master, slave) 구성도 여기서 한다.
- stages : where the work happens
- stage : each stage, exist inside stages
- steps : Jenkins server or agent 에서 실행할 command를 작성하는 곳. exist inside stage
- when: stage 실행 조건을 설정 한다.

```
stage(“test”) {
   when {
        expression {
		BRANCH_NAME == ‘dev’ || BRANCH_NAME == ‘master’
        }
   }
}
```

- post : 모든 stage들이 끝나거나 각 state가 끝났을 때 수행할 내용을 정의한다. (빌드 결과를 메일로 보내는등) - 내부에 always, success, failure 조건을 설정가능
- environment : 사용할 환경변수를 추가
  - 젠킨스주소/env-vars.html 에서 Jenkinsfile script에서 사용가능한 환경변수 리스트 들을 확인가능
- script : groovy script 사용하여 기능 구현

## Plugin 사용

#### 1. [Display URL for Blue Ocean](https://embeddedartistry.com/blog/2017/12/28/jenkins-generating-blue-ocean-urls/) 플러그인을 설치하면 다음 환경변수를 사용할 수 있다.

- RUN_DISPLAY_URL: provides a URL to the build’s result page
- RUN_CHANGES_DISPLAY_URL: provides a URL to the build changes page
- JOB_DISPLAY_URL: provides a URL to the job page

#### 2. [Checks API plugin](https://plugins.jenkins.io/checks-api/) 플러그인은 github와 같은 SCM에 표시할 빌드상태를 전송한다.

- JenkinsFile에서 publishChecks을 통하여 publish 한다.

![object](/static/images/github-status.png 'object')

#### 3. [Slack Notification Plugin](https://www.jenkins.io/doc/pipeline/steps/slack/) 플러그인을 사용하여 Slack과 연동할 수 있다.

- JenkinsFile에서 slackSend 를 통해 slack 채널에 메시지를 보낸다.

#### 4. [Credentials Binding](https://plugins.jenkins.io/credentials-binding/) 플러그인을 사용하여 등록한 Jenkins - Credentials를 사용할 수 있다.

```
withCredentials([usernamePassword(credentialsId: 'amazon', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
  // available as an env variable, but will be masked if you try to print it out any which way
  // note: single quotes prevent Groovy interpolation; expansion is by Bourne Shell, which is what you want
  sh 'echo $PASSWORD'
  // also available as a Groovy variable
  echo USERNAME
  // or inside double quotes for string interpolation
  echo "username is $USERNAME"
}
```

## JenkinsFile 작성

```groovy
#!/usr/bin/env groovy

void setBuildStatus(String context, String message, String state, String url) {
  if (state == 'PENDING') {
    backref = "${env.RUN_DISPLAY_URL}"
  } else {
    backref = url
  }

  step([
    $class: "GitHubCommitStatusSetter",
    reposSource: [$class: "ManuallyEnteredRepositorySource", url: "${env.GIT_URL}"],
    contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/${context}"],
    errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
    statusBackrefSource: [$class: "ManuallyEnteredBackrefSource", backref: backref],
    statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);

  // To set publishChecks
  title = 'Build Check'

  if (state == 'PENDING') {
    publishChecks title: title,
      name: context,
      status: 'IN_PROGRESS',
      detailsURL: url
  } else if (state != 'SUCCESS') {
    publishChecks title: title,
      name: context,
      status: 'COMPLETED',
      conclusion: 'FAILURE',
      detailsURL: url
  } else {
    publishChecks title: title,
      name: context,
      detailsURL: url
  }
}

void notifySlack(String message, String color) {
  slackSend (channel: '#my_channel', color: color, message: message + ": Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
}

pipeline {
  agent {
    dockerfile { filename './build/Dockerfile' }
  }

  environment {
    HOME = "${env.WORKSPACE}"
    YARN_CACHE_FOLDER = "${env.HOME}/.yarn-cache"

    /**
      defined internal env
    */
    isDevelop = "${env.BRANCH_NAME ==~ /(develop)/}"
    isMainBranch = "${env.BRANCH_NAME ==~ /(master|develop|release.*)/}"
    isPRMergeBuild = "${env.BRANCH_NAME ==~ /^PR-\d+$/}"
    isSonarCoverage= "${env.isDevelop}"
    npmCommand = "yarn"
    buildUrl ="${env.BUILD_URL}"
    storybookUrl = "https://storybook-url"
    sonarQubeUrl = "http://sonar-url/dashboard?id=test"
  }

  options {
      buildDiscarder(logRotator(artifactDaysToKeepStr: '1', artifactNumToKeepStr: '10', daysToKeepStr: '3',numToKeepStr: "10"))
      timestamps()
      timeout(time: 30, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        echo "Branch: ${env.BRANCH_NAME}, PrBranch: ${env.CHANGE_BRANCH}"
        sh "which node; npm --version; node --version; yarn -version"
        sh 'which java; java -version'
        sh "printenv"
      }
    }

    stage('Install dependencies') {
      steps {
          echo 'Installing dependencies...'
          sh "yarn config set registry http://internal/content/groups/npm/"
          sh "yarn install"
      }
    }

    stage('Lint') {
      environment {
        context="lint"
      }

      steps {
        setBuildStatus(context, "${context} Progressing...", "PENDING", buildUrl);

        script {
            try {
                if (isDevelop == 'true') {
                    sh "${npmCommand} run lint -- -f json -o eslint.json"
                }
                sh "${npmCommand} run lint -- -f checkstyle -o eslint.xml"
            } catch (e) {
                sh "${npmCommand} run lint"
            }
        }
      }

      post {
        always {
          recordIssues enabledForFailure: true, aggregatingResults: true, tool: checkStyle(pattern: 'eslint.xml')
        }
        success {
          setBuildStatus("${context}", "${context} Pass", "SUCCESS", "${buildUrl}/checkstyle");
        }
        failure {
          setBuildStatus("${context}", "${context} Failed", "FAILURE", "${buildUrl}/checkstyle");
        }
      }
    }

    stage('Test') {
      parallel {
        stage('Unit Test') {
          environment {
            context="unit-test"
          }

          steps {
            setBuildStatus("${context}", "${context} Progressing...", "PENDING", "${buildUrl}");

            sh "${npmCommand} run test:unit -- -- --coverage --testResultsProcessor jest-sonar-reporter --detectOpenHandles"
          }

          post {
            always {
              script {
                if (currentBuild.currentResult != 'FAILURE') {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Success", "SUCCESS", "${buildUrl}/cobertura");
                } else {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Failed", "FAILURE", "${buildUrl}/cobertura");
                }
              }
            }
          }
        }

        stage('Storyshot') {
          environment {
            context="storybook/snapshot-test"
          }

          steps {
            setBuildStatus(context, "${context} Progressing...", "PENDING", "${buildUrl}");
            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
              script {
                try {
                  sh "${npmCommand} run test:storybook"
                } catch (e) {
                  setBuildStatus("${context}", "${context} Failed", "FAILURE", "${buildUrl}");
                  error e.message
                }
              }
            }
          }

          post {
            success {
              setBuildStatus("${context}", "${context} Pass", "SUCCESS", "${buildUrl}");
            }
          }
        }
      }

      post {
        always {
          step([$class: 'CoberturaPublisher', coberturaReportFile: 'coverage/cobertura-coverage.xml'])
        }
      }
    }

    stage('Build') {
      parallel {
        stage('App') {
          environment {
            context="build"
          }

          steps {
            setBuildStatus("${context}", "${context} Progressing...", "PENDING", "${buildUrl}");
            sh "${npmCommand} run build"
          }

          post {
            always {
              script {
                if (currentBuild.currentResult != 'FAILURE') {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Success", "SUCCESS", "${buildUrl}");
                } else {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Failed", "FAILURE", "${buildUrl}");
                }
              }
            }
          }
        }

        stage('Storybook') {
          when {
            expression { isMainBranch == 'true' }
          }

          environment {
            context="storybook/build"
          }

          steps {
            setBuildStatus("${context}", "${context} Progressing...", "PENDING", "${buildUrl}");

            script {
               withCredentials([string(credentialsId: 'ZEPLIN_TOKEN', variable: 'TOKEN')]) {
                sh "STORYBOOK_ZEPLIN_TOKEN=${TOKEN} ${npmCommand} run storybook:build"
               }
            }
          }

          post {
            always {
              script {
                if (currentBuild.currentResult != 'FAILURE') {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Success", "SUCCESS", "${buildUrl}");
                } else {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Failed", "FAILURE", "${buildUrl}");
                }
              }
            }
          }
        }
      }
    }

    stage('Deploy') {
      parallel {
        stage('Storybook image snapshot Test') {
         when {
           expression { env.BRANCH_NAME ==~ /(develop|release.*)/ }
         }

         environment {
           context="storybook/snapshot-image-test"
         }

         steps {
           setBuildStatus(context, "${context} Progressing...", "PENDING", "${buildUrl}");

           catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
             script {
               try {
                 sh "${npmCommand} run test:image-snapshot"
               } catch (e) {
                 setBuildStatus("${context}", "${context} Failed", "FAILURE", "${buildUrl}");
                 error e.message
               }
             }
           }
         }

         post {
           success {
             setBuildStatus("${context}", "${context} Pass", "SUCCESS", "${buildUrl}");
           }
         }
       }

       stage('Deploy Storybook') {
          when {
            expression { isMainBranch == 'true' }
          }

          environment {
            context="storybook/deploy"
            host = "deploy-host"
            outputDir = ".out"
            branchName = "${env.BRANCH_NAME.split("/")[0]}"
            deployTempDir = "/tmp/jenkins_tmp/${env.GIT_BRANCH}"
            deployTargetDir = "~/deploy/host/${env.branchName}"
          }

          steps {
            setBuildStatus(context, "${context} Progressing...", "PENDING", "${buildUrl}");

            script {
              def remote = [:]
              remote.name = "deploy-host"
              remote.host = "deploy-host"
              remote.allowAnyHosts = true

              withCredentials([sshUserPrivateKey(credentialsId: 'jenkins-private-key', keyFileVariable: 'identity')]) {
                  remote.user = 'user'
                  remote.identityFile = identity
                  remote.logLevel = 'INFO'

                  sshCommand remote: remote, command: "mkdir -p ${deployTempDir}"
                  sshPut remote: remote, from: "./${outputDir}", into: "${deployTempDir}"
                  sshCommand remote: remote, command: "rsync -avzh ${deployTempDir}/${outputDir}/* ${deployTargetDir}/ --delete"
                  sshRemove remote: remote, path: "${deployTempDir}", failOnError: false
              }
            }
          }

          post {
            always {
              script {
                if (currentBuild.currentResult != 'FAILURE') {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Success", "SUCCESS", "${storybookUrl}/${branchName}");
                } else {
                  setBuildStatus("${context}", "${env.STAGE_NAME} Failed", "FAILURE", "${storybookUrl}/${branchName}");
                }
              }
            }
          }
        }
      }
    }

    stage('SonarQube Quality Gate') {
      when {
        expression { isSonarCoverage == 'true' }
      }

      environment {
        context="SonarQube"
      }

      steps {
        setBuildStatus(context, "${context} Progressing...", "PENDING", "${buildUrl}");

        script{
          timeout(time: 1, unit: 'HOURS') {
            def qg = waitForQualityGate()

            if (qg.status != 'OK') {
              echo "Pipeline aborted due to quality gate failure: ${qg.status}"
              setBuildStatus("${context}", "${context} Failed", "UNSTABLE", "${sonarQubeUrl}");
            }
          }
        }
      }

      post {
        always {
          script {
            if (currentBuild.currentResult != 'FAILURE') {
              setBuildStatus("${context}", "${env.STAGE_NAME} Success", "SUCCESS", "${sonarQubeUrl}");
            } else {
              setBuildStatus("${context}", "${env.STAGE_NAME} Failed", "FAILURE", "${sonarQubeUrl}");
            }
          }
        }
      }
    }
  }

  post {
    cleanup {
      cleanWs(
        deleteDirs: true,
        patterns: [
          [pattern: 'dist', type: 'INCLUDE'],
          [pattern: '.out', type: 'INCLUDE'],
        ]
      )
    }
    success {
      script {
        def previousResult = currentBuild.previousBuild?.result

        if (!previousResult || (previousResult && previousResult != currentBuild.result)) {
          notifySlack ('SUCCESS', '#00FF00')
        }
      }
    }
    unstable {
      notifySlack ('UNSTABLE', '#FFFF00')
    }
    failure {
      notifySlack ('FAILED', '#FF0000')
    }
  }
}
```

---

### 참조

- [Jenkins Build a Node.js and React app with npm](https://www.jenkins.io/doc/tutorials/build-a-node-js-and-react-app-with-npm)

- [JenkinsFile Scripted 문법 소개](https://jojoldu.tistory.com/356)

- [Jenkinsfile - Jenkins Pipeline Tutorial](https://www.youtube.com/watch?v=MY1w7sWW5ms&t=54s)

- [Using a Jenkinsfile](https://www.jenkins.io/doc/book/pipeline/jenkinsfile)

- [Jenkins CI 구축](https://wickso.me/jenkins/continuous-integration)
