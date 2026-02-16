# AWS Elastic Beanstalk Deployment Guide

This guide covers deploying the full-stack authentication app to AWS Elastic Beanstalk using Docker.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- EB CLI installed
- MongoDB Atlas account (for database)

## Architecture

```
AWS Elastic Beanstalk (Docker)
├── Application Load Balancer
├── EC2 Instance(s) running Docker container
│   ├── NestJS Backend (port 3000)
│   └── React Frontend (served from /public)
└── MongoDB Atlas (external)
```

## Step 1: Install AWS CLI & EB CLI

### Install AWS CLI

**macOS:**
```bash
brew install awscli
```

**Linux/Windows:**
Follow instructions at: https://aws.amazon.com/cli/

### Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format: `json`

### Install EB CLI

```bash
pip install awsebcli --upgrade --user
```

Verify:
```bash
eb --version
```

## Step 2: Set Up MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user
4. Add IP whitelist: `0.0.0.0/0` (allow all AWS IPs)
5. Get connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/auth-app
   ```

## Step 3: Initialize Elastic Beanstalk

From your project root:

```bash
eb init
```

Follow prompts:
- **Region**: Choose closest to you (e.g., `us-east-1`)
- **Application name**: `fullstack-auth-demo`
- **Platform**: Docker
- **Platform branch**: Docker running on 64bit Amazon Linux 2
- **CodeCommit**: No
- **SSH**: Yes (recommended for debugging)

This creates `.elasticbeanstalk/config.yml`.

## Step 4: Create Environment

```bash
eb create fullstack-auth-prod
```

Options:
- **Environment name**: `fullstack-auth-prod`
- **DNS CNAME**: Auto-generated or custom
- **Load balancer**: Application (recommended)

This will:
1. Create S3 bucket for app versions
2. Create EC2 instance(s)
3. Set up Application Load Balancer
4. Deploy your Docker container

**Wait 5-10 minutes** for environment creation.

## Step 5: Set Environment Variables

```bash
eb setenv \
  MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/auth-app" \
  JWT_SECRET="your-super-secret-jwt-key-min-32-chars" \
  JWT_EXPIRES_IN="7d" \
  PORT="3000" \
  BCRYPT_SALT_ROUNDS="10" \
  NODE_ENV="production" \
  ENABLE_SWAGGER="true"
```

Get your environment URL:
```bash
eb status
```

Copy the CNAME (e.g., `fullstack-auth-prod.us-east-1.elasticbeanstalk.com`), then set:

```bash
eb setenv \
  FRONTEND_URL="https://fullstack-auth-prod.us-east-1.elasticbeanstalk.com" \
  VITE_API_BASE_URL="https://fullstack-auth-prod.us-east-1.elasticbeanstalk.com"
```

## Step 6: Deploy

```bash
eb deploy
```

This will:
1. Build Docker image locally
2. Upload to S3
3. Deploy to EC2 instances
4. Run health checks

**Deployment takes ~5 minutes.**

## Step 7: Verify Deployment

### Open the app:
```bash
eb open
```

### Check logs:
```bash
eb logs
```

### Test endpoints:
- Frontend: `https://<your-env>.elasticbeanstalk.com/`
- API Docs: `https://<your-env>.elasticbeanstalk.com/api/docs`
- Health: `https://<your-env>.elasticbeanstalk.com/api/docs`

## Step 8: Enable HTTPS (Optional but Recommended)

### Option 1: AWS Certificate Manager (Free)

1. **Request Certificate**:
   - Go to AWS Certificate Manager
   - Request public certificate
   - Enter your domain (e.g., `app.yourdomain.com`)
   - Validate via DNS or Email

2. **Add to Load Balancer**:
   ```bash
   eb console
   ```
   - Go to Configuration → Load Balancer
   - Add listener: HTTPS (443)
   - Select your ACM certificate
   - Save

3. **Update environment variables**:
   ```bash
   eb setenv \
     FRONTEND_URL="https://app.yourdomain.com" \
     VITE_API_BASE_URL="https://app.yourdomain.com"
   ```

### Option 2: Use Default AWS URL

AWS provides HTTPS by default at:
```
https://<env-name>.<region>.elasticbeanstalk.com
```

## Ongoing Management

### View environment status:
```bash
eb status
```

### View logs:
```bash
eb logs
eb logs --stream  # real-time
```

### SSH into instance:
```bash
eb ssh
```

### Scale up/down:
```bash
eb scale 2  # run 2 instances
```

### Update environment:
```bash
# After code changes
git add .
git commit -m "Update"
eb deploy
```

### Terminate environment (to save costs):
```bash
eb terminate fullstack-auth-prod
```

## Cost Estimation

**Free Tier (first 12 months):**
- 750 hours/month of t2.micro or t3.micro EC2
- 750 hours/month of Elastic Load Balancer
- 5GB S3 storage

**After Free Tier (~$15-30/month):**
- EC2 t3.micro: ~$7.50/month
- Application Load Balancer: ~$16/month
- S3 & Data Transfer: ~$1-5/month
- MongoDB Atlas M0: Free forever

**To minimize costs:**
- Use single instance (no auto-scaling)
- Terminate when not in use
- Use MongoDB Atlas free tier

## Troubleshooting

### Container fails to start:
```bash
eb logs
# Look for Docker build errors
```

### Environment variables not set:
```bash
eb printenv
# Verify all vars are present
```

### 502 Bad Gateway:
- Check backend is running on port 3000
- Verify nginx proxy config in `.platform/nginx/conf.d/proxy.conf`

### MongoDB connection fails:
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check `MONGODB_URI` is correct

### Build fails:
- Ensure Dockerfile is in project root
- Check `.ebignore` isn't excluding necessary files

## Alternative: AWS App Runner (Simpler)

If you want even simpler deployment:

```bash
# Install App Runner CLI
aws apprunner create-service \
  --service-name fullstack-auth \
  --source-configuration '{
    "CodeRepository": {
      "RepositoryUrl": "https://github.com/DarkC0der-0/Full-Stack-Auth-Demo",
      "SourceCodeVersion": {"Type": "BRANCH", "Value": "main"},
      "CodeConfiguration": {
        "ConfigurationSource": "API",
        "CodeConfigurationValues": {
          "Runtime": "NODEJS_20",
          "BuildCommand": "npm install && npm run build && cd backend && npm install && npm run build",
          "StartCommand": "cd backend && node dist/main.js",
          "Port": "3000"
        }
      }
    }
  }'
```

App Runner is serverless and auto-scales, but costs more (~$25/month minimum).

## Resources

- [AWS Elastic Beanstalk Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- [EB CLI Reference](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [Docker Platform](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker.html)
