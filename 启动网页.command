#!/bin/bash
# 双击本文件即可启动《电工技术》三旋翼 PBL 教学平台
cd "$(dirname "$0")" || exit 1

echo ""
echo "  电工技术 · 三旋翼 PBL 智能教学平台"
echo "  ------------------------------------"
echo "  启动完成后，在浏览器打开："
echo "      http://localhost:3100"
echo ""
echo "  关闭服务：在这个窗口按 Control + C"
echo ""

pnpm dev
