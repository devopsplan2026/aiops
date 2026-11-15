Step: 1

>> go to boutique-microservices folder and run the docker compose file.

docker compose up --build

docker compose down

Step 2

Create a infrastructure with the help of terraform.

# Basic Flow
terraform init
terrafom plan
terraform validate
terraform apply

# Terraform Upgrade
terraform init -upgrade

# Upgrade and reconfigure the backend (e.g. if you changed backend settings)
terraform init -upgrade -reconfigure

# Upgrade and migrate existing state to a new backend
terraform init -upgrade -migrate-state

Step: 3

aws eks update-kubeconfig --region us-east-1 --name eks-cluster

Go to gitops folder and change account ID with your aws account id from all images.

kubectl apply -k gitops/

Step: 4

go to github and create repo env variable's

AWS_ACCESS_KEY_ID

AWS_ACCOUNT_ID

AWS_SECRET_ACCESS_KEY

AWS_REGION

GITHUBB_TOKEN

Now go to vs code and push your code.

Step: 5

kubectl get nodes
kubectl get pods
kubectl get ns
kubectl get ns argocd
kubectl get ns boutique
kubectl get ns monitoring

Step:6

now we run argocd:

kubectl port-forward svc/argocd-server -n argocd 8080:80

get password of argocd:

kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo



******************************

Extra:

Empty-commit command:

git commit --allow-empty -m "ci: trigger workflow" 
git push