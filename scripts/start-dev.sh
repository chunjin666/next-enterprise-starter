#!/bin/bash

set -e

echo "🔍 检查 Caddy 状态..."

# 检查 Caddy 是否在运行
if pgrep -f "caddy run" > /dev/null; then
  echo "✅ Caddy 已在运行"
else
  echo "🚀 启动 Caddy..."
  # 在后台启动 Caddy
  caddy run --config ./Caddyfile &
  # 等待 Caddy 启动
  sleep 2
  echo "✅ Caddy 启动成功"
fi

echo "🚀 启动 Next.js 开发服务器..."
# 启动 Next.js（前台运行）
pnpm dev:next