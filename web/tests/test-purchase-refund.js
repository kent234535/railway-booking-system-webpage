const Database = require('./database');

console.log('测试购票和退票的双向匹配功能...\n');

const db = new Database();

// 测试函数
function testPurchaseAndRefund() {
    console.log('=== 测试购票和退票 ===');
    
    // 先查询郑州到北京的车票余量
    console.log('1. 查询购票前的余票情况:');
    db.searchTrains('郑州', '北京', (err, results1) => {
        if (err) {
            console.error('查询错误:', err);
            return;
        }
        
        const train = results1.find(t => t.trainNumber === 'G847');
        if (!train) {
            console.log('未找到G847车次');
            return;
        }
        
        console.log(`G847 郑州->北京 余票: ${train.availableSeats}, 价格: ${train.price}`);
        const originalSeats = train.availableSeats;
        
        // 购买一张票
        console.log('\n2. 购买一张郑州到北京的G847车票...');
        db.purchaseTicket('user1', 'G847', '郑州', '北京', (err, ticket) => {
            if (err) {
                console.error('购票错误:', err);
                return;
            }
            
            console.log('购票成功:', ticket);
            
            // 再次查询余票
            console.log('\n3. 查询购票后的余票情况:');
            db.searchTrains('郑州', '北京', (err, results2) => {
                if (err) {
                    console.error('查询错误:', err);
                    return;
                }
                
                const trainAfter = results2.find(t => t.trainNumber === 'G847');
                console.log(`G847 郑州->北京 余票: ${trainAfter.availableSeats}, 变化: ${trainAfter.availableSeats - originalSeats}`);
                
                // 验证双向查询结果一致
                console.log('\n4. 验证北京到郑州方向的余票是否一致:');
                db.searchTrains('北京', '郑州', (err, results3) => {
                    if (err) {
                        console.error('查询错误:', err);
                        return;
                    }
                    
                    const trainReverse = results3.find(t => t.trainNumber === 'G847');
                    console.log(`G847 北京->郑州 余票: ${trainReverse.availableSeats}`);
                    console.log(`双向查询余票是否一致: ${trainAfter.availableSeats === trainReverse.availableSeats ? '是' : '否'}`);
                    
                    // 退票
                    console.log('\n5. 退票...');
                    db.refundTicket('user1', ticket.id, (err, refund) => {
                        if (err) {
                            console.error('退票错误:', err);
                            return;
                        }
                        
                        console.log('退票成功:', refund);
                        
                        // 再次查询余票
                        console.log('\n6. 查询退票后的余票情况:');
                        db.searchTrains('郑州', '北京', (err, results4) => {
                            if (err) {
                                console.error('查询错误:', err);
                                return;
                            }
                            
                            const trainFinal = results4.find(t => t.trainNumber === 'G847');
                            console.log(`G847 郑州->北京 余票: ${trainFinal.availableSeats}, 变化: ${trainFinal.availableSeats - originalSeats}`);
                            
                            // 验证余票恢复
                            if (trainFinal.availableSeats === originalSeats) {
                                console.log('✅ 余票已正确恢复！');
                            } else {
                                console.log('❌ 余票恢复有问题！');
                            }
                            
                            // 关闭数据库连接
                            db.close();
                        });
                    });
                });
            });
        });
    });
}

// 运行测试
testPurchaseAndRefund();
