#!/bin/sh
cat << EOF > /prometheus/prometheus.yml
global:
  scrape_interval:     5s 
  evaluation_interval: 5s 

  external_labels:
      monitor: 'codelab-monitor'

rule_files:
  - '/etc/prometheus/server-down.rules'

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  - job_name: 'django'
    metrics_path: '/metrics/metrics'
    scheme: 'http'
    static_configs:
      - targets: ['app:8000']
    basic_auth:
      username: '${DJANGO_SUPERUSER_USERNAME}'
      password: '${DJANGO_SUPERUSER_PASSWORD}'
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
      
alerting:
  alertmanagers:
    - static_configs:
      - targets:
        - 'alertmanager:9093'
EOF


exec "$@"