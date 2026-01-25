# infrastructure/terraform/s3.tf

module "s3_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "brandcoach-media-prod"
  acl    = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  versioning = {
    enabled = true
  }
}
