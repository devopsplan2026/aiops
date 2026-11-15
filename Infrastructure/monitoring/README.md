# Monitoring and Alerting Configuration

This folder contains the configuration for Prometheus, Grafana, and Alertmanager with Gmail email notifications.

## Files

- **prometheus-stack-values.yaml** - Helm values for kube-prometheus-stack with Alertmanager + Gmail configuration
- **apply-monitoring.sh** - Script to deploy/update the monitoring stack

## Quick Setup

### Deploy Monitoring Stack with Alerting

```bash
cd /home/vishal/Desktop/boutique_project/Infrastructure/monitoring

# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install or upgrade the monitoring stack
helm upgrade --install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace \
  -f prometheus-stack-values.yaml
```

### Update Email Configuration

Edit `prometheus-stack-values.yaml` and update:
- `smtp_auth_username`: Your Gmail address
- `smtp_auth_password`: Your Gmail App Password
- `to`: Recipient email address

Then apply:
```bash
helm upgrade kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  -n monitoring \
  -f prometheus-stack-values.yaml
```

## Alert Rules (Alternative Method)

Alert rules are also available as a standalone manifest:
```bash
kubectl apply -f ../../gitops/k8s/monitoring-alerts.yml
```

## Access Dashboards

### Prometheus
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
```
Open: http://localhost:9090

### Alertmanager
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093
```
Open: http://localhost:9093

### Grafana
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```
Open: http://localhost:3000
- Username: admin
- Password: `kubectl get secret -n monitoring kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode`

## Gmail App Password Setup

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Generate an App Password for "Mail"
5. Copy the 16-character password
6. Update `prometheus-stack-values.yaml` with the password

## Test Alerts

See `../../ALERTING_SETUP.md` for detailed testing instructions.

Quick test:
```bash
# Create a failing pod
kubectl run test-alert --image=nonexistent:tag -n boutique

# Wait 2 minutes, check email
# Clean up
kubectl delete pod test-alert -n boutique
```

## Configured Alerts

| Alert Name | Severity | Trigger | Wait Time |
|-----------|----------|---------|-----------|
| PodNotRunning | Critical | Pod not in Running state | 2 min |
| PodCrashLooping | Critical | Pod restarts > 0 in 5min | 1 min |
| HighMemoryUsage | Warning | Memory > 80% | 2 min |
| HighCPUUsage | Warning | CPU > 80% | 2 min |
| DeploymentReplicasMismatch | Warning | Replicas mismatch | 5 min |
| ServiceHasNoEndpoints | Critical | No endpoints | 2 min |
| PostgreSQLDown | Critical | DB not responding | 1 min |

## Troubleshooting

### Check Alertmanager logs
```bash
kubectl logs -n monitoring alertmanager-kube-prometheus-stack-alertmanager-0
```

### Check Prometheus configuration
```bash
kubectl get prometheusrules -n monitoring
```

### Verify email configuration
```bash
kubectl get secret -n monitoring alertmanager-kube-prometheus-stack-alertmanager \
  -o jsonpath='{.data.alertmanager\.yaml}' | base64 -d
```

## Uninstall

```bash
helm uninstall kube-prometheus-stack -n monitoring
kubectl delete namespace monitoring
```
