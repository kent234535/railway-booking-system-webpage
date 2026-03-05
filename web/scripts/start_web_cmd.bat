@echo off
chcp 65001 >nul
title 火车票预订系统 Web版
color 0b
cls

echo ==========================================
echo   火车票预订系统 Web版 (CMD版本)
echo ==========================================
echo.
echo 正在启动服务器...
echo.

set NODE_PATH=D:\newdesktop\desktopfilebodies\nodejs
set PROJECT_PATH=%~dp0

REM 检查Node.js
if not exist "%NODE_PATH%\node.exe" (
    color 0c
    echo 错误: 在路径 %NODE_PATH% 中未找到 node.exe
    echo 请确认Node.js安装路径正确
    pause
    exit /b 1
)

REM 检查项目目录
if not exist "%PROJECT_PATH%\server.js" (
    color 0c
    echo 错误: 服务器文件 %PROJECT_PATH%\server.js 不存在
    pause
    exit /b 1
)

REM 安装依赖
if not exist "%PROJECT_PATH%\node_modules" (
    echo 正在安装依赖包，请稍候...
    "%NODE_PATH%\npm.cmd" install
    if %errorlevel% neq 0 (
        color 0c
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 启动服务器
cls
color 0a
echo ==========================================
echo   火车票预订系统 Web版 - 服务器已启动
echo ==========================================
echo.
echo 服务器地址: http://localhost:3000
echo.
echo 默认账户:
echo  - 用户: k / k
echo  - 管理员: admin / admin123
echo.
echo 按 Ctrl+C 停止服务器
echo ==========================================
echo.

REM 启动浏览器
start http://localhost:3000

REM 启动服务器（不隐藏控制台）
"%NODE_PATH%\node.exe" server.js

echo.
echo 服务器已停止
pause
