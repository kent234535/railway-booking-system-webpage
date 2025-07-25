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
        // 测试管理员注册
        console.log('1. 测试管理员注册:');
        const adminRegResult = await testAPI('POST', '/api/admin/register', {
            username: 'admin_test',
            password: 'Admin123!',
            name: '测试管理员',
            adminCode: '123456'
        });
        console.log('响应格式:', JSON.stringify(adminRegResult, null, 2));

        if (adminRegResult.success) {
            console.log('✅ 管理员注册成功');
            console.log('返回的admin对象:', adminRegResult.admin);
        } else {
            console.log('❌ 管理员注册失败:', adminRegResult.message);
        }

        console.log('\n2. 测试管理员登录:');
        const adminLoginResult = await testAPI('POST', '/api/admin/login', {
            username: 'admin_test',
            password: 'Admin123!'
        });
        console.log('响应格式:', JSON.stringify(adminLoginResult, null, 2));

        if (adminLoginResult.success) {
            console.log('✅ 管理员登录成功');
            console.log('返回的admin对象:', adminLoginResult.admin);
        } else {
            console.log('❌ 管理员登录失败:', adminLoginResult.message);
        }

        console.log('\n3. 测试获取所有用户:');
        const usersResult = await testAPI('GET', '/api/admin/users');
        console.log('响应格式:', JSON.stringify(usersResult, null, 2));

        console.log('\n4. 测试停运列车:');
        const suspendResult = await testAPI('POST', '/api/admin/suspend-train', {
            trainNumber: 'G847'
        });
        console.log('响应格式:', JSON.stringify(suspendResult, null, 2));

        console.log('\n5. 测试获取停运列车:');
        const suspendedTrainsResult = await testAPI('GET', '/api/admin/suspended-trains');
        console.log('响应格式:', JSON.stringify(suspendedTrainsResult, null, 2));

        console.log('\n6. 测试恢复列车:');
        const resumeResult = await testAPI('POST', '/api/admin/resume-train', {
            trainNumber: 'G847'
        });
        console.log('响应格式:', JSON.stringify(resumeResult, null, 2));

        console.log('\n7. 测试封禁用户 (假设有用户"test"):');
        const banResult = await testAPI('POST', '/api/admin/ban-user', {
            username: 'test'
        });
        console.log('响应格式:', JSON.stringify(banResult, null, 2));

        console.log('\n8. 测试解封用户:');
        const unbanResult = await testAPI('POST', '/api/admin/unban-user', {
            username: 'test'
        });
        console.log('响应格式:', JSON.stringify(unbanResult, null, 2));

    } catch (error) {
        console.error('测试出错:', error.message);
    }
}

// 运行测试
runTests();
