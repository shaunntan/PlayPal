#!/bin/bash
# dont use sudo!
# Prerequisites:
# Use this AMI: Amazon Linux 2 AMI (HVM) - Kernel 5.10, SSD Volume Type - ami-0db78d64e83cf051e (64-bit x86)
# Tag instance to IAM with SSM Read Only
# Place environment variables into AWS Systems Manager Parameter Store
yum update -y
yum install curl -y

# install node using this
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install node

# install git as the AMI does not come with it
yum install git -y
yum install -y jq

# clone PlayPal from git
cd ~
git clone https://github.com/shaunntan/PlayPal.git
cd PlayPal

# load parameters from parameter store
main_path="playpal"   
environment="dev"          
parameter_store_prefix="/${main_path}"
export_statement=$(aws ssm get-parameters-by-path \
    --path "${parameter_store_prefix}" \
    --region ap-southeast-1 --recursive \
    --with-decrypt \
    | jq -r '.Parameters[] | (.Name | split("/")[-1] | ascii_upcase | gsub("-"; "_")) + "=\"" + .Value + "\""' \
    )
eval $export_statement
cat -s > ./.env << EOF

$export_statement

EOF

# generate environment variables file for dot-env
# environment variables are placed in AWS Systems Manager Parameter Store
# sh ./loadenv.sh

# install node.js dependencies
npm install

# run server on port 4000
node app.js