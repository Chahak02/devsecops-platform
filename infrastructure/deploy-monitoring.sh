#!/bin/bash
set -e

echo " Starting Local Monitoring Deployment (Prometheus + Grafana)..."

# 1. Download and install a portable Helm binary (if not present)
if ! command -v helm &> /dev/null; then
    echo " Helm not found. Downloading portable Helm binary..."
    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
    chmod 700 get_helm.sh
    # Install helm to /usr/local/bin (requires sudo) or locally
    # Since this might be run on Mac, we will install it to a local bin folder to avoid sudo prompts
    mkdir -p ./bin
    HELM_INSTALL_DIR=./bin ./get_helm.sh --no-sudo
    export PATH="$PWD/bin:$PATH"
    echo " Helm installed locally."
else
    echo " Helm is already installed."
fi

# 2. Create the monitoring namespace
echo "🏗️ Creating 'monitoring' namespace in Kubernetes..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# 3. Add Prometheus Helm Repository
echo " Adding Prometheus Community Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 4. Deploy the kube-prometheus-stack
echo "⚙️ Deploying Prometheus and Grafana (This may take a minute)..."
# We inject custom values to allow Grafana to be embedded in an iframe without a login screen!
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.grafana\.ini.security.allow_embedding=true \
  --set grafana.grafana\.ini.auth\.anonymous.enabled=true \
  --set grafana.grafana\.ini.auth\.anonymous.org_role=Admin \
  --set grafana.adminPassword=admin

echo " Deployment initiated successfully!"
echo ""
echo "========================================================="
echo "To access your Grafana Dashboard locally, run this command in a NEW terminal tab:"
echo "kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring"
echo "========================================================="
