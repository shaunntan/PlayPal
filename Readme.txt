The launch config and environment variables were set up for use with Shaunn Tan's account: cs5224m5@comp.nus.edu.sg

Launch Config Prerequisites:
    1) Place environment variables in .env into AWS Systems Manager Parameter Store
    2) Lambda function for recommender feature should be setup as well
    3) Github source should be made public before launch of EC2 instances. Please contact shaunntan@u.nus.edu

Launch Config:
    1) Use this AMI: Amazon Linux 2 AMI (HVM) - Kernel 5.10, SSD Volume Type (64-bit x86): ami-0801a1e12f4a9ccc0, or equivalent
    2) Tag instances with IAM instance profile that has SSM Read Only
    3) Attach a security group that allows TCP inbound on port 4000
    4) take all text from userdata.sh and paste as text into user data field for launch config

Launch the web app in AWS:
    1) EC2 instance with elastic IP: access via IP address at port 4000
    OR
    2) EC2 instance attached to ELB, per specified architecture: access via ELB address at port 4000

Launch the web app locally:
    1) ensure that Node.js is installed
    2) run 'npm install' to install relevant modules
    3) run 'node app.js'
    4) site can be accessed via "localhost:4000"