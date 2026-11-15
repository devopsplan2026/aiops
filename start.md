Step: 1

>> go to boutique-microservices folder and run the docker compose file.

docker compose up --build

docker compose down

# Terraform Upgrade
terraform init -upgrade

# Upgrade and reconfigure the backend (e.g. if you changed backend settings)
terraform init -upgrade -reconfigure

# Upgrade and migrate existing state to a new backend
terraform init -upgrade -migrate-state


Step 2

Create a infrastructure with the help of terraform.


Step: 3

aws eks update-kubeconfig --region us-east-1 --name eks-cluster