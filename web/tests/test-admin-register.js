// 测试管理员注册功能
async function testAdminRegister() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('=== 测试管理员注册功能 ===\n');
    
    // 测试1: 错误的验证码
    console.log('1. 测试错误的验证码:');
    try {
        const response1 = await fetch(`${baseUrl}/api/admin/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin1',
                password: 'Admin123456',
                name: '管理员1',
                adminCode: '123456' // 错误的验证码
            }),
        });
        
        const result1 = await response1.json();
        console.log('结果:', result1);
        console.log('预期: 应该失败，提示验证码错误\n');
    } catch (error) {
        console.log('请求错误:', error.message);
    }
    
    // 测试2: 正确的验证码
    console.log('2. 测试正确的验证码:');
    try {
        const response2 = await fetch(`${baseUrl}/api/admin/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin2',
                password: 'Admin123456',
                name: '管理员2',
                adminCode: 'ADMIN2024' // 正确的验证码
            }),
        });
        
        const result2 = await response2.json();
        console.log('结果:', result2);
        console.log('预期: 应该成功注册\n');
    } catch (error) {
        console.log('请求错误:', error.message);
    }
    
    // 测试3: 重复注册
    console.log('3. 测试重复注册:');
    try {
        const response3 = await fetch(`${baseUrl}/api/admin/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin2', // 重复的用户名
                password: 'Admin123456',
                name: '管理员3',
                adminCode: 'ADMIN2024'
            }),
        });
        
        const result3 = await response3.json();
        console.log('结果:', result3);
        console.log('预期: 应该失败，提示用户名已存在\n');
    } catch (error) {
        console.log('请求错误:', error.message);
    }
    
    // 测试4: 测试管理员登录
    console.log('4. 测试管理员登录:');
    try {
        const response4 = await fetch(`${baseUrl}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin2',
                password: 'Admin123456'
            }),
        });
        
        const result4 = await response4.json();
        console.log('结果:', result4);
        console.log('预期: 应该成功登录\n');
    } catch (error) {
        console.log('请求错误:', error.message);
    }
}

// 检查服务器是否运行
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000/api/search?startStation=北京&endStation=上海');
        console.log('服务器状态: 运行中');
        return true;
    } catch (error) {
        console.log('服务器状态: 未运行');
        console.log('请先启动服务器: npm start');
        return false;
    }
}

// 运行测试
async function runTests() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testAdminRegister();
    }
}

runTests();
