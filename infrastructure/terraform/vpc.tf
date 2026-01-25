# infrastructure/terraform/vpc.tf

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "brandcoach-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["af-south-1a", "af-south-1b", "af-south-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true # Save costs for non-prod

  tags = {
    Environment = "prod"
    Project     = "brand-coach-network"
  }
}
