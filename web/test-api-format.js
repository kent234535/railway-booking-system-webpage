console.log('开始测试Web服务器...');

// 先启动服务器
const { spawn } = require('child_process');
const path = require('path');

const serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname),
    stdio: 'inherit'
});

// 等待几秒让服务器启动
setTimeout(async () => {
    console.log('开始测试API...');
    
    try {
        // 测试获取用户信息API
        const userResponse = await fetch('http://localhost:3000/api/user/kent');
        const userData = await userResponse.json();
        
        console.log('用户API响应:', userData);
        
        if (userData.success && userData.user) {
            console.log('✓ 用户API格式正确');
            console.log('用户行程数量:', userData.user.trips ? userData.user.trips.length : 0);
        } else {
            console.log('✗ 用户API格式错误');
        }
        
        // 测试管理员获取用户列表API
        const usersResponse = await fetch('http://localhost:3000/api/admin/users');
        const usersData = await usersResponse.json();
        
        console.log('管理员用户列表API响应:', usersData);
        
        if (usersData.success && usersData.users) {
            console.log('✓ 管理员用户列表API格式正确');
        } else {
            console.log('✗ 管理员用户列表API格式错误');
        }
        
        // 测试停运列车API
        const suspendedResponse = await fetch('http://localhost:3000/api/admin/suspended-trains');
        const suspendedData = await suspendedResponse.json();
        
        console.log('停运列车API响应:', suspendedData);
        
        if (suspendedData.success && Array.isArray(suspendedData.trains)) {
            console.log('✓ 停运列车API格式正确');
        } else {
            console.log('✗ 停运列车API格式错误');
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    } finally {
        // 停止服务器
        serverProcess.kill();
        console.log('测试完成，服务器已停止');
        process.exit(0);
    }
}, 3000);
