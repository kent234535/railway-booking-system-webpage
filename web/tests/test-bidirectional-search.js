const Database = require('./database');

console.log('测试双向查询功能...\n');

const db = new Database();

// 测试函数
function testBidirectionalSearch() {
    console.log('=== 测试1: 北京到郑州 ===');
    db.searchTrains('北京', '郑州', (err, results) => {
        if (err) {
            console.error('查询错误:', err);
            return;
        }
        console.log(`找到 ${results.length} 个结果:`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.trainNumber}: ${result.startStation} -> ${result.endStation}, 价格: ${result.price}, 余票: ${result.availableSeats}`);
        });
        
        console.log('\n=== 测试2: 郑州到北京 ===');
        db.searchTrains('郑州', '北京', (err, results2) => {
            if (err) {
                console.error('查询错误:', err);
                return;
            }
            console.log(`找到 ${results2.length} 个结果:`);
            results2.forEach((result, index) => {
                console.log(`${index + 1}. ${result.trainNumber}: ${result.startStation} -> ${result.endStation}, 价格: ${result.price}, 余票: ${result.availableSeats}`);
            });
            
            console.log('\n=== 测试3: 上海到南京 ===');
            db.searchTrains('上海', '南京', (err, results3) => {
                if (err) {
                    console.error('查询错误:', err);
                    return;
                }
                console.log(`找到 ${results3.length} 个结果:`);
                results3.forEach((result, index) => {
                    console.log(`${index + 1}. ${result.trainNumber}: ${result.startStation} -> ${result.endStation}, 价格: ${result.price}, 余票: ${result.availableSeats}`);
                });
                
                console.log('\n=== 测试4: 南京到上海 ===');
                db.searchTrains('南京', '上海', (err, results4) => {
                    if (err) {
                        console.error('查询错误:', err);
                        return;
                    }
                    console.log(`找到 ${results4.length} 个结果:`);
                    results4.forEach((result, index) => {
                        console.log(`${index + 1}. ${result.trainNumber}: ${result.startStation} -> ${result.endStation}, 价格: ${result.price}, 余票: ${result.availableSeats}`);
                    });
                    
                    // 关闭数据库连接
                    db.close();
                });
            });
        });
    });
}

// 运行测试
testBidirectionalSearch();
