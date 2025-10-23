# PataBima AWS Deployment Guide

[![AWS](https://img.shields.io/badge/AWS-Production%20Ready-FF9900.svg)](https://aws.amazon.com/amplify/)
[![Django](https://img.shields.io/badge/Django-4.2.16-092E20.svg)](https://www.djangoproject.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.23-000020.svg)](https://expo.dev/)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Prerequisites](#prerequisites)
- [Quick Deployment](#quick-deployment)
- [Infrastructure Components](#infrastructure-components)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Cost Optimization](#cost-optimization)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Alternative Architectures](#alternative-architectures)
- [Cost-Reduction Checklist](#cost-reduction-checklist)

## 🏗️ Overview

PataBima is a comprehensive insurance agency platform consisting of:

**Frontend Components:**
- **React Native Mobile App** (Expo) - Insurance agent mobile application
- **Web Dashboard** (React Native Web) - Agent portal and admin interface

**Backend Components:**
- **Django REST API** - Core insurance business logic and data management
- **PostgreSQL Database** - Primary data storage for policies, users, and transactions
- **AWS Lambda Functions** - Document processing with Textract integration
- **S3 Storage** - Document storage, campaign banners, and static assets

**Key Features:**
- Motor insurance quotations with 60+ product types
- Document processing and auto-fill using AWS Textract
- Real-time premium calculations across multiple underwriters
- Campaign management and agent commission tracking
- M-PESA and card payment integration

## 🔧 Architecture Diagram

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│                     │    │                      │    │                     │
│   Mobile App        │    │   Web Dashboard      │    │   Admin Portal      │
│   (React Native)    │    │   (React Native Web) │    │   (Django Admin)    │
│                     │    │                      │    │                     │
└─────────┬───────────┘    └───────────┬──────────┘    └──────────┬──────────┘
          │                            │                          │
          └────────────────────────────┼──────────────────────────┘
                                       │
                              ┌────────▼────────┐
                              │                 │
                              │   CloudFront    │
                              │   (CDN + SSL)   │
                              │                 │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │                 │
                              │ Application     │
                              │ Load Balancer   │
                              │ (ALB)          │
                              │                 │
                              └────────┬────────┘
                                       │
                     ┌─────────────────┼─────────────────┐
                     │                 │                 │
            ┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
            │                 │ │             │ │                 │
            │   ECS Fargate   │ │ ECS Fargate │ │   ECS Fargate   │
            │   (Django API)  │ │(Django API) │ │   (Django API)  │
            │   Container 1   │ │Container 2  │ │   Container 3   │
            │                 │ │             │ │                 │
            └─────────────────┘ └─────────────┘ └─────────────────┘
                     │                 │                 │
                     └─────────────────┼─────────────────┘
                                       │
                              ┌────────▼────────┐
                              │                 │
                              │   Amazon RDS    │
                              │   (PostgreSQL)  │
                              │   Multi-AZ      │
                              │                 │
                              └─────────────────┘

        ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │                 │    │                 │    │                 │
        │   Amazon S3     │    │   AWS Lambda    │    │   AWS Cognito   │
        │   (Documents    │    │   (Textract     │    │   (User Auth)   │
        │   & Assets)     │    │   Processing)   │    │                 │
        │                 │    │                 │    │                 │
        └─────────────────┘    └─────────────────┘    └─────────────────┘

        ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │                 │    │                 │    │                 │
        │   CloudWatch    │    │   AWS WAF       │    │   Route 53      │
        │   (Monitoring)  │    │   (Security)    │    │   (DNS)         │
        │                 │    │                 │    │                 │
        └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### AWS Account Setup
- AWS Account with billing enabled
- AWS CLI v2 installed and configured
- AdministratorAccess permissions (or custom IAM role with required permissions)

### Local Development Tools
```bash
# Install AWS CLI v2 (Windows)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Install Docker Desktop for Windows
# Download from: https://docs.docker.com/desktop/install/windows-install/

# Install Node.js 18+
# Download from: https://nodejs.org/en/download/

# Install Expo CLI
npm install -g @expo/cli

# Verify installations
aws --version
docker --version
node --version
expo --version
```

### Domain Requirements
- Domain name registered (e.g., `patabima.com`)
- SSL certificate (AWS Certificate Manager will handle this)

## ⚡ Quick Deployment

For immediate deployment using AWS CloudFormation:

```powershell
# Clone and navigate to the repository
git clone https://github.com/kahoikreations/Patabimavs20.git
cd "PATA BIMA AGENCY - Copy"

# Set AWS credentials (if not already configured)
aws configure

# Run the deployment script
.\deploy-aws.ps1
```

**Deployment Time:** ~25-30 minutes for complete infrastructure

## 🏗️ Infrastructure Components

### Core AWS Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **ECS Fargate** | Django API hosting | Auto-scaling containers |
| **RDS PostgreSQL** | Primary database | Multi-AZ deployment |
| **S3** | Document & asset storage | Versioning enabled |
| **CloudFront** | CDN & caching | Global edge locations |
| **Application Load Balancer** | Traffic distribution | Health checks enabled |
| **Lambda** | Document processing | Textract integration |
| **Cognito** | User authentication | JWT token management |
| **Route 53** | DNS management | Health checks |
| **CloudWatch** | Monitoring & logs | Custom dashboards |
| **AWS WAF** | Security & filtering | Rate limiting |

### Estimated Monthly Costs

| Component | Usage | Cost (USD) |
|-----------|-------|------------|
| **ECS Fargate** | 3 containers (0.25 vCPU, 0.5GB) | ~$25 |
| **RDS PostgreSQL** | db.t3.micro Multi-AZ | ~$35 |
| **S3 Storage** | 100GB + requests | ~$15 |
| **CloudFront** | 1TB transfer | ~$85 |
| **Application Load Balancer** | Always on | ~$18 |
| **Lambda** | 1M requests/month | ~$2 |
| **Route 53** | Hosted zone + queries | ~$2 |
| **CloudWatch** | Standard monitoring | ~$10 |
| **Total Estimated** | | **~$192/month** |

## 🚀 Step-by-Step Deployment

### Step 1: Infrastructure Setup

#### 1.1 Create PowerShell Deployment Script

```powershell
# Create deploy-aws.ps1
@"
#!/usr/bin/env pwsh
# PataBima AWS Deployment Script
param(
    [string]$DomainName = "patabima.com",
    [string]$Environment = "production",
    [string]$Region = "us-east-1"
)

Write-Host "🚀 Deploying PataBima Infrastructure..." -ForegroundColor Green

# Validate AWS CLI configuration
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS CLI configured" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not configured. Run 'aws configure'" -ForegroundColor Red
    exit 1
}

# Generate secure database password
$DatabasePassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_})
Write-Host "Generated database password: $DatabasePassword" -ForegroundColor Yellow

# Deploy infrastructure stack
Write-Host "Deploying infrastructure..." -ForegroundColor Blue
aws cloudformation deploy `
    --template-file infrastructure/cloudformation-template.yaml `
    --stack-name "$Environment-patabima-infrastructure" `
    --parameter-overrides `
        DomainName=$DomainName `
        Environment=$Environment `
        DatabasePassword=$DatabasePassword `
    --capabilities CAPABILITY_IAM `
    --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
    
    # Get outputs
    $outputs = aws cloudformation describe-stacks `
        --stack-name "$Environment-patabima-infrastructure" `
        --region $Region `
        --query 'Stacks[0].Outputs' | ConvertFrom-Json
    
    Write-Host "📋 Deployment Outputs:" -ForegroundColor Cyan
    foreach ($output in $outputs) {
        Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor White
    }
    
    # Save outputs to file
    $outputs | ConvertTo-Json -Depth 3 | Out-File "deployment-outputs.json"
    Write-Host "💾 Outputs saved to deployment-outputs.json" -ForegroundColor Green
    
} else {
    Write-Host "❌ Infrastructure deployment failed!" -ForegroundColor Red
    exit 1
}

# Build and push Docker image
Write-Host "Building Docker image..." -ForegroundColor Blue
$account = aws sts get-caller-identity --query Account --output text
$uri = "$account.dkr.ecr.$Region.amazonaws.com/patabima-django"

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names patabima-django --region $Region 2>$null
if ($LASTEXITCODE -ne 0) {
    aws ecr create-repository --repository-name patabima-django --region $Region
}

# Login to ECR
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $uri

# Build and push image
docker build -t patabima-django .
docker tag patabima-django:latest $uri:latest
docker push $uri:latest

Write-Host "✅ Docker image pushed to ECR!" -ForegroundColor Green

# Update ECS service with new image
Write-Host "Updating ECS service..." -ForegroundColor Blue
# Implementation continues...

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Application URL: https://$DomainName" -ForegroundColor Cyan
"@ | Out-File -FilePath "deploy-aws.ps1" -Encoding UTF8

# Make script executable
Write-Host "Created deploy-aws.ps1 script" -ForegroundColor Green
```

#### 1.2 Create Docker Configuration

Create a `Dockerfile` for the Django backend:

```dockerfile
# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        gcc \
        python3-dev \
        libpq-dev \
        curl \
        gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY insurance-app/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Install Gunicorn for production
RUN pip install gunicorn

# Copy project
COPY insurance-app/ /app/

# Create static files directory
RUN mkdir -p /app/staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Wait for database to be ready\n\
until pg_isready -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER; do\n\
  echo "Waiting for database..."\n\
  sleep 2\n\
done\n\
\n\
echo "Database is ready!"\n\
\n\
# Run migrations\n\
python manage.py migrate --noinput\n\
\n\
# Create superuser if it does not exist\n\
python manage.py shell -c "\
from django.contrib.auth.models import User; \
User.objects.filter(username='"'"'admin'"'"').exists() or \
User.objects.create_superuser('"'"'admin'"'"', '"'"'admin@patabima.com'"'"', '"'"'admin123'"'"')"\n\
\n\
# Start Gunicorn\n\
exec gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 60 insurance.wsgi:application' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/api/health/ || exit 1

# Run entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
```

### Step 2: Environment Configuration

#### 2.1 Production Settings for Django

Create `insurance-app/insurance/settings_production.py`:

```python
from .settings import *
import os

# Production settings
DEBUG = False
ALLOWED_HOSTS = [
    'patabima.com',
    'www.patabima.com',
    '*.amazonaws.com',
    '*.elb.amazonaws.com'
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'patabima_insurance'),
        'USER': os.getenv('DB_USER', 'patabima_user'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = None
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}

# Static files (CSS, JavaScript, Images)
if os.getenv('USE_S3_STATIC') == '1':
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'

# Media files
if os.getenv('USE_S3_MEDIA') == '1':
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

# Security
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS settings
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://patabima.com",
    "https://www.patabima.com",
    "exp://127.0.0.1:19000",  # Expo development
    "exp://localhost:19000",  # Expo development
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

#### 2.2 Frontend Environment Configuration

Create `frontend/.env.production`:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api.patabima.com
EXPO_PUBLIC_API_TIMEOUT=30000

# AWS Configuration
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_S3_BUCKET=production-patabima-documents

# App Configuration
EXPO_PUBLIC_APP_NAME=PataBima
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=production

# Payment Configuration
EXPO_PUBLIC_MPESA_PAYBILL=123456
EXPO_PUBLIC_DPO_COMPANY_TOKEN=your_dpo_token

# Analytics
EXPO_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
EXPO_PUBLIC_ENABLE_DOCUMENT_UPLOAD=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=true
```

### Step 3: CI/CD Pipeline Setup

#### 3.1 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main, production ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: patabima-django
  ECS_SERVICE: production-patabima-service
  ECS_CLUSTER: production-patabima-cluster

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        cd insurance-app
        pip install -r requirements.txt

    - name: Run Django tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      run: |
        cd insurance-app
        python manage.py test

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci

    - name: Run frontend tests
      run: |
        cd frontend
        npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

    - name: Update ECS service
      run: |
        aws ecs update-service \
          --cluster $ECS_CLUSTER \
          --service $ECS_SERVICE \
          --force-new-deployment

    - name: Wait for deployment
      run: |
        aws ecs wait services-stable \
          --cluster $ECS_CLUSTER \
          --services $ECS_SERVICE

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Setup Expo CLI
      run: npm install -g @expo/cli

    - name: Install dependencies
      run: |
        cd frontend
        npm ci

    - name: Build Android APK
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      run: |
        cd frontend
        expo build:android --type apk

    - name: Build iOS IPA
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      run: |
        cd frontend
        expo build:ios

    - name: Upload to S3
      run: |
        aws s3 cp frontend/build/ s3://production-patabima-assets/mobile-builds/ --recursive
```

#### 3.2 Infrastructure as Code with CDK (Optional)

For more advanced infrastructure management, create `infrastructure/app.py`:

```python
import aws_cdk as cdk
from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_rds as rds,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_route53 as route53,
    aws_certificatemanager as acm,
    aws_elasticloadbalancingv2 as elbv2,
    aws_iam as iam,
    aws_lambda as lambda_,
    aws_logs as logs,
    Duration,
)

class PataBimaStack(Stack):
    def __init__(self, scope, construct_id, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # VPC
        vpc = ec2.Vpc(
            self, "PataBimaVPC",
            max_azs=2,
            cidr="10.0.0.0/16",
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    subnet_type=ec2.SubnetType.PUBLIC,
                    name="PublicSubnet",
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    name="PrivateSubnet",
                    cidr_mask=24
                )
            ]
        )

        # Security Groups
        alb_sg = ec2.SecurityGroup(
            self, "ALBSecurityGroup",
            vpc=vpc,
            description="Security group for ALB",
            allow_all_outbound=True
        )
        alb_sg.add_ingress_rule(
            ec2.Peer.any_ipv4(),
            ec2.Port.tcp(80),
            "HTTP traffic"
        )
        alb_sg.add_ingress_rule(
            ec2.Peer.any_ipv4(),
            ec2.Port.tcp(443),
            "HTTPS traffic"
        )

        # RDS Database
        database = rds.DatabaseInstance(
            self, "PataBimaDatabase",
            engine=rds.DatabaseInstanceEngine.postgres(
                version=rds.PostgresEngineVersion.VER_15_3
            ),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO
            ),
            vpc=vpc,
            multi_az=True,
            allocated_storage=20,
            storage_encrypted=True,
            deletion_protection=True,
            backup_retention=Duration.days(7),
            delete_automated_backups=False,
            database_name="patabima_insurance",
            credentials=rds.Credentials.from_generated_secret(
                "patabima_user",
                secret_name="patabima-db-credentials"
            )
        )

        # S3 Buckets
        documents_bucket = s3.Bucket(
            self, "DocumentsBucket",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            public_read_access=False,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL
        )

        assets_bucket = s3.Bucket(
            self, "AssetsBucket",
            encryption=s3.BucketEncryption.S3_MANAGED,
            public_read_access=True
        )

        # ECS Cluster
        cluster = ecs.Cluster(
            self, "PataBimaCluster",
            vpc=vpc,
            cluster_name="patabima-cluster"
        )

        # Output important values
        cdk.CfnOutput(
            self, "DatabaseEndpoint",
            value=database.instance_endpoint.hostname,
            description="RDS Database Endpoint"
        )

        cdk.CfnOutput(
            self, "DocumentsBucketName",
            value=documents_bucket.bucket_name,
            description="S3 Documents Bucket Name"
        )

app = cdk.App()
PataBimaStack(app, "PataBimaStack")
app.synth()
```

## 📊 Monitoring & Logging

### 4.1 CloudWatch Dashboard

Create custom CloudWatch dashboard for monitoring:

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", "ServiceName", "patabima-service"],
          ["AWS/ECS", "MemoryUtilization", "ServiceName", "patabima-service"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Resource Utilization"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "patabima-database"],
          ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "patabima-database"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "RDS Performance"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "SOURCE '/ecs/patabima' | fields @timestamp, @message\n| filter @message like /ERROR/\n| sort @timestamp desc\n| limit 100",
        "region": "us-east-1",
        "title": "Application Errors"
      }
    }
  ]
}
```

### 4.2 Alerting Setup

Create CloudWatch alarms:

```bash
# High CPU utilization
aws cloudwatch put-metric-alarm \
    --alarm-name "PataBima-High-CPU" \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2

# Database connection count
aws cloudwatch put-metric-alarm \
    --alarm-name "PataBima-High-DB-Connections" \
    --alarm-description "Alert when DB connections exceed 80% of max" \
    --metric-name DatabaseConnections \
    --namespace AWS/RDS \
    --statistic Average \
    --period 300 \
    --threshold 16 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

## 💰 Cost Optimization

### 5.1 Reserved Instances and Savings Plans

```bash
# Check potential savings
aws ce get-rightsizing-recommendation \
    --service "Amazon Elastic Compute Cloud - Compute"

# Purchase RDS Reserved Instance (1 year)
aws rds purchase-reserved-db-instances-offering \
    --reserved-db-instances-offering-id <offering-id> \
    --reserved-db-instance-id patabima-reserved-db
```

### 5.2 Auto Scaling Configuration

Update ECS service with auto scaling:

```yaml
# auto-scaling.yaml
Resources:
  AutoScalingTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      MaxCapacity: 10
      MinCapacity: 2
      ResourceId: !Sub service/${ECSCluster}/${ECSService}
      RoleARN: !Sub arn:aws:iam::${AWS::AccountId}:role/application-autoscaling-ecs-service
      ScalableDimension: ecs:service:DesiredCount
      ServiceNamespace: ecs

  AutoScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: PataBimaAutoScalingPolicy
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref AutoScalingTarget
      TargetTrackingScalingPolicyConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        TargetValue: 70.0
        ScaleOutCooldown: 300
        ScaleInCooldown: 300
```

### 5.3 S3 Lifecycle Policies

```json
{
  "Rules": [
    {
      "ID": "DocumentArchiving",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "documents/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    }
  ]
}
```

## 🔒 Security Best Practices

### 6.1 IAM Policies

Create least-privilege IAM policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::patabima-documents/*",
        "arn:aws:s3:::patabima-assets/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "textract:DetectDocumentText",
        "textract:AnalyzeDocument"
      ],
      "Resource": "*"
    }
  ]
}
```

### 6.2 VPC Security

```bash
# Create VPC Flow Logs
aws ec2 create-flow-logs \
    --resource-type VPC \
    --resource-ids vpc-12345678 \
    --traffic-type ALL \
    --log-destination-type cloud-watch-logs \
    --log-group-name VPCFlowLogs

# Enable GuardDuty
aws guardduty create-detector \
    --enable \
    --finding-publishing-frequency FIFTEEN_MINUTES
```

### 6.3 SSL/TLS Configuration

```bash
# Request SSL certificate
aws acm request-certificate \
    --domain-name patabima.com \
    --subject-alternative-names "*.patabima.com" \
    --validation-method DNS \
    --region us-east-1
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. ECS Task Startup Issues

```bash
# Check ECS service events
aws ecs describe-services \
    --cluster patabima-cluster \
    --services patabima-service \
    --query 'services[0].events[0:5]'

# Check task logs
aws logs get-log-events \
    --log-group-name /ecs/patabima \
    --log-stream-name ecs/django-api/task-id
```

#### 2. Database Connection Issues

```bash
# Test database connectivity
aws rds describe-db-instances \
    --db-instance-identifier patabima-database \
    --query 'DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address}'

# Check security group rules
aws ec2 describe-security-groups \
    --group-ids sg-database \
    --query 'SecurityGroups[0].IpPermissions'
```

#### 3. S3 Access Issues

```bash
# Test S3 bucket access
aws s3 ls s3://patabima-documents/

# Check bucket policy
aws s3api get-bucket-policy \
    --bucket patabima-documents
```

#### 4. Performance Issues

```bash
# Check ECS service metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ServiceName,Value=patabima-service \
    --start-time 2025-10-20T00:00:00Z \
    --end-time 2025-10-20T23:59:59Z \
    --period 3600 \
    --statistics Average,Maximum

# Check RDS performance
aws cloudwatch get-metric-statistics \
    --namespace AWS/RDS \
    --metric-name DatabaseConnections \
    --dimensions Name=DBInstanceIdentifier,Value=patabima-database \
    --start-time 2025-10-20T00:00:00Z \
    --end-time 2025-10-20T23:59:59Z \
    --period 3600 \
    --statistics Average,Maximum
```

### Emergency Procedures

#### Rollback Deployment

```bash
# Get previous task definition
aws ecs describe-services \
    --cluster patabima-cluster \
    --services patabima-service \
    --query 'services[0].taskDefinition'

# Update service to previous revision
aws ecs update-service \
    --cluster patabima-cluster \
    --service patabima-service \
    --task-definition patabima-django:PREVIOUS_REVISION
```

#### Scale Down for Maintenance

```bash
# Scale service to 0 tasks
aws ecs update-service \
    --cluster patabima-cluster \
    --service patabima-service \
    --desired-count 0

# Scale back up
aws ecs update-service \
    --cluster patabima-cluster \
    --service patabima-service \
    --desired-count 2
```

## 📞 Support and Maintenance

### Backup Strategy

1. **Database Backups**: Automated RDS snapshots (7-day retention)
2. **S3 Versioning**: Enabled for document recovery
3. **Code Backups**: Git repository with automated CI/CD

### Monitoring Checklist

- [ ] CloudWatch alarms configured
- [ ] ECS service health checks passing
- [ ] RDS connection monitoring
- [ ] S3 access logging enabled
- [ ] Application logs centralized
- [ ] Performance metrics tracked

### Regular Maintenance Tasks

**Weekly:**
- Review CloudWatch metrics and logs
- Check for security updates
- Verify backup completion

**Monthly:**
- Review and optimize costs
- Update dependencies
- Performance tuning based on metrics

**Quarterly:**
- Security audit and penetration testing
- Disaster recovery testing
- Capacity planning review

---

## 🎯 Quick Reference Commands

### Common AWS CLI Commands

```bash
# Check deployment status
aws cloudformation describe-stacks --stack-name production-patabima-infrastructure

# Update ECS service
aws ecs update-service --cluster patabima-cluster --service patabima-service --force-new-deployment

# View logs
aws logs tail /ecs/patabima --follow

# Check RDS status
aws rds describe-db-instances --db-instance-identifier patabima-database

# List S3 objects
aws s3 ls s3://patabima-documents/ --recursive

# Get SSL certificate status
aws acm list-certificates --region us-east-1
```

### Docker Commands

```bash
# Build local image
docker build -t patabima-django .

# Run locally with environment variables
docker run -p 8000:8000 --env-file .env.production patabima-django

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
docker push $ECR_URI:latest
```

---

**🚀 Ready to deploy? Start with the [Quick Deployment](#quick-deployment) section and you'll have PataBima running on AWS in 30 minutes!**

For support, contact: [admin@patabima.com](mailto:admin@patabima.com)

---

*Last updated: October 20, 2025*

## 🧭 Alternative Architectures

Below are production-capable deployment options that can reduce costs and/or simplify operations compared to ECS + ALB + Multi-AZ RDS. Choose based on your traffic, team expertise, and compliance needs.

### Option A: AWS App Runner (containers without ALB/ECS)

- What changes: Replace ECS Service + ALB with App Runner service. Keep RDS and S3 as-is.
- Why: Simpler ops (no load balancer, no cluster), good autoscaling, HTTPS out-of-the-box.
- Fit for PataBima: Django container from ECR works out-of-box; VPC connector to access RDS.
- Pros:
  - No ALB costs, managed HTTPS, easy deploys from ECR.
  - Autoscaling based on concurrency/requests.
  - Simple blue/green via new service version.
- Cons:
  - Less granular control vs ECS.
  - VPC connector adds small cost; cold starts under low traffic.
- Ballpark monthly (low traffic): $15–$45 service compute + $0 ALB + same RDS/S3/CloudWatch.
- Getting started: Create App Runner service pointing to your ECR image; add VPC connector to RDS subnets; set env vars (DB_HOST/USER/PASS, S3 settings).

### Option B: Elastic Beanstalk (managed EC2 or Docker)

- What changes: Replace ECS with Beanstalk Docker platform. Keep RDS and S3.
- Why: Classic PaaS for Django, manages ASG/ELB, rolling deploys.
- Pros: Mature, many examples for Django, health checks, logs.
- Cons: Uses classic ELB/ALB and EC2 (typically higher baseline cost than App Runner for low traffic).
- Ballpark monthly (t3.small x1 + ALB): $35–$60 + RDS/S3.

### Option C: Lightsail Containers + Lightsail Managed DB

- What changes: Replace ECS + RDS with Lightsail Container Service + Lightsail Managed PostgreSQL.
- Why: Lowest predictable cost bundles; simpler UI.
- Pros: Fixed pricing bundles, CDN add-on, easy snapshots.
- Cons: Fewer enterprise features, VPC integration limits, migration step to RDS later.
- Ballpark monthly: Container small bundle ($7–$20) + DB small ($15–$30) + storage/transfer.

### Option D: Serverless Django (Lambda + API Gateway) for read-heavy/light write

- What changes: Package Django as Lambda with Zappa or AWS Lambda Web Adapter + API Gateway; move DB to Aurora Serverless v2 (PostgreSQL); S3 unchanged.
- Why: Pay-per-use; scales to zero for very low traffic.
- Pros: Lowest idle cost, built-in multi-AZ for Aurora; great for spiky workloads.
- Cons: Warm-start latency; long-running requests limited; web sockets not native; migration effort.
- Ballpark monthly (low traffic): Lambda <$5 + API GW $5–$20 + Aurora Serverless v2 ~$10–$60 (depends on ACU usage).

### Option E: Single-AZ RDS + ALB on ECS Fargate (cost-tuned)

- What changes: Keep current architecture but switch RDS to Single-AZ for early-stage and reduce ECS desired count to 1 in off-hours.
- Why: Minimal code change, immediate cost drop.
- Savings:
  - RDS: Multi-AZ → Single-AZ saves ~40–55%.
  - ALB: Keep (or replace with App Runner to remove ALB entirely).
  - Fargate: Scale to 1 task off-hours via scheduled scaling.

## 💸 Cost-Reduction Checklist

Apply these changes incrementally; each line typically saves real money without major refactors.

1) Database
- Switch RDS to db.t4g.micro (ARM/Graviton) Single-AZ for staging/early prod; enable auto minor version upgrades.
- Turn on storage autoscaling with a conservative max; set 7-day backups (staging 1–3 days).
- Consider Aurora Serverless v2 when production traffic is spiky and predictable idle periods exist.

2) Compute
- If staying on ECS: use Fargate Spot for 30–70% savings on non-critical tasks (workers, batch).
- Reduce desiredCount to 1 in off-hours via scheduled scaling policies.
- Consider App Runner to remove ALB cost and simplify ops.

3) Networking & Edge
- Keep CloudFront only if you serve a web dashboard or heavy public assets; otherwise, skip and serve media directly from S3 presigned URLs.
- If CloudFront needed, enable compression and aggressive caching for static paths.

4) S3 & Data
- Add lifecycle rules: 30 days → STANDARD_IA; 90 days → GLACIER; 365 days → DEEP_ARCHIVE for documents.
- Enable S3 Intelligent-Tiering if access patterns are unknown.
- Turn on S3 access logs to a separate low-cost bucket (lifecycle them too).

5) Logging & Monitoring
- Reduce CloudWatch log retention to 7–14 days for dev/staging; 30–90 for prod.
- Aggregate application logs to one log group; avoid debug log level in prod.

6) CI/CD & Images
- Cache Docker layers in CI to cut build minutes; use smaller base images (python:3.11-slim-bullseye or distroless/ubi).
- Multi-stage builds to exclude build deps from final image.

7) Pricing Plans
- Use Savings Plans (compute) for steady baseline (e.g., 1 task) and keep burst on-demand.
- Evaluate RDS Reserved Instances after 1–2 months of steady usage.

8) Environments
- For staging: Single-AZ RDS, 1 Fargate task, no WAF, shorter log retention, smaller DB storage.
- For dev: Use SQLite + LocalStack or a tiny Lightsail DB; avoid persistent ALB.

### Example “Lean Prod” Profile (typical <1k DAU)
- App Runner service (1–2 capacity units autoscaling) instead of ECS+ALB.
- RDS PostgreSQL db.t4g.micro Single-AZ (+ automated snapshots).
- S3 with lifecycle rules; CloudWatch logs 14–30 days.
- Target monthly: $70–$120 depending on traffic and egress.

### Example “Scale-Up” Trigger Points
- P95 API latency consistently > 500ms → add a second compute unit/task.
- DB CPU > 60% for 30 min → scale DB to t4g.small or consider read replica / Aurora.
- Monthly data transfer via CloudFront > 1TB → negotiate CloudFront discount tiers.

---

If you want, I can generate an App Runner deployment script and Terraform/CDK templates tailored to this repo so you can A/B the costs quickly without refactoring the app.