const http = require('http');

// 测试API返回格式
function testAPI(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('开始测试API返回格式...\n');

    try {
        // 测试获取所有列车
        console.log('1. 测试获取所有列车 (/api/trains):');
        const trainsResult = await testAPI('GET', '/api/trains');
        console.log('响应格式:', JSON.stringify(trainsResult, null, 2));
        console.log('是否有success字段:', trainsResult.hasOwnProperty('success'));
        console.log('是否有trains字段:', trainsResult.hasOwnProperty('trains'));
        console.log('trains数组长度:', trainsResult.trains ? trainsResult.trains.length : 0);

        // 测试搜索车票
        console.log('\n2. 测试搜索车票 (/api/search):');
        const searchResult = await testAPI('POST', '/api/search', {
            startStation: '北京',
            endStation: '郑州'
        });
        console.log('响应格式:', JSON.stringify(searchResult, null, 2));
        console.log('是否有success字段:', searchResult.hasOwnProperty('success'));
        console.log('是否有trains字段:', searchResult.hasOwnProperty('trains'));
        console.log('trains数组长度:', searchResult.trains ? searchResult.trains.length : 0);

        // 测试获取用户列表
        console.log('\n3. 测试获取用户列表 (/api/admin/users):');
        const usersResult = await testAPI('GET', '/api/admin/users');
        console.log('响应格式:', JSON.stringify(usersResult, null, 2));
        console.log('是否有success字段:', usersResult.hasOwnProperty('success'));
        console.log('是否有users字段:', usersResult.hasOwnProperty('users'));
        console.log('users数组长度:', usersResult.users ? usersResult.users.length : 0);

        // 测试获取停运列车
        console.log('\n4. 测试获取停运列车 (/api/admin/suspended-trains):');
        const suspendedResult = await testAPI('GET', '/api/admin/suspended-trains');
        console.log('响应格式:', JSON.stringify(suspendedResult, null, 2));
        console.log('是否有success字段:', suspendedResult.hasOwnProperty('success'));
        console.log('是否有trains字段:', suspendedResult.hasOwnProperty('trains'));

    } catch (error) {
        console.error('测试出错:', error.message);
        console.log('请确保服务器正在运行 (node server.js)');
    }
}

// 运行测试
runTests();
