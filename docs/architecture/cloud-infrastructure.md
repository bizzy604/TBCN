# Cloud Infrastructure & DevOps Strategy

**Design Date:** 2026-01-26
**Architect:** Antigravity (AI)
**Target Platform:** AWS (Amazon Web Services)
**Region:** `af-south-1` (Cape Town) - Selected for latency optimization for primary African user base.

---

## 1. Architecture Overview

The Brand Coach Network utilizes a **Cloud-Native** approach leveraging managed services to reduce operational overhead while ensuring high availability and scalability. The infrastructure is provisioned as code (IaC) using **Terraform** and orchestrated using **Kubernetes (EKS)**.

### High-Level Diagram
```mermaid
graph TD
    User -->|HTTPS| CloudFront[CloudFront CDN]
    CloudFront --> AL[Application Load Balancer]
    AL -->|Ingress| EKS[EKS Cluster]
    
    subgraph VPC
        subgraph Public Subnet
            NAT[NAT Gateway]
            AL
        end
        
        subgraph Private Subnet
            EKS -->|Pods| API[API Service]
            EKS -->|Pods| Web[Web Service]
            API --> RDS[RDS PostgreSQL]
            API --> Elasticache[Redis]
        end
    end
    
    API --> S3[S3 Media Bucket]
```

---

## 2. Infrastructure Components & Rationale

### 2.1 Networking (VPC)
- **Configuration**: 3 Availability Zones (AZs) for high availability.
- **Subnets**: 
  - **Public**: Hosting Load Balancers and NAT Gateways.
  - **Private**: Hosting EKS Nodes and Database instances (Security best practice).
- **Rationale**: Strict isolation of compute resources from the public internet prevents direct attack vectors.

### 2.2 Compute (Amazon EKS)
- **Service**: Elastic Kubernetes Service (Managed Control Plane).
- **Node Groups**: Managed Node Groups with `t3.medium` instances.
- **Why EKS?**:
  - **Standardization**: Uses standard K8s manifests, making it portable (easier migration to GCP/Azure if needed).
  - **Scalability**: Horizontal Pod Autoscaling (HPA) handles traffic spikes during launch events.
  - **Ecosystem**: Easy integration with monitoring (Prometheus), logging (Fluentbit), and ingress controllers.

### 2.3 Database (Amazon RDS)
- **Engine**: PostgreSQL 15.
- **Instance**: `db.t3.large` (Burstable performance).
- **Configuration**: Multi-AZ disabled for Dev (cost), Enabled for Prod (reliability).
- **Why Managed RDS?**:
  - Automated backups and localized point-in-time recovery.
  - Patch management handles security updates automatically.
  - **Trade-off**: Higher cost than self-hosted Postgres on EC2, but significantly lower operational burden.

### 2.4 Storage (Amazon S3)
- **Bucket**: `brandcoach-media-prod`.
- **Purpose**: Storing user uploads, course videos, and artifacts.
- **Design**: Private bucket with CloudFront Origin Access Identity (OAI) to serve content globally with low latency.

---

## 3. Trade-Off Analysis

| Decision | Choice | Trade-offs Considered |
| :--- | :--- | :--- |
| **Orchestration** | **Kubernetes (EKS)** | **Complexity vs. Control**. K8s is complex to set up compared to ECS/AppRunner, but offers superior control over scheduling, zero-downtime deployments, and vendor agnosticism. |
| **IaC Tool** | **Terraform** | **State Management**. Requires managing state files (S3 backend recommended), unlike CloudFormation. However, Terraform boasts a larger ecosystem and multi-cloud capability. |
| **Database** | **PostgreSQL** | **Relational Structure**. We chose SQL over NoSQL (Mongo/Dynamo) because financial transactions and structured course data require ACID compliance and relational integrity. |
| **Region** | **af-south-1** | **Cost vs. Latency**. Cape Town region is slightly more expensive than `us-east-1`, but provides <20ms latency for the target East African market vs >200ms for US regions. |

---

## 4. Deployment Guide

### Prerequisites
- AWS CLI configured with appropriate permissions.
- Terraform v1.5+.
- `kubectl` installed.

### Step 1: Provision Infrastructure (Terraform)
1. Navigate to the terraform directory:
   ```bash
   cd infrastructure/terraform
   ```
2. Initialize Terraform providers:
   ```bash
   terraform init
   ```
3. Preview changes:
   ```bash
   terraform plan -out=tfplan
   ```
4. Apply infrastructure (Provisions VPC, RDS, EKS):
   ```bash
   terraform apply tfplan
   ```
   *Note: This process takes ~15-20 minutes.*

### Step 2: Configure Kubernetes connection
Update your local `kubeconfig` to connect to the new EKS cluster:
```bash
aws eks update-kubeconfig --region af-south-1 --name brandcoach-cluster
```

### Step 3: Deploy Applications
1. Navigate to the k8s directory:
   ```bash
   cd ../k8s
   ```
2. Apply Secrets (Create this manually first!):
   ```bash
   kubectl create secret generic app-secrets \
     --from-literal=database-url='postgresql://user:pass@endpoint:5432/db'
   ```
3. Deploy Services:
   ```bash
   kubectl apply -f api-deployment.yaml
   kubectl apply -f web-deployment.yaml
   kubectl apply -f ingress.yaml
   ```

### Step 4: Verify Deployment
Check the status of pods and services:
```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## 5. Security Posture
- **Encryption at Rest**: Enabled on all RDS volumes and S3 buckets (AES-256).
- **Encryption in Transit**: TLS 1.2+ enforced on Load Balancers.
- **Least Privilege**: IAM roles for EKS nodes restricted to necessary permissions (S3 access, e.g.).
- **Private Subnets**: Database and Application servers have no public IP addresses.
