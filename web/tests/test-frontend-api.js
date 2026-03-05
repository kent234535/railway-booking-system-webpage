// 测试前端API调用格式
async function testAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/user/kent');
        const data = await response.json();
        
        console.log('API响应数据结构:');
        console.log(JSON.stringify(data, null, 2));
        
        // 检查前端期望的数据结构
        console.log('\n前端访问方式检查:');
        console.log('data.trips:', data.trips);
        console.log('data.user:', data.user);
        console.log('data.user.trips:', data.user ? data.user.trips : 'data.user 不存在');
        
        if (data.success && data.user) {
            console.log('\n正确的访问方式应该是:');
            console.log('行程数量:', data.user.trips ? data.user.trips.length : 0);
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

testAPI();
