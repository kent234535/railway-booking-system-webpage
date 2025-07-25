const Database = require('./database.js');
const db = new Database('./railway.db');

console.log('测试查询逻辑...');

// 先获取所有列车信息
db.getAllTrains((err, trains) => {
    if (err) {
        console.error('获取列车失败:', err);
        return;
    }
    
    console.log('\n所有包含北京和郑州的列车:');
    trains.forEach(train => {
        const hasBeijing = train.stations.includes('北京');
        const hasZhengzhou = train.stations.includes('郑州');
        if (hasBeijing && hasZhengzhou) {
            const beijingIndex = train.stations.indexOf('北京');
            const zhengzhouIndex = train.stations.indexOf('郑州');
            console.log(`${train.trainNumber}: 站点 ${train.stations.join('|')}`);
            console.log(`  北京位置: ${beijingIndex}, 郑州位置: ${zhengzhouIndex}`);
            if (beijingIndex < zhengzhouIndex) {
                console.log('  ✓ 北京到郑州方向');
            } else {
                console.log('  ✗ 郑州到北京方向');
            }
        }
    });

    console.log('\n测试北京到郑州的查询...');
    db.searchTrains('北京', '郑州', (err, results) => {
        if (err) {
            console.error('查询失败:', err);
        } else {
            console.log('查询结果数量:', results.length);
            results.forEach((train, index) => {
                console.log(`${index + 1}. ${train.trainNumber}: ${train.departureTime} -> ${train.arrivalTime}, 价格:${train.price}, 余票:${train.availableSeats}`);
            });
        }
        process.exit(0);
    });
});
