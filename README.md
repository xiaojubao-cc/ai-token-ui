┌──────────────────┬─────────┬──────────────────────────────────────────┐
│       文件       │  操作   │                   说明                   │
├──────────────────┼─────────┼──────────────────────────────────────────┤
│ .env.production  │ 新增    │ 生产环境 API 地址，一个变量搞定          │
├──────────────────┼─────────┼──────────────────────────────────────────┤
│ env.d.ts         │ 修改    │ 加一行类型声明，编辑器有提示             │
├──────────────────┼─────────┼──────────────────────────────────────────┤
│ src/api/index.ts │ 改 1 行 │ baseURL 从环境变量读取                   │
├──────────────────┼─────────┼──────────────────────────────────────────┤
│ nginx.conf       │ 修改    │ 最简配置，带注释说明每行作用             │
├──────────────────┼─────────┼──────────────────────────────────────────┤
│ deploy.sh        │ 新增    │ 一键部署脚本（构建 + 上传 + 重载 Nginx） │
└──────────────────┴─────────┴──────────────────────────────────────────┘

部署流程就 3 步

1. 本地执行   npm run build       → 生成 dist/ 目录
2. 上传到服务器 scp dist/ → /var/www/ai-token-ui/
3. 服务器执行   sudo nginx -s reload

deploy.sh 脚本把后面两步自动完成，之后改完代码只需跑 bash deploy.sh 一行命令。

  ---
确认的话我直接改代码？

✻ Brewed for 16s

❯ 确认

● Write(.env.production)
⎿  Wrote 4 lines to .env.production
1 # 后端 API 地址
2 # 如果前后端部署在同一台服务器，Nginx 代理转发，填 /api 即可
3 # 如果后端独立部署，填完整地址，例如 https://api.your-domain.com
4 VITE_API_BASE_URL=/api

● Write(.env.development)
⎿  Wrote 2 lines to .env.development
1 # 开发环境 API 地址，Vite 代理到本地后端
2 VITE_API_BASE_URL=/api

● Write(env.d.ts)
⎿  Added 8 lines
1  /// <reference types="vite/client" />
2 +                                                                                                                                                                                                                        
3 +interface ImportMetaEnv {                                                                                                                                                                                               
4 +  readonly VITE_API_BASE_URL: string                                                                                                                                                                                    
5 +}                                                                                                                                                                                                                       
6 +                                                                                                                                                                                                                        
7 +interface ImportMeta {                                                                                                                                                                                                  
8 +  readonly env: ImportMetaEnv                                                                                                                                                                                           
9 +}

● Update(src\api\index.ts)
⎿  Added 1 line, removed 1 line
2  import { ElMessage } from 'element-plus'
3  
4  const http = axios.create({
5 -  baseURL: '/api',                                                                                                                                                                                                      
5 +  baseURL: import.meta.env.VITE_API_BASE_URL,                                                                                                                                                                           
6    withCredentials: true,
7    timeout: 10000,
8  })

● Write(nginx.conf)
⎿  Added 26 lines, removed 17 lines
1 +# ==============================================                                                                                                                                                                       
2 +# AI Token UI - Nginx 配置文件                                     @                                                                                                                                                    
3 +# ==============================================                                                                                                                                                                       
4 +# 使用方法：                                                                                                                                                                                                           
5 +#   1. 复制此文件到服务器： sudo vi /etc/nginx/conf.d/ai-token-ui.conf                                                                                                                                                     
6 +#   2. 创建软链接启用：   将一下文件复制到该conf中                                                                                                           
7 +#   3. 测试配置：        sudo nginx -t                                                                                                                                                                                 
8 +#   4. 重载 Nginx：       sudo nginx -s reload                                                                                                                                                                         
9 +# ==============================================                                                                                                                                                                       
10 +                                                                                                                                                                                                                       
11  server {
12 +    # 监听 80 端口（HTTP）                                                                                                                                                                                             
13      listen 80 default_server;
3 -     server_name _;  # 替换为你的域名或 IP                                                                                                                                                                
14 +    # 改为你的域名或服务器 IP                                                                                                                                                                                          
15 +    server_name your-domain.com;                                                                                                                                                                                       
16  
5 -    # 前端静态文件目录                                                                                                                                                                                                 
17 +    # 前端文件存放目录                                                                                                                                                                                                 
18      root /var/www/ai-token-ui;
19      index index.html;
20  
9 -    # Gzip 压缩                                                                                                                                                                                                        
21 +    # ---------- Gzip 压缩，让页面加载更快 ----------                                                                                                                                                                  
22      gzip on;
23      gzip_min_length 1000;
24      gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
25  
14 -    # 静态资源（带 hash，可长期缓存）                                                                                                                                                                                  
26 +    # ---------- JS/CSS 文件（文件名带 hash，可以长期缓存）----------                                                                                                                                                  
27      location /assets/ {
28          expires 1y;
29          add_header Cache-Control "public, immutable";
30      }
31  
20 -    # favicon                                                                                                                                                                                                          
21 -    location = /favicon.ico {                                                                                                                                                                                          
22 -        expires 1y;                                                                                                                                                                                                    
23 -        add_header Cache-Control "public";                                                                                                                                                                             
24 -    }                                                                                                                                                                                                                  
25 -                                                                                                                                                                                                                       
26 -    # API 反向代理到后端 Java 服务                                                                                                                                                                                     
32 +    # ---------- 后端 API 转发 ----------                                                                                                                                                                              
33 +    # 所有 /api/xxx 请求转发到后端 Java 服务                                                                                                                                                                           
34      location /api/ {
35 +        # 改为你的后端服务地址                                                                                                                                                                                         
36          proxy_pass http://127.0.0.1:8080;
37 +                                                                                                                                                                                                                       
38 +        # 把客户端真实 IP 传给后端                                                                                                                                                                                     
39          proxy_set_header Host $host;
40          proxy_set_header X-Real-IP $remote_addr;
41          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
42          proxy_set_header X-Forwarded-Proto $scheme;
43 +                                                                                                                                                                                                                       
44 +        # 超时时间 60 秒                                                                                                                                                                                               
45          proxy_read_timeout 60s;
46      }
47  
36 -    # SPA 路由 fallback：所有非文件请求返回 index.html                                                                                                                                                                 
48 +    # ---------- 前端路由（SPA 模式）----------                                                                                                                                                                        
49 +    # Vue Router 使用 HTML5 History 模式，直接访问 /admin/dashboard 时                                                                                                                                                 
50 +    # 服务器上没有这个文件，需要返回 index.html 让前端处理路由                                                                                                                                                         
51      location / {
52          try_files $uri $uri/ /index.html;
53      }
40 -                                                                                                                                                                                                                       
41 -    # 安全头                                                                                                                                                                                                           
42 -    add_header X-Frame-Options "SAMEORIGIN" always;                                                                                                                                                                    
43 -    add_header X-Content-Type-Options "nosniff" always;                                                                                                                                                                
44 -    add_header X-XSS-Protection "1; mode=block" always;                                                                                                                                                                
54  }

