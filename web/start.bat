@echo off
title 火车票预订系统
cd /d "%~dp0"

:: 安装依赖（如果需要）
if not exist "node_modules" (
    echo 正在安装依赖...
    D:\newdesktop\desktopfilebodies\nodejs\npm.cmd install
)

:: 启动服务器
echo 启动火车票预订系统服务器...
echo 服务器将在2秒后自动隐藏控制台窗口
D:\newdesktop\desktopfilebodies\nodejs\node.exe server.js
