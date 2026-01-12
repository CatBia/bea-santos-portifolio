# Client Project Service GitHub AWS Architecture

This document outlines the desired AWS architecture for the Client Project Service GitHub, designed to support a scalable microservice for fetching and storing GitHub repository statistics with MongoDB integration.

## Architecture Overview

The Client Project Service GitHub architecture leverages AWS serverless and container services to create a robust platform for GitHub statistics collection, processing, and storage with high availability and cost efficiency.

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Users / Dashboard                │
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
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  ECS Fargate (Go Service)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │Instance 1│ │Instance 2│ │Instance N││
│  └──────────┘ └──────────┘ └──────────┘│
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  GitHub API (External)                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  DocumentDB │ DocumentDB │ ElastiCache  │
│  (Stats DB) │ (Crawler)  │  (Redis)    │
└─────────────────────────────────────────┘
```

## AWS Services Breakdown

### Compute Services

#### ECS Fargate
- **Purpose**: Serverless container hosting for Go microservice
- **Configuration**:
  - Go 1.22+ runtime
  - Auto-scaling: 1 to 10 instances
  - CPU: 0.5-2 vCPUs per instance
  - Memory: 1-4 GB per instance
  - Health checks enabled
- **Benefits**:
  - Pay only for running containers
  - Automatic scaling based on CPU/memory metrics
  - Zero-downtime deployments

### Networking Services

#### Virtual Private Cloud (VPC)
- **Purpose**: Isolated network environment
- **Configuration**:
  - Public and private subnets
  - NAT Gateway for outbound internet
  - VPC endpoints for AWS services
- **Security**:
  - Security groups for service isolation
  - Network ACLs for additional protection

#### Application Load Balancer (ALB)
- **Purpose**: Load balancing and SSL termination
- **Features**:
  - HTTP/HTTPS routing
  - Health checks
  - SSL/TLS termination
  - Path-based routing

#### CloudFront CDN
- **Purpose**: Global content delivery for API responses
- **Configuration**:
  - Edge locations worldwide
  - Caching for API responses
  - Custom error pages
- **Benefits**:
  - Reduced latency
  - Lower bandwidth costs
  - DDoS protection

#### Route 53
- **Purpose**: DNS management
- **Features**:
  - Domain name resolution
  - Health checks
  - Failover routing

#### AWS WAF
- **Purpose**: Web application firewall
- **Protection**:
  - SQL injection
  - XSS attacks
  - Rate limiting
  - Geographic restrictions

### Database Services

#### DocumentDB (MongoDB Compatible) - Stats Database
- **Purpose**: Primary database for GitHub statistics
- **Configuration**:
  - Multi-AZ deployment
  - Automated backups
  - Encryption at rest
- **Data Models**:
  - Project statistics
  - Branches data
  - Commits history
  - Pull requests

#### DocumentDB (MongoDB Compatible) - Crawler Database
- **Purpose**: Read-only access to crawler database
- **Configuration**:
  - Read replicas
  - Connection pooling
  - Query optimization
- **Data Access**:
  - Project metadata
  - SSH URLs
  - Owner/repo information

#### ElastiCache (Redis)
- **Purpose**: Caching GitHub API responses
- **Configuration**:
  - Redis 7.x
  - Cluster mode enabled
  - Multi-AZ replication
- **Use Cases**:
  - GitHub API response caching
  - Rate limit tracking
  - Batch processing state

### Security Services

#### Secrets Manager
- **Purpose**: Secure credential storage
- **Secrets**:
  - GitHub Personal Access Tokens
  - MongoDB credentials
  - Database connection strings

#### IAM
- **Purpose**: Access control
- **Roles**:
  - ECS task roles
  - Service accounts
  - Developer access

#### KMS
- **Purpose**: Encryption key management
- **Usage**:
  - Database encryption
  - Secrets encryption

### Monitoring & Logging Services

#### CloudWatch
- **Purpose**: Metrics and monitoring
- **Metrics**:
  - Request latency
  - Error rates
  - Container CPU/memory
  - Database connections
  - GitHub API call rates
- **Alarms**:
  - High error rates
  - Resource utilization
  - Service health
  - GitHub API rate limit warnings

#### CloudWatch Logs
- **Purpose**: Centralized logging
- **Log Groups**:
  - Application logs
  - Access logs
  - Error logs
  - Batch processing logs

#### X-Ray
- **Purpose**: Distributed tracing
- **Benefits**:
  - Request flow visualization
  - Performance bottleneck identification
  - External API call tracking

## Architecture Benefits

### Scalability
- Auto-scaling ECS Fargate containers handle batch processing
- DocumentDB scales read replicas automatically
- ElastiCache provides horizontal scaling

### High Availability
- Multi-AZ deployment ensures 99.99% uptime
- Automatic failover for databases
- Health checks and auto-recovery

### Security
- WAF protection against common attacks
- VPC isolation for network security
- Encryption at rest and in transit
- IAM for fine-grained access control

### Performance
- CloudFront CDN reduces latency globally
- ElastiCache provides sub-millisecond response times
- Caching reduces GitHub API calls
- Connection pooling for database efficiency

### Cost Optimization
- Fargate serverless model pays only for usage
- Auto-scaling to zero during low traffic
- ElastiCache reduces GitHub API rate limit issues
- Efficient resource utilization

## Cost Estimates (Monthly)

### Small Scale (Low Traffic)
- ECS Fargate: $30-60
- DocumentDB (Stats): $50-100
- DocumentDB (Crawler): $50-100
- ElastiCache: $20-40
- CloudFront: $10-25
- Networking: $10-20
- Monitoring: $5-10
- **Total**: ~$175-355/month

### Medium Scale (Moderate Traffic)
- ECS Fargate: $150-400
- DocumentDB (Stats): $200-400
- DocumentDB (Crawler): $200-400
- ElastiCache: $50-100
- CloudFront: $30-60
- Networking: $30-60
- Monitoring: $15-30
- **Total**: ~$675-1,350/month

### Large Scale (High Traffic)
- ECS Fargate: $500-1,500
- DocumentDB (Stats): $800-1,500
- DocumentDB (Crawler): $800-1,500
- ElastiCache: $200-500
- CloudFront: $100-300
- Networking: $100-300
- Monitoring: $50-150
- **Total**: ~$2,550-5,750/month

*Note: Costs are estimates and vary based on actual usage, region, and traffic patterns.*

## Deployment Strategy

### Development Environment
- Single-region deployment
- Minimal instance count
- Development DocumentDB clusters
- Reduced CloudFront caching

### Production Environment
- Multi-region deployment
- Auto-scaling enabled
- Production-grade DocumentDB
- Full CloudFront caching
- Comprehensive monitoring

## Migration Strategy

### Phase 1: Core Infrastructure
1. Set up VPC and networking
2. Configure IAM roles and policies
3. Set up Secrets Manager
4. Deploy DocumentDB clusters (stats and crawler)

### Phase 2: Application Deployment
1. Build and push Docker images to ECR
2. Deploy ECS Fargate services
3. Configure ALB and CloudFront
4. Set up Route 53 DNS

### Phase 3: Optimization
1. Enable ElastiCache
2. Configure CloudFront caching
3. Set up AWS WAF rules
4. Enable X-Ray tracing

### Phase 4: Monitoring & Operations
1. Configure CloudWatch dashboards
2. Set up alerting
3. Enable CloudWatch Logs
4. Configure backup policies

## Maintenance & Operations

### Regular Tasks
- Monitor ECS service metrics
- Review DocumentDB performance
- Optimize ElastiCache hit rates
- Review and rotate GitHub tokens
- Analyze X-Ray traces for optimization
- Monitor GitHub API rate limits

### Scaling Considerations
- Monitor request patterns
- Adjust auto-scaling parameters
- Optimize DocumentDB read replicas
- Review CloudFront cache hit rates
- Monitor batch processing performance

### Security Updates
- Regularly review IAM permissions
- Update WAF rules
- Rotate GitHub tokens
- Review security group rules
- Update MongoDB credentials

## GitHub API Rate Limits

### Without Authentication
- 60 requests/hour per IP
- Limited functionality
- Not recommended for production

### With Authentication
- 5,000 requests/hour per token
- Full API access
- Recommended for production

### Best Practices
- Use ElastiCache to cache responses
- Implement request queuing
- Batch process during off-peak hours
- Monitor rate limit usage
- Use multiple tokens if needed

## Conclusion

This AWS architecture provides a scalable, secure, and cost-effective platform for the Client Project Service GitHub. The combination of ECS Fargate, DocumentDB, and ElastiCache ensures high performance and availability while maintaining cost efficiency through serverless and auto-scaling capabilities.

