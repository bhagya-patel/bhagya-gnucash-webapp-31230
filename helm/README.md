# GnuCash App Helm Chart

Kubernetes deployment using Helm charts for the GnuCash Finance Application.

## Prerequisites

- Kubernetes 1.25+
- Helm 3.10+
- kubectl configured to communicate with your cluster

## Quick Start

```bash
# Add the chart repository (if hosted)
helm repo add gnucash https://charts.example.com

# Install to staging
helm install gnucash-staging ./gnucash-app \
  -f gnucash-app/values-staging.yaml \
  -n staging --create-namespace

# Install to production
helm install gnucash-prod ./gnucash-app \
  -n production --create-namespace
```

## Configuration

### Common Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app.replicaCount` | Number of replicas | `3` |
| `app.image.repository` | Image repository | `ghcr.io/your-org/gnucash-app` |
| `app.image.tag` | Image tag | `latest` |
| `app.resources.requests.cpu` | CPU request | `100m` |
| `app.resources.requests.memory` | Memory request | `128Mi` |
| `app.autoscaling.enabled` | Enable HPA | `true` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.hosts[0].host` | Ingress hostname | `app.example.com` |

### Environment-Specific Deployments

```bash
# Staging
helm upgrade --install gnucash-staging ./gnucash-app \
  -f gnucash-app/values.yaml \
  -f gnucash-app/values-staging.yaml \
  -n staging

# Production
helm upgrade --install gnucash-prod ./gnucash-app \
  -f gnucash-app/values.yaml \
  --set app.image.tag=v1.0.0 \
  -n production
```

### Secrets Management

For production, use external secret managers:

```bash
# Create secrets manually
kubectl create secret generic gnucash-app-secrets \
  --from-literal=supabase-db-url='your-db-url' \
  --from-literal=supabase-access-token='your-token' \
  --from-literal=supabase-project-id='your-project-id' \
  -n production
```

## Useful Commands

```bash
# Check deployment status
helm status gnucash-prod -n production

# View release history
helm history gnucash-prod -n production

# Rollback to previous version
helm rollback gnucash-prod 1 -n production

# Uninstall
helm uninstall gnucash-prod -n production

# Dry-run to see generated manifests
helm template gnucash-prod ./gnucash-app -n production

# Lint chart
helm lint ./gnucash-app
```

## Monitoring

The deployment includes Prometheus annotations for scraping metrics:

```yaml
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "80"
  prometheus.io/path: "/metrics"
```

## Troubleshooting

```bash
# Check pod status
kubectl get pods -n production -l app.kubernetes.io/name=gnucash-app

# View pod logs
kubectl logs -n production -l app.kubernetes.io/name=gnucash-app -f

# Describe deployment
kubectl describe deployment gnucash-prod-gnucash-app -n production

# Check HPA
kubectl get hpa -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```
