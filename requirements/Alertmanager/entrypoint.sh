#!/bin/sh
cat << EOF > /alertmanager/alertmanager.yml
global:

route:
  group_wait: 5s
  group_interval: 5s
  repeat_interval: 1h
  receiver: 'discord'

receivers:
  - name: 'discord'
    discord_configs:
      - webhook_url: '${DISCORD_WEBHOOK}'
EOF

exec "$@"
