aws_profile = "superhero"
aws_region = "us-east-1"
vpc_cidr = "10.0.0.0/16"
cidrs = {
  public1 = "10.0.1.0/24"
  public2 = "10.0.2.0/24"
  private1 = "10.0.3.0/24"
  private2 = "10.0.4.0/24"
  rds1 = "10.0.5.0/24"
  rds2 = "10.0.6.0/24"
  rds3 = "10.0.7.0/24"
}
localip = "34.219.93.248/32"
domain_name = "example-domain"
db_instance_class = "db.t2.micro"
dbname = "superherodb"
dbuser = "superhero"
dbpassword = "superheropass"

key_name = "kryptonite" # key name
public_key_path = "/root/.ssh/kryptonite.pub" # from ssh-keygen
dev_instance_type = "t2.micro"
dev_ami = "ami-b73b63a0" # us-east-1

elb_healthy_threshold = "2"
elb_unhealthy_threshold = "2"
elb_timeout = "3"
elb_interval = "30"

lc_instance_type = "t2.micro"

asg_max = "3"
asg_min = "2"
asg_capacity = "3"
asg_grace = "300"
asg_health_check_type = "EC2"