const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user/kent',
    method: 'GET'
};

console.log('测试用户API: /api/user/kent\n');

const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers, null, 2)}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('\n响应内容:');
        try {
            const jsonData = JSON.parse(data);
            console.log(JSON.stringify(jsonData, null, 2));
            
            if (jsonData.success && jsonData.user) {
                console.log('\n=== 用户信息分析 ===');
                console.log(`用户名: ${jsonData.user.username}`);
                console.log(`姓名: ${jsonData.user.name}`);
                console.log(`余额: ${jsonData.user.balance}`);
                console.log(`行程数量: ${jsonData.user.trips ? jsonData.user.trips.length : 0}`);
                
                if (jsonData.user.trips && jsonData.user.trips.length > 0) {
                    console.log('\n=== 行程列表 ===');
                    jsonData.user.trips.forEach((trip, index) => {
                        console.log(`${index + 1}. 车次: ${trip.trainNumber}, 路线: ${trip.route}, 价格: ${trip.price}`);
                    });
                } else {
                    console.log('\n❌ 问题：用户没有行程数据！');
                }
            }
        } catch (e) {
            console.log('响应不是有效的JSON:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`请求出错: ${e.message}`);
});

req.end();
