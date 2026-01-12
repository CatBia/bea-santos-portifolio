# Minha Carona App MVP AWS Architecture

This document outlines the desired AWS architecture for the Minha Carona App MVP, a serverless ride-sharing platform for condominiums designed with cost efficiency and scalability in mind.

## Architecture Overview

The Minha Carona App MVP architecture leverages AWS serverless services to create a fully managed, cost-effective platform that scales automatically and charges only for actual usage. The architecture uses DynamoDB Single Table Design, SQS for atomic reservation processing, and gRPC for high-performance internal communication.

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Users (Residents/Drivers)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  CloudFront CDN  │  S3 (Static Hosting) │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           API Gateway                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Lambda Functions                       │
│  ┌──────────────┐ ┌──────────────┐     │
│  │ FastAPI API  │ │ SQS Worker   │     │
│  └──────────────┘ └──────────────┘     │
└─────────────────┬───────────────────────┘
                  │
                  ├─── gRPC ────► ECS Fargate (gRPC Service)
                  │
                  ▼
┌─────────────────────────────────────────┐
│  DynamoDB │ SQS │ SNS │ Cognito         │
│  (Single  │(Queue)│(Notif)│(Auth)      │
│   Table)  │      │      │              │
└─────────────────────────────────────────┘
```

## AWS Services Breakdown

### Compute Services

#### AWS Lambda
- **Purpose**: Serverless compute for API and workers
- **Configuration**:
  - **API Lambda**: FastAPI with Mangum adapter
    - Runtime: Python 3.11
    - Memory: 512 MB
    - Timeout: 30 seconds
    - Auto-scaling: 0 to N concurrent executions
  - **Worker Lambda**: SQS message processor
    - Runtime: Python 3.11
    - Memory: 256 MB
    - Timeout: 60 seconds
    - Batch size: 1 (sequential processing)
- **Benefits**:
  - Pay only for execution time
  - Automatic scaling
  - Zero server management
  - Built-in high availability

#### API Gateway
- **Purpose**: REST API management and routing
- **Features**:
  - HTTP API (low latency, cost-effective)
  - Request validation
  - CORS configuration
  - Integration with Lambda
- **Benefits**:
  - Automatic scaling
  - Built-in throttling
  - Request/response transformation

#### ECS Fargate (gRPC Service)
- **Purpose**: High-performance gRPC service for internal microservice communication
- **Configuration**:
  - Containerized gRPC servers
  - Auto-scaling: 1 to 10 tasks
  - CPU: 0.5-2 vCPUs per task
  - Memory: 1-4 GB per task
  - Health checks enabled
  - Port: 50051 (gRPC default)
- **Services**:
  - **CaronaService**: Ride operations (GetCarona, CheckVagas, ListCaronasDisponiveis)
  - **ReservaService**: Reservation operations (ProcessarReserva, GetReservas)
- **Benefits**:
  - 10x faster than REST (5-10ms vs 50-100ms)
  - Protocol Buffers reduce payload size by 50-80%
  - HTTP/2 multiplexing for better concurrency
  - Streaming support for large datasets
  - Type-safe contracts with Protocol Buffers
- **Use Cases**:
  - Quick availability checks (5-10ms latency)
  - Synchronous critical reservations (50-200ms vs 1-5s SQS)
  - Streaming large ride lists
  - Real-time bidirectional updates

#### Application Load Balancer (gRPC)
- **Purpose**: Load balancing for gRPC services
- **Features**:
  - HTTP/2 support (required for gRPC)
  - Health checks for gRPC endpoints
  - SSL/TLS termination
  - Target group routing
- **Configuration**:
  - Target type: IP (for ECS Fargate)
  - Protocol: HTTP/2
  - Health check path: gRPC health check endpoint
  - Port: 50051

#### Service Discovery
- **Purpose**: Internal DNS for gRPC service endpoints
- **Service**: AWS Cloud Map
- **Configuration**:
  - Private DNS namespace
  - Service name: `grpc-carona-service`
  - Service discovery endpoint: `grpc-carona-service.internal`
- **Benefits**:
  - Dynamic service discovery
  - Automatic health-based routing
  - No hardcoded IPs or ports

### Storage & Database Services

#### DynamoDB
- **Purpose**: Primary database using Single Table Design
- **Configuration**:
  - **Billing Mode**: PAY_PER_REQUEST (on-demand)
  - **Table Structure**:
    - Partition Key (PK): String
    - Sort Key (SK): String
    - Global Secondary Index (GSI1):
      - GSI1PK: String
      - GSI1SK: String (ISO date format)
  - **Access Patterns**:
    - User lookup: `PK = USER#<id>, SK = METADATA`
    - Ride details: `PK = CARONA#<id>, SK = DETALHES`
    - Reservations: `PK = CARONA#<id>, SK begins_with RESERVA#`
    - Open rides: `GSI1PK = STATUS#ABERTA` (sorted by date/time)
