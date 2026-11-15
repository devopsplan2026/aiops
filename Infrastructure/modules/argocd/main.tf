resource "kubernetes_namespace_v1" "argocd" {
  metadata {
    name = "argocd"
  }
}

resource "kubernetes_namespace_v1" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
    helm = {
      source = "hashicorp/helm"
    }
  }
}

resource "helm_release" "argocd" {
  name      = "argocd"
  namespace = kubernetes_namespace_v1.argocd.metadata[0].name

  # Local chart (downloaded with `helm pull`), so no repository/version
  chart = "${path.module}/../../charts/argo-cd-6.7.0.tgz"

  create_namespace = false

  values = [
    yamlencode({
      server = {
        service = {
          type = "ClusterIP"
        }
      }
      configs = {
        params = {
          "server.insecure" = true
        }
      }
    })
  ]
}

resource "helm_release" "monitoring" {
  name      = "kube-prometheus-stack"
  namespace = kubernetes_namespace_v1.monitoring.metadata[0].name

  # Local chart (downloaded with `helm pull`), so no repository/version
  chart = "${path.module}/../../charts/kube-prometheus-stack-56.21.0.tgz"

  timeout          = 900
  create_namespace = false
  wait             = false # don't block Terraform on pod readiness

  values = [
    yamlencode({
      alertmanager = {
        enabled = false # frees pod slots and memory on a small cluster
      }

      grafana = {
        service = {
          type = "ClusterIP"
        }
        resources = {
          requests = { cpu = "100m", memory = "128Mi" }
        }
      }

      prometheus = {
        service = {
          type = "ClusterIP"
        }
        prometheusSpec = {
          retention = "2d"
          resources = {
            requests = { cpu = "200m", memory = "512Mi" }
            limits   = { memory = "1Gi" }
          }
        }
      }
    })
  ]

  depends_on = [
    kubernetes_namespace_v1.monitoring
  ]
}