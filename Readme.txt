Launch Config Prerequisites:
    1) Place environment variables into AWS Systems Manager Parameter Store
Launch Config:
    1) Use this AMI: Amazon Linux 2 AMI (HVM) - Kernel 5.10, SSD Volume Type (64-bit x86): ami-0801a1e12f4a9ccc0
    2) Tag instances with IAM instance profile that has SSM Read Only
    3) Attacha a security group that allows TCP inbound on port 4000
    4) take all text from userdata.sh and paste as text into user data field for launch config