- **Benefits**:
  - Zero cost when idle
  - Single-digit millisecond latency
  - Automatic scaling
  - Built-in backup and restore

#### S3
- **Purpose**: Static frontend hosting
- **Configuration**:
  - Static website hosting enabled
  - CloudFront distribution
  - Versioning enabled
- **Benefits**:
  - Cost-effective storage
  - High durability
  - Easy deployment

### Messaging Services

#### SQS (Simple Queue Service)
- **Purpose**: Reservation queue for atomic processing
- **Configuration**:
  - Standard queue (high throughput)
  - Visibility timeout: 60 seconds
  - Message retention: 24 hours
  - Dead-letter queue (optional)
- **Use Case**:
  - Prevents race conditions in reservations
  - Ensures sequential processing
  - Guarantees at-least-once delivery
- **Benefits**:
  - Decoupled architecture
  - Automatic scaling
  - Built-in retry logic

#### SNS (Simple Notification Service)
- **Purpose**: Notification delivery system
- **Configuration**:
  - Standard topic
  - Multiple subscription types:
    - Email
    - SMS
    - Push notifications
    - Lambda functions
- **Use Cases**:
  - Reservation confirmations
  - Ride status updates
  - System alerts
- **Benefits**:
  - Fan-out messaging
  - Multiple delivery protocols
  - Automatic retry

### Security Services

#### AWS Cognito
- **Purpose**: User authentication and authorization
- **Configuration**:
  - User pools for user management
  - Identity pools for AWS resource access
  - JWT tokens
  - Multi-factor authentication (optional)
- **Features**:
  - Social login (optional)
  - Password policies
  - Account recovery
- **Benefits**:
  - Fully managed service
  - Scalable to millions of users
  - Security best practices

#### IAM
- **Purpose**: Access control for AWS resources
- **Roles**:
  - Lambda execution roles
  - API Gateway service role
  - DynamoDB access policies
- **Policies**:
  - Least privilege principle
  - Resource-specific permissions
  - Environment-based access

### Networking Services

#### CloudFront CDN
- **Purpose**: Global content delivery
- **Configuration**:
  - Origin: S3 bucket
  - Edge locations worldwide
  - Caching policies
  - HTTPS enforcement
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

### Monitoring & Logging Services

#### CloudWatch
- **Purpose**: Metrics, logs, and monitoring
- **Metrics**:
  - Lambda invocations and errors
  - DynamoDB read/write units
  - API Gateway request counts
  - SQS queue depth
- **Logs**:
  - Lambda execution logs
  - API Gateway access logs
  - Application logs
- **Alarms**:
  - High error rates
  - Queue depth thresholds
  - Lambda duration limits

#### X-Ray
- **Purpose**: Distributed tracing
- **Benefits**:
  - Request flow visualization
  - Performance bottleneck identification
  - Service dependency mapping

## gRPC Integration Deep Dive

### Why gRPC in This Architecture?

The Minha Carona App MVP implements a **hybrid communication pattern**:
- **REST APIs** for public-facing endpoints (frontend, mobile)
- **gRPC** for internal microservice communication (high performance)
- **SQS** for asynchronous processing (resilience)

### gRPC Performance Benefits

| Operation | REST API | gRPC | Improvement |
|-----------|----------|------|-------------|
| Check Availability | 50-100ms | 5-10ms | **10x faster** |
| Get Ride Details | 50-100ms | 5-10ms | **10x faster** |
| Process Reservation | 1-5s (SQS async) | 50-200ms (sync) | **10-100x faster** |
| List Rides (100 items) | 200-500ms | 50-100ms (streaming) | **4-5x faster** |
| Payload Size | ~2-5KB (JSON) | ~0.5-1KB (Protobuf) | **50-80% smaller** |

### gRPC Services Implementation

#### CaronaService
- **GetCarona**: Fast ride lookup by ID
- **ListCaronasDisponiveis**: Streaming available rides (efficient for large datasets)
- **CreateCarona**: Internal ride creation between services
- **CheckVagas**: Quick availability check (5-10ms) - most frequently called
- **StreamCaronasUpdates**: Bidirectional streaming for real-time updates

#### ReservaService
- **ProcessarReserva**: Synchronous reservation processing (50-200ms vs 1-5s SQS)
- **GetReservas**: Stream reservations for a specific ride
- **UpdateReservaStatus**: Fast status updates

### gRPC Deployment Architecture

