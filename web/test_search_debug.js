const Database = require('./database');

// 创建数据库实例
const db = new Database();

// 等待数据库初始化
setTimeout(() => {
    console.log('开始测试数据库查询功能...');
    
    // 测试查询函数
    db.searchTrains('北京', '上海', (err, results) => {
        if (err) {
            console.error('查询失败:', err);
        } else {
            console.log('查询成功，结果数量:', results.length);
            console.log('详细结果:', JSON.stringify(results, null, 2));
        }
        
        // 测试获取所有列车
        db.getAllTrains((err, trains) => {
            if (err) {
                console.error('获取列车失败:', err);
            } else {
                console.log('数据库中共有', trains.length, '趟列车');
                if (trains.length > 0) {
                    console.log('第一趟列车信息:', JSON.stringify(trains[0], null, 2));
                }
            }
            process.exit(0);
        });
    });
}, 3000);
