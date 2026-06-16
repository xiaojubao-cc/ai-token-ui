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
echo "[4/4] 部署站点并重载 Nginx..."
ssh ${SERVER_USER}@${SERVER_IP} bash <<'REMOTE'

    # ---- 自动检测 Nginx 配置目录（兼容不同 Linux 发行版）----
    if [ -d /etc/nginx/sites-available ] && [ -d /etc/nginx/sites-enabled ]; then
        # Ubuntu / Debian 风格
        NGINX_CONF="/etc/nginx/sites-available/ai-token-ui"
        ENABLE_CMD="ln -sf $NGINX_CONF /etc/nginx/sites-enabled/ai-token-ui"
        DEFAULT_SERVER="/etc/nginx/sites-enabled/default"
    elif [ -d /etc/nginx/conf.d ]; then
        # CentOS / RHEL / Fedora 风格
        NGINX_CONF="/etc/nginx/conf.d/ai-token-ui.conf"
        ENABLE_CMD=":"
        DEFAULT_SERVER="/etc/nginx/conf.d/default.conf"
    else
        echo "错误：无法识别 Nginx 配置目录结构"
        echo "请手动将 nginx.conf 放入 Nginx 配置目录并重载"
        exit 1
    fi

    echo "检测到 Nginx 配置目录: $(dirname $NGINX_CONF)"

    # 停用默认站点（避免和我们配置的 80 端口冲突）
    if [ -f "$DEFAULT_SERVER" ]; then
        # 通过重命名来禁用（加上 .disabled 后缀）
        if [ -f "${DEFAULT_SERVER}" ]; then
            mv "$DEFAULT_SERVER" "${DEFAULT_SERVER}.disabled" 2>/dev/null || true
            echo "已禁用默认站点: ${DEFAULT_SERVER}.disabled"
        fi
    fi

    # 复制配置文件
    cp ${SERVER_PATH}/nginx.conf ${NGINX_CONF}
    echo "配置文件已写入: ${NGINX_CONF}"

    # 启用站点
    ${ENABLE_CMD}

    # 检查配置并重载
    echo ""
    nginx -t && nginx -s reload
REMOTE

echo ""
echo "========================================"
echo "  部署完成！"
echo "  访问地址: http://${SERVER_IP}"
echo "========================================"