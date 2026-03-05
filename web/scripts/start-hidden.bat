@echo off
echo 启动火车票预订系统...
cd /d "%~dp0"

:: 安装依赖（如果需要）
if not exist "node_modules" (
    echo 正在安装依赖...
    D:\newdesktop\desktopfilebodies\nodejs\npm.cmd install
)

:: 启动服务器
echo 启动服务器...
start "火车票预订系统服务器" D:\newdesktop\desktopfilebodies\nodejs\node.exe server.js

:: 等待服务器启动
timeout /t 3 /nobreak >nul

:: 打开浏览器
echo 打开浏览器...
start http://localhost:3000

:: 提示用户
echo.
echo 系统已启动，浏览器将自动打开
echo 服务器控制台会在2秒后自动隐藏
echo 要关闭系统，请关闭浏览器或在任务管理器中结束node.exe进程
pause