● Write(deploy.sh)
⎿  Wrote 65 lines to deploy.sh
1 #!/bin/bash
2 # ==============================================
3 # AI Token UI - 一键部署脚本
4 # ==============================================
5 # 使用方法：
6 #   1. 修改下面的配置
7 #   2. 执行：bash deploy.sh
8 # ==============================================
9
10 # ============ 配置区（根据你的服务器信息修改）============
… +55 lines (ctrl+o to expand)

● 需要修复一下 deploy.sh —— 首次部署时 nginx.conf 也需要上传到服务器。

● Update(deploy.sh)
⎿  Added 5 lines, removed 2 lines
43  # 先创建目录（如果不存在）
44  ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH}"
45  
46 -# 上传 dist 目录内容                                                                                                                                                                                                   
46 +# 上传构建产物                                                                                                                                                                                                         
47  scp -r dist/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/
48  
49 +# 首次部署时上传 nginx.conf（后续修改配置只需更新此文件）                                                                                                                                                              
50 +scp nginx.conf ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/                                                                                                                                                             
51 +                                                                                                                                                                                                                       
52  # 第 4 步：部署 Nginx 配置并重载
53  echo ""
51 -echo "[4/4] 重载 Nginx..."                                                                                                                                                                                             
54 +echo "[4/4] 启用站点并重载 Nginx..."                                                                                                                                                                                   
55  ssh ${SERVER_USER}@${SERVER_IP} "
56      # 如果还没有配置过 Nginx，先复制配置文件
57      if [ ! -f ${NGINX_CONF_PATH} ]; then

● 完成。下面是所有改动汇总：

  ---
改动汇总

新增 3 个文件

┌──────────────────┬───────────────────────────────────────────────┐
│       文件       │                     作用                      │
├──────────────────┼───────────────────────────────────────────────┤
│ .env.production  │ 生产环境 API 地址配置，目前默认 /api          │
├──────────────────┼───────────────────────────────────────────────┤
│ .env.development │ 开发环境配置，与生产一致                      │
├──────────────────┼───────────────────────────────────────────────┤
│ deploy.sh        │ 一键部署脚本，构建 → 上传 → 重载 Nginx 全自动 │
└──────────────────┴───────────────────────────────────────────────┘

修改 3 个文件

┌────────────────────┬────────────────────────────────────────────────────────────────────┐
│        文件        │                                改动                                │
├────────────────────┼────────────────────────────────────────────────────────────────────┤
│ env.d.ts           │ 添加 VITE_API_BASE_URL 类型声明，写代码时有智能提示                │
├────────────────────┼────────────────────────────────────────────────────────────────────┤
│ src/api/index.ts:5 │ baseURL 从硬编码改为读取环境变量 import.meta.env.VITE_API_BASE_URL │
├────────────────────┼────────────────────────────────────────────────────────────────────┤
│ nginx.conf         │ 重写为带中文注释的简化版，每个配置块都说明作用                     │
└────────────────────┴────────────────────────────────────────────────────────────────────┘

  ---
使用步骤

服务器上（只需做一次）：

# 安装 Nginx
sudo apt install nginx    # Ubuntu/Debian
# 或
sudo yum install nginx    # CentOS/RHEL

# 创建前端文件目录
sudo mkdir -p /var/www/ai-token-ui

本地每次部署：

# 1. 修改 deploy.sh 顶部的服务器信息
#    SERVER_IP="你的服务器IP"
#    SERVER_USER="你的用户名"

# 2. 一行命令完成部署
bash deploy.sh

deploy.sh 会自动完成：安装依赖 → 构建 → 上传文件 → 配置 Nginx → 重载生效。改完代码跑一下就行。