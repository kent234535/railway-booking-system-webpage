@echo off
chcp 65001 >nul
echo ===============================================
echo    火车票预订系统 Web版 环境设置与启动脚本
echo ===============================================
echo.

REM 设置Node.js环境变量
set NODE_PATH=D:\newdesktop\desktopfilebodies\nodejs
set PATH=%NODE_PATH%;%PATH%

echo [1/5] 检查Node.js环境...
"%NODE_PATH%\node.exe" --version
if %errorlevel% neq 0 (
    echo.
    echo ❌ 错误: 在指定路径未找到Node.js
    echo 请确认Node.js安装在: %NODE_PATH%
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已找到

REM 检查npm
echo [2/5] 检查npm状态...
"%NODE_PATH%\npm.cmd" --version
if %errorlevel% neq 0 (
    echo ❌ npm未找到
    pause
    exit /b 1
)

echo ✅ npm 可用

REM 进入web目录
echo [3/5] 进入项目目录...
cd /d "%~dp0"
if %errorlevel% neq 0 (
    echo ❌ 无法进入项目目录
    pause
    exit /b 1
)
echo ✅ 当前目录: %CD%

REM 检查data目录
echo [4/5] 检查数据目录...
if not exist "data" (
    echo 创建数据目录...
    mkdir data
)
echo ✅ 数据目录已就绪

REM 检查并安装依赖
echo [5/5] 检查项目依赖...
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖包...
    echo 这可能需要几分钟时间，请耐心等待...
    echo.
    "%NODE_PATH%\npm.cmd" install
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 依赖安装失败
        echo.
        echo 可能的解决方案:
        echo 1. 检查网络连接
        echo 2. 尝试使用国内镜像: npm config set registry https://registry.npmmirror.com
        echo 3. 清除缓存: npm cache clean --force
        echo.
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已存在，跳过安装
)

echo.
echo ===============================================
echo    准备启动服务器...
echo ===============================================
echo.
echo 🚀 正在启动火车票预订系统...
echo 📍 服务器地址: http://localhost:3000
echo 🌐 请在浏览器中访问上述地址
echo.
echo 💡 默认账户:
echo    用户: k / k
echo    管理员: admin / admin123
echo.
echo ⏹️  按 Ctrl+C 停止服务器
echo ===============================================
echo.

REM 启动服务器
"%NODE_PATH%\node.exe" server.js

echo.
echo 服务器已停止
pause
