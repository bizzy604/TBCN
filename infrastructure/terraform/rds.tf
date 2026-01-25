# infrastructure/terraform/rds.tf

module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "brandcoach-db"

  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.large"
  allocated_storage = 20

  db_name  = "brandcoach"
  username = "brandcoach_admin"
  port     = "5432"

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  subnet_ids             = module.vpc.private_subnets

  family = "postgres15"
  major_engine_version = "15"

  deletion_protection = true
}
