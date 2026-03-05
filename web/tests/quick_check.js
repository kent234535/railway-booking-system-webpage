const Database = require('./database');

console.log('开始数据库检查...');

// 创建数据库实例
const db = new Database();

// 等待3秒确保数据库初始化完成
setTimeout(() => {
    console.log('3秒后开始检查...');
    
    // 检查列车数量
    db.db.get("SELECT COUNT(*) as count FROM trains", (err, row) => {
        if (err) {
            console.error('查询失败:', err);
            process.exit(1);
        }
        
        console.log('数据库中的列车数量:', row.count);
        
        if (row.count === 0) {
            console.log('❌ 数据库中没有列车数据！这是问题所在。');
            console.log('需要运行 import_trains.js 导入数据');
            process.exit(0);
        }
        
        // 如果有数据，测试查询功能
        console.log('✅ 数据库中有列车数据，测试查询功能...');
        
        // 测试北京到上海的查询
        db.searchTrains('北京', '上海', (err, results) => {
            if (err) {
                console.error('❌ 查询失败:', err);
            } else {
                console.log('✅ 查询成功！北京到上海的结果数量:', results.length);
                if (results.length > 0) {
                    console.log('查询结果详情:', JSON.stringify(results, null, 2));
                } else {
                    console.log('⚠️ 查询结果为空，可能是站点名称不匹配');
                }
            }
            process.exit(0);
        });
    });
}, 3000);

console.log('正在等待数据库初始化...');
