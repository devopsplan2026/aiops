# Gmail Alerting Setup - Boutique Application

## ✅ Configuration Complete!

### Email Notification Details
- **Recipient Email**: guru.devops.plan.1999@gmail.com
- **Sender Email**: guru.devops.plan.1999@gmail.com
- **SMTP Server**: smtp.gmail.com:587 (TLS enabled)

---

## 📧 Configured Alerts

### 1. **PodNotRunning** (Critical)
- **Triggers**: When any pod in `boutique` namespace is not in Running state
- **Wait Time**: 2 minutes
- **Email Subject**: 🚨 K8s Alert: PodNotRunning

### 2. **PodCrashLooping** (Critical)
- **Triggers**: When pod restarts more than once in 5 minutes
- **Wait Time**: 1 minute
- **Email Subject**: 🚨 K8s Alert: PodCrashLooping

### 3. **HighMemoryUsage** (Warning)
- **Triggers**: When container uses > 80% of memory limit
- **Wait Time**: 2 minutes
- **Email Subject**: 🚨 K8s Alert: HighMemoryUsage

### 4. **HighCPUUsage** (Warning)
- **Triggers**: When container uses > 80% CPU
- **Wait Time**: 2 minutes
- **Email Subject**: 🚨 K8s Alert: HighCPUUsage

### 5. **DeploymentReplicasMismatch** (Warning)
- **Triggers**: When deployment has fewer available replicas than desired
- **Wait Time**: 5 minutes
- **Email Subject**: 🚨 K8s Alert: DeploymentReplicasMismatch

### 6. **ServiceHasNoEndpoints** (Critical)
- **Triggers**: When a service has no available endpoints
- **Wait Time**: 2 minutes
- **Email Subject**: 🚨 K8s Alert: ServiceHasNoEndpoints

### 7. **PostgreSQLDown** (Critical)
- **Triggers**: When PostgreSQL database pod is not responding
- **Wait Time**: 1 minute
- **Email Subject**: 🚨 K8s Alert: PostgreSQLDown

---

## 🧪 How to Test Alerts

### Test 1: Pod Failure Alert
```bash
# Delete a pod to trigger PodNotRunning alert
kubectl delete pod -n boutique -l app=auth

# Wait 2-3 minutes, then check email
# The pod will automatically restart, so alert will resolve
```

### Test 2: Service Failure Alert
```bash
# Scale down a deployment to trigger alerts
kubectl scale deployment auth -n boutique --replicas=0

# This triggers:
# - DeploymentReplicasMismatch (after 5 min)
# - ServiceHasNoEndpoints (after 2 min)

# Restore the service
kubectl scale deployment auth -n boutique --replicas=1
```

### Test 3: Database Down Alert
```bash
# Delete PostgreSQL pod
kubectl delete pod boutique-postgres-0 -n boutique

# Alert fires after 1 minute
# Pod will restart automatically
```

### Test 4: High CPU Alert (Stress Test)
```bash
# Run a CPU stress test on a pod
kubectl exec -n boutique deployment/product-service -- sh -c "while true; do echo; done" &

# Wait 2 minutes for alert
# Kill the stress test: pkill -f "while true"
```

---

## 📊 Access Monitoring Dashboards

### Prometheus (Metrics & Alerts)
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
```
Then open: http://localhost:9090

**Check Alerts**: http://localhost:9090/alerts
**Check Targets**: http://localhost:9090/targets

### Alertmanager (Email Configuration)
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093
```
Then open: http://localhost:9093

**View Active Alerts**: http://localhost:9093/#/alerts
**Silence Alerts**: http://localhost:9093/#/silences

### Grafana (Visualization)
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```
Then open: http://localhost:3000
- **Username**: admin
- **Password**: `kubectl get secret -n monitoring kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode`

---

## 📧 Email Format

When an alert fires, you'll receive an email like this:

**Subject**: 🚨 K8s Alert: PodNotRunning

**Body**:
```
Alert Details
Alert: PodNotRunning
Severity: critical
Namespace: boutique
Pod: auth-797bf59b-z7tpt
Description: Pod auth-797bf59b-z7tpt in namespace boutique has been in Pending state for more than 2 minutes.
Time: 2026-11-16T00:35:00Z
```

---

## 🔧 Modify Alert Configuration

Edit the Helm values:
```bash
vim /tmp/alertmanager-values.yaml
```

Apply changes:
```bash
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring -f /tmp/alertmanager-values.yaml
```

---

## 🗑️ Cleanup (After Practice)

To disable alerting after your demonstration:
```bash
# Disable Alertmanager
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --set alertmanager.enabled=false

# Or completely remove the monitoring stack
helm uninstall kube-prometheus-stack -n monitoring
```

---

## 📝 Alert Resolution Times

| Alert | Trigger Condition | Wait Time | Auto-Resolve |
|-------|------------------|-----------|--------------|
| PodNotRunning | Pod not in Running state | 2 min | Yes (when pod starts) |
| PodCrashLooping | Restarts in 5min window | 1 min | Yes (when stable) |
| HighMemoryUsage | > 80% memory | 2 min | Yes (when < 80%) |
| HighCPUUsage | > 80% CPU | 2 min | Yes (when < 80%) |
| DeploymentReplicasMismatch | Replicas mismatch | 5 min | Yes (when matched) |
| ServiceHasNoEndpoints | No endpoints | 2 min | Yes (when available) |
| PostgreSQLDown | DB not responding | 1 min | Yes (when up) |

---

## ⚠️ Important Notes

1. **Gmail App Password**: The password used is an App Password, not your regular Gmail password
2. **Rate Limiting**: Gmail may rate-limit if too many alerts fire
3. **Spam Folder**: Check spam folder if emails don't appear in inbox
4. **Alert Grouping**: Multiple alerts are grouped together in one email
5. **Repeat Interval**: Same alert won't repeat email for 12 hours (configurable)

---

## 🎯 Quick Test Command

Run this to trigger an immediate test:
```bash
# This will cause a pod to fail and trigger alerts
kubectl run test-alert --image=nonexistent:tag -n boutique

# Check alerts in 2-3 minutes
# Clean up
kubectl delete pod test-alert -n boutique
```

---

## 📞 Support

If alerts are not working:
1. Check Alertmanager logs: `kubectl logs -n monitoring alertmanager-kube-prometheus-stack-alertmanager-0`
2. Check Prometheus alerts: http://localhost:9090/alerts
3. Verify Gmail App Password is correct
4. Check Gmail "Less secure app access" settings
