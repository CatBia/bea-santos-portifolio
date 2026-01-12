# Manicure Booking App AWS Architecture

This document outlines the desired AWS architecture for the Manicure Booking App, designed to support a scalable, cost-effective static website with global content delivery.

## Architecture Overview

The Manicure Booking App architecture leverages AWS S3 static hosting and CloudFront CDN to create a highly available, globally distributed booking application with minimal infrastructure overhead.

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Users / Clients                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  CloudFront CDN  │  AWS WAF             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Application Load Balancer          │
│           (Optional)                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  S3 Static Website Hosting              │
│  ┌──────────┐ ┌──────────┐             │
│  │Bucket 1  │ │Bucket 2   │             │
│  └──────────┘ └──────────┘             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  WhatsApp API (External)                │
└─────────────────────────────────────────┘
```

## AWS Services Breakdown

### Hosting Services

#### S3 (Simple Storage Service)
- **Purpose**: Static website hosting
- **Configuration**:
  - Static website hosting enabled
  - Index document: index.html
  - Error document: error.html
  - Public read access
  - Versioning enabled
- **Benefits**:
  - Extremely cost-effective
  - High durability (99.999999999%)
  - Automatic scaling
  - No server management

#### CloudFront CDN
- **Purpose**: Global content delivery network
- **Configuration**:
  - Origin: S3 bucket
  - Edge locations worldwide
  - Caching policies for static assets
  - Custom error pages
  - HTTPS enforcement
- **Benefits**:
  - Reduced latency globally
  - Lower bandwidth costs
  - DDoS protection
  - SSL/TLS termination

### Networking Services

#### Route 53
- **Purpose**: DNS management
- **Features**:
  - Domain name resolution
  - Health checks
  - Failover routing
  - Geographic routing

#### AWS WAF
- **Purpose**: Web application firewall
- **Protection**:
  - SQL injection
  - XSS attacks
  - Rate limiting
  - Geographic restrictions
  - IP allow/deny lists

#### Application Load Balancer (Optional)
- **Purpose**: Load balancing if using containerized deployment
- **Features**:
  - HTTP/HTTPS routing
  - Health checks
  - SSL/TLS termination

### Compute Services (Optional)

#### ECS Fargate (Optional)
- **Purpose**: Container hosting if Nginx containers are needed
- **Configuration**:
  - Nginx containers
  - Auto-scaling: 1 to 5 instances
  - Health checks enabled
- **Use Case**: Only if dynamic features are added

#### Lambda (Optional)
- **Purpose**: Serverless functions for form processing
- **Use Cases**:
  - Form submission handling
  - WhatsApp integration
  - Email notifications
  - Booking validation

#### API Gateway (Optional)
- **Purpose**: API management for Lambda functions
- **Features**:
  - Request routing
  - Rate limiting
  - API key management

### Security Services

#### AWS Certificate Manager (ACM)
- **Purpose**: SSL/TLS certificates
- **Features**:
  - Free SSL certificates
  - Automatic renewal
  - CloudFront integration

#### Secrets Manager (Optional)
- **Purpose**: Secure storage of API keys
- **Secrets**:
  - WhatsApp API keys
  - External service tokens

#### IAM
- **Purpose**: Access control
- **Roles**:
  - S3 bucket policies
  - CloudFront access
  - Lambda execution roles (if used)

### Monitoring & Logging Services

#### CloudWatch
- **Purpose**: Metrics and monitoring
- **Metrics**:
  - S3 request metrics
  - CloudFront metrics
  - Error rates
  - Cache hit rates
- **Alarms**:
  - High error rates
  - Unusual traffic patterns

#### CloudWatch Logs
- **Purpose**: Centralized logging
- **Log Types**:
  - CloudFront access logs
  - Lambda execution logs (if used)

#### CloudFront Analytics
- **Purpose**: Usage analytics
- **Metrics**:
  - Request counts
  - Data transfer
  - Cache statistics
  - Geographic distribution

## Architecture Benefits

### Cost Efficiency
- S3 static hosting: ~$0.023 per GB stored
- CloudFront: Pay only for data transfer
- No server maintenance costs
- Extremely low operational costs

### Global Performance
- CloudFront edge locations worldwide
- Reduced latency for all users
- Automatic content caching
- Optimized delivery

### Scalability
- Automatic scaling with S3
- CloudFront handles traffic spikes
- No capacity planning needed
- Unlimited storage

### High Availability
- S3: 99.99% availability
- CloudFront: 99.99% uptime
- Multi-region redundancy
- Automatic failover

### Security
- WAF protection against attacks
- CloudFront DDoS protection
- SSL/TLS encryption
- IAM for access control

### Simplicity
- No server management
- Easy deployment (S3 upload)
- Minimal configuration
- Low maintenance

## Cost Estimates (Monthly)

### Small Scale (Low Traffic)
- S3 Storage: $0.50-2
- S3 Requests: $0.50-2
- CloudFront: $5-15
- Route 53: $0.50
- WAF: $1-5
- **Total**: ~$7.50-24.50/month

### Medium Scale (Moderate Traffic)
- S3 Storage: $2-10
- S3 Requests: $2-10
- CloudFront: $20-60
- Route 53: $0.50
- WAF: $5-15
- **Total**: ~$29.50-95.50/month

### Large Scale (High Traffic)
- S3 Storage: $10-50
- S3 Requests: $10-50
- CloudFront: $100-300
- Route 53: $0.50
- WAF: $20-50
- **Total**: ~$140.50-450.50/month

*Note: Costs are estimates and vary based on actual usage, data transfer, and traffic patterns. Static hosting is extremely cost-effective.*

## Deployment Strategy

### Option 1: Pure Static (Recommended)
1. Build React app with Vite
2. Upload dist folder to S3
3. Configure S3 static website hosting
4. Set up CloudFront distribution
5. Configure Route 53 DNS

### Option 2: With Lambda Functions
1. Deploy static assets to S3
2. Create Lambda functions for form processing
3. Set up API Gateway
4. Configure CloudFront with Lambda@Edge
5. Set up Route 53 DNS

### Option 3: Containerized (Optional)
1. Build Docker image with Nginx
2. Push to ECR
3. Deploy to ECS Fargate
4. Configure ALB
5. Set up CloudFront

## Migration Strategy

### Phase 1: Static Hosting Setup
1. Create S3 bucket
2. Enable static website hosting
3. Upload built application
4. Configure bucket policies

### Phase 2: CDN Configuration
1. Create CloudFront distribution
2. Configure S3 as origin
3. Set up caching policies
4. Enable HTTPS

### Phase 3: DNS & Security
1. Set up Route 53 hosted zone
2. Configure DNS records
3. Set up AWS WAF rules
4. Configure SSL/TLS certificates

### Phase 4: Monitoring & Optimization
1. Enable CloudWatch metrics
2. Set up CloudFront analytics
3. Configure logging
4. Set up alerting

## Maintenance & Operations

### Regular Tasks
- Monitor CloudFront cache hit rates
- Review S3 storage usage
- Analyze CloudFront analytics
- Update WAF rules as needed
- Review and optimize caching policies

### Scaling Considerations
- S3 automatically scales
- CloudFront handles traffic spikes
- No manual scaling needed
- Monitor CloudFront data transfer costs

### Security Updates
- Regularly review WAF rules
- Update SSL certificates (automatic with ACM)
- Review S3 bucket policies
- Monitor for suspicious activity

## CI/CD Integration

### GitHub Actions Workflow
1. Build application with Vite
2. Upload to S3 bucket
3. Invalidate CloudFront cache
4. Deploy to production

### Automated Deployment
- Trigger on git push to main
- Build optimized production bundle
- Sync to S3
- CloudFront cache invalidation
- Health checks

## Conclusion

This AWS architecture provides an extremely cost-effective, scalable, and high-performance solution for the Manicure Booking App. The combination of S3 static hosting and CloudFront CDN ensures global availability with minimal infrastructure overhead, making it ideal for static React applications.

