provider "aws" {
  region = "us-east-1"
}

# Generate SSH key pair
resource "tls_private_key" "frontend_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Register public key with AWS EC2
resource "aws_key_pair" "frontend_key" {
  key_name   = "frontend-key"
  public_key = tls_private_key.frontend_key.public_key_openssh
}

# Save private key locally
resource "local_file" "frontend_key_file" {
  content         = tls_private_key.frontend_key.private_key_pem
  filename        = "${path.module}/frontend-key.pem"
  file_permission = "0400"
}

# Fetch default VPC and subnet
data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "default" {
  vpc_id = data.aws_vpc.default.id
}

# Create security group allowing SSH, HTTP, HTTPS
resource "aws_security_group" "frontend_sg" {
  name        = "frontend-sg"
  description = "Allow SSH, HTTP, HTTPS"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For production, replace with your IP
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create EC2 instance
resource "aws_instance" "frontend_server" {
  ami                         = "ami-0c02fb55956c7d316" # Amazon Linux 2 AMI (HVM)
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.frontend_key.key_name
  subnet_id                   = data.aws_subnet_ids.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.frontend_sg.id]
  associate_public_ip_address = true

  tags = {
    Name = "frontend-server"
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install nginx1 -y
              systemctl enable nginx
              systemctl start nginx
              curl -sL https://rpm.nodesource.com/setup_18.x | bash -
              yum install -y nodejs git
              mkdir -p /var/www/frontend
              chown -R ec2-user:ec2-user /var/www/frontend
              EOF
}

# Output public IP
output "instance_ip" {
  value = aws_instance.frontend_server.public_ip
}

# Output private key (optional - sensitive)
output "private_key_pem" {
  value     = tls_private_key.frontend_key.private_key_pem
  sensitive = true
}
