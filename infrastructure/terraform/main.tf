# infrastructure/terraform/main.tf

provider "aws" {
  region = "af-south-1"  # Cape Town
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