```
Lambda (FastAPI API)
    │
    ├── REST ──► DynamoDB (Public APIs)
    │
    └── gRPC ──► ALB ──► ECS Fargate (gRPC Service)
                      │
                      └──► DynamoDB (Internal Operations)
```

### Protocol Buffers Schema

The application uses Protocol Buffers for efficient serialization:

```protobuf
service CaronaService {
  rpc GetCarona(GetCaronaRequest) returns (CaronaResponse);
  rpc ListCaronasDisponiveis(ListCaronasRequest) returns (stream CaronaResponse);
  rpc CheckVagas(CheckVagasRequest) returns (CheckVagasResponse);
  rpc StreamCaronasUpdates(stream CaronaUpdateRequest) returns (stream CaronaUpdateResponse);
}

service ReservaService {
  rpc ProcessarReserva(ProcessarReservaRequest) returns (ReservaResponse);
  rpc GetReservas(GetReservasRequest) returns (stream ReservaResponse);
}
```

### gRPC Use Cases

#### Case 1: Quick Availability Check
**Scenario**: Frontend needs to verify if seats are available before showing "Reserve" button.

**gRPC Solution**:
- Latency: 5-10ms
- Payload: ~0.5KB
- Perfect for high-frequency polling

#### Case 2: Synchronous Critical Reservation
**Scenario**: Critical case requiring immediate response (can't wait for SQS processing).

**gRPC Solution**:
- Latency: 50-200ms (synchronous)
- vs SQS: 1-5 seconds (asynchronous)
- Immediate feedback to user

#### Case 3: Streaming Large Datasets
**Scenario**: List many available rides efficiently.

**gRPC Solution**:
- Server-side streaming
- Processes one ride at a time
- Lower memory footprint
- Better user experience

### gRPC Security

- **TLS Encryption**: All gRPC communication encrypted in transit
- **IAM Roles**: ECS tasks use IAM roles for DynamoDB access
- **VPC Isolation**: gRPC services in private subnets
- **Service-to-Service Auth**: Mutual TLS or IAM-based authentication

### gRPC Monitoring

- **CloudWatch Metrics**: Request count, latency, error rate
- **X-Ray Tracing**: Distributed tracing for gRPC calls
- **Health Checks**: ALB health checks for gRPC endpoints
- **Logs**: CloudWatch Logs for gRPC service logs

## Architecture Benefits

### Cost Efficiency
- **Pay-per-Request Model**: Zero cost when idle
- **DynamoDB On-Demand**: Pay only for reads/writes
- **Lambda Free Tier**: 1M requests/month free
- **S3 Static Hosting**: Extremely low cost
- **Estimated Monthly Cost (Small Scale)**: $5-20

### Scalability
- **Automatic Scaling**: All services scale automatically
- **No Capacity Planning**: Serverless handles spikes
- **Global Distribution**: CloudFront edge locations
- **Concurrent Executions**: Lambda handles thousands simultaneously

### Reliability
- **High Availability**: Multi-AZ by default
- **Automatic Failover**: Built into all services
- **Atomic Processing**: SQS ensures data consistency
- **99.99% Uptime**: AWS SLA guarantees

### Performance
- **Low Latency**: Single-digit millisecond DynamoDB
- **gRPC Integration**: 5-10ms internal communication
- **CDN Caching**: Sub-second frontend delivery
- **Optimized Queries**: Single Table Design reduces round trips

### Developer Experience
- **Serverless Framework**: Infrastructure as Code
- **Fast Deployment**: Minutes to production
- **Local Development**: Easy local testing
- **Comprehensive Logging**: CloudWatch integration

## Cost Estimates (Monthly)

### Small Scale (Low Traffic - MVP)
- Lambda (API): $0-2 (within free tier)
- Lambda (Worker): $0-1
- ECS Fargate (gRPC): $5-15 (1 task, minimal usage)
- DynamoDB: $0-5 (on-demand)
- SQS: $0-0.50
- SNS: $0-0.50
- S3: $0.50-2
- CloudFront: $1-5
- API Gateway: $0-1 (within free tier)
- ALB (gRPC): $16-20 (base cost)
- Cognito: $0-0.50
- **Total**: ~$23-52/month

### Medium Scale (Moderate Traffic)
- Lambda (API): $5-20
- Lambda (Worker): $2-10
- ECS Fargate (gRPC): $30-80 (2-3 tasks, auto-scaling)
- DynamoDB: $10-50
- SQS: $1-5
- SNS: $1-5
- S3: $2-10
- CloudFront: $10-30
- API Gateway: $5-15
- ALB (gRPC): $16-20 (base cost)
- Cognito: $1-5
- **Total**: ~$82-250/month

### Large Scale (High Traffic)
- Lambda (API): $50-200
- Lambda (Worker): $20-100
- DynamoDB: $100-500
- SQS: $10-50
- SNS: $10-50
- S3: $20-100
- CloudFront: $50-200
- API Gateway: $50-200
- Cognito: $10-50
- **Total**: ~$320-1,500/month

*Note: Costs are estimates and vary based on actual usage, region, and traffic patterns. The pay-per-request model makes this architecture extremely cost-effective for MVPs.*

## Deployment Strategy

### Development Environment
- Single-region deployment
- Minimal CloudFront caching
- Development DynamoDB table
- Mock authentication

### Production Environment
- Multi-region deployment (optional)
- Full CloudFront caching
- Production DynamoDB table
- AWS Cognito integration
- Comprehensive monitoring

## Migration Strategy

### Phase 1: Core Infrastructure
1. Set up DynamoDB table with GSI
2. Configure SQS queue
3. Set up SNS topic
4. Create IAM roles and policies

### Phase 2: Lambda Functions
1. Deploy API Lambda with FastAPI
2. Deploy Worker Lambda for SQS
3. Configure API Gateway
4. Set up environment variables

### Phase 3: Frontend Deployment
1. Build React application
2. Deploy to S3
3. Configure CloudFront distribution
4. Set up Route 53 DNS

### Phase 4: Security & Monitoring
1. Integrate AWS Cognito
2. Configure CloudWatch alarms
3. Enable X-Ray tracing
4. Set up backup policies

## Maintenance & Operations

### Regular Tasks
- Monitor Lambda execution metrics
- Review DynamoDB read/write capacity
- Check SQS queue depth
- Analyze CloudWatch logs
- Review cost reports

### Scaling Considerations
- Monitor Lambda concurrent executions
- Review DynamoDB throttling events
- Check SQS message processing time
- Optimize CloudFront cache hit rates

### Security Updates
- Regularly review IAM permissions
- Update Cognito password policies
- Rotate access keys
- Review security group rules

## DynamoDB Single Table Design

### Key Structure
- **PK (Partition Key)**: Entity identifier
  - `USER#<id>`: User records
  - `CARONA#<id>`: Ride records
  - `CONDOMINIO#<id>`: Condominium records
- **SK (Sort Key)**: Record type or relationship
  - `METADATA`: Entity metadata
  - `DETALHES`: Entity details
  - `RESERVA#<user_id>`: Reservation records

### Global Secondary Index (GSI1)
- **GSI1PK**: `STATUS#<status>` (e.g., `STATUS#ABERTA`)
- **GSI1SK**: ISO date/time for sorting
- **Use Case**: List all open rides for today, sorted by time

### Access Patterns Supported
1. Get user by ID: `PK = USER#<id>, SK = METADATA`
2. Get ride by ID: `PK = CARONA#<id>, SK = DETALHES`
3. List reservations for ride: `PK = CARONA#<id>, SK begins_with RESERVA#`
4. List open rides: `GSI1PK = STATUS#ABERTA` (sorted by GSI1SK)
5. List rides by condominium: `PK = CONDOMINIO#<id>, SK begins_with CARONA#`

## SQS Reservation Pattern

### Why SQS?
The reservation system uses SQS to prevent race conditions when multiple users try to reserve the last available seat simultaneously.

### Flow
1. User requests reservation → API sends message to SQS
2. SQS queues message → Ensures sequential processing
3. Worker Lambda processes message → Atomically checks and updates DynamoDB
4. Result → Reservation confirmed or rejected
5. Notification → SNS sends confirmation to user

### Benefits
- **Atomic Processing**: No duplicate reservations
- **Sequential Processing**: One reservation at a time
- **Reliability**: Automatic retry on failure
- **Scalability**: Handles high concurrent requests

## gRPC Integration

### When to Use gRPC
- ✅ Internal microservice communication
- ✅ High-frequency operations (checking availability)
- ✅ Low-latency requirements (5-10ms vs 50-100ms REST)
- ✅ Streaming data
- ✅ Protocol buffer efficiency

### When NOT to Use gRPC
- ❌ Public APIs (frontend/mobile)
- ❌ External service integration
- ❌ Simple CRUD operations
- ❌ Browser-based clients

### Implementation
- Protocol Buffers for schema definition
- gRPC server for internal services
- gRPC client for service-to-service calls
- HTTP/2 for efficient communication

## Conclusion

This AWS architecture provides a cost-effective, scalable, and reliable platform for the Minha Carona App MVP. The combination of serverless services, Single Table Design, and event-driven architecture ensures high performance and minimal operational overhead, making it perfect for MVPs and small to medium-scale applications.

The pay-per-request model means the platform costs nothing when idle, making it ideal for condominiums with varying usage patterns. As traffic grows, the architecture automatically scales without manual intervention.

