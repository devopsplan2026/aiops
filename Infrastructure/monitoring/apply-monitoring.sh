#!/bin/bash

# Script to deploy/update Prometheus monitoring stack with Gmail alerting
# Location: Infrastructure/monitoring/apply-monitoring.sh

set -e

NAMESPACE="monitoring"
RELEASE_NAME="kube-prometheus-stack"
VALUES_FILE="prometheus-stack-values.yaml"

echo "🚀 Deploying Prometheus Monitoring Stack with Alerting..."

# Check if values file exists
if [ ! -f "$VALUES_FILE" ]; then
    echo "❌ Error: $VALUES_FILE not found!"
    echo "Please ensure you are in the Infrastructure/monitoring directory"
    exit 1
fi

# Add Helm repo if not exists
echo "📦 Adding Prometheus Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo update

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "📁 Creating namespace: $NAMESPACE"
    kubectl create namespace $NAMESPACE
fi

# Check if release exists
if helm list -n $NAMESPACE | grep -q $RELEASE_NAME; then
    echo "🔄 Upgrading existing release: $RELEASE_NAME"
    helm upgrade $RELEASE_NAME \
        prometheus-community/kube-prometheus-stack \
        -n $NAMESPACE \
        -f $VALUES_FILE
else
    echo "📦 Installing new release: $RELEASE_NAME"
    helm install $RELEASE_NAME \
        prometheus-community/kube-prometheus-stack \
        -n $NAMESPACE \
        -f $VALUES_FILE
fi

echo ""
echo "✅ Monitoring stack deployed successfully!"
echo ""
echo "📊 Access your dashboards:"
echo ""
echo "Prometheus (Alerts & Metrics):"
echo "  kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090"
echo "  Then open: http://localhost:9090"
echo ""
echo "Alertmanager (Email Configuration):"
echo "  kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093"
echo "  Then open: http://localhost:9093"
echo ""
echo "Grafana (Dashboards):"
echo "  kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80"
echo "  Then open: http://localhost:3000"
echo "  Username: admin"
echo "  Password: kubectl get secret -n monitoring kube-prometheus-stack-grafana -o jsonpath=\"{.data.admin-password}\" | base64 --decode"
echo ""
echo "🧪 Test alerts:"
echo "  kubectl run test-alert --image=nonexistent:tag -n boutique"
echo "  (Wait 2 minutes for email, then: kubectl delete pod test-alert -n boutique)"
echo ""
