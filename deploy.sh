#!/bin/bash
# ==============================================
# AI Token UI - 一键部署脚本
# ==============================================
# 使用方法：
#   1. 修改下面的配置
#   2. 执行：bash deploy.sh
# ==============================================

# ============ 配置区（根据你的服务器信息修改）============
SERVER_USER="root"                    # 服务器用户名
SERVER_IP="your-server-ip"            # 服务器 IP 地址
SERVER_PATH="/var/www/ai-token-ui"    # 服务器上存放前端的目录
NGINX_CONF_PATH="/etc/nginx/sites-available/ai-token-ui"  # Nginx 配置文件路径
# ======================================================

set -e  # 遇到错误立即停止

echo "========================================"
echo "  开始部署 AI Token UI"
echo "========================================"

# 第 1 步：安装依赖（如果 node_modules 不存在）
if [ ! -d "node_modules" ]; then
    echo ""
    echo "[1/4] 安装依赖..."
    npm install
else
    echo ""
    echo "[1/4] 依赖已存在，跳过安装"
fi

# 第 2 步：构建生产包
echo ""
echo "[2/4] 构建生产包..."
npm run build

# 第 3 步：上传到服务器
echo ""
echo "[3/4] 上传文件到服务器..."
echo "      目标: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"

# 先创建目录（如果不存在）
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH}"

# 上传构建产物
scp -r dist/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# 首次部署时上传 nginx.conf（后续修改配置只需更新此文件）
scp nginx.conf ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# 第 4 步：部署 Nginx 配置并重载
echo ""
echo "[4/4] 启用站点并重载 Nginx..."
ssh ${SERVER_USER}@${SERVER_IP} "
    # 如果还没有配置过 Nginx，先复制配置文件
    if [ ! -f ${NGINX_CONF_PATH} ]; then
        cp ${SERVER_PATH}/nginx.conf ${NGINX_CONF_PATH}
        ln -sf ${NGINX_CONF_PATH} /etc/nginx/sites-enabled/ai-token-ui
    fi
    nginx -t && nginx -s reload
"

echo ""
echo "========================================"
echo "  部署完成！"
echo "  访问地址: http://${SERVER_IP}"
echo "========================================"
