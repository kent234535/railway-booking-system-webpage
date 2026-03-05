const Database = require('./database');
const fs = require('fs');
const path = require('path');

console.log('从 new_trains.txt 导入车次数据...');

const db = new Database();

// 等待数据库连接完成
setTimeout(() => {
    const trainFilePath = path.join(__dirname, '..', 'new_trains.txt');
    
    if (!fs.existsSync(trainFilePath)) {
        console.error('找不到 new_trains.txt 文件');
        process.exit(1);
    }
    
    try {
        const data = fs.readFileSync(trainFilePath, 'utf8');
        const lines = data.trim().split('\n');
        
        console.log(`文件包含 ${lines.length} 行数据`);
        
        // 清空现有列车数据
        db.db.run(`DELETE FROM trains`, (err) => {
            if (err) {
                console.error('清空现有数据失败:', err);
                process.exit(1);
            }
            
            console.log('已清空现有列车数据');
            let processedCount = 0;
            let totalCount = 0;
            
            // 处理每一行数据
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                totalCount++;
                console.log(`处理第 ${i+1} 行: ${line.substring(0, 50)}...`);
                
                const parts = line.split(',');
                if (parts.length < 5) {
                    console.log(`第 ${i+1} 行数据格式错误，部分数：${parts.length}`);
                    continue;
                }
                
                const trainNumber = parts[0].trim();
                const stations = parts[1].split('|').map(s => s.trim());
                const arrivalTimes = parts[2].split('|').map(t => t.trim());
                
                console.log(`车次 ${trainNumber}: 站点数=${stations.length}, 时间数=${arrivalTimes.length}`);
                
                // 解析余票矩阵
                const seatRows = parts[3].split('|');
                const seats = [];
                for (const row of seatRows) {
                    const seatValues = row.split(';').map(v => parseInt(v.trim()) || 0);
                    seats.push(seatValues);
                }
                
                // 解析票价矩阵
                const priceRows = parts[4].split('|');
                const prices = [];
                for (const row of priceRows) {
                    const priceValues = row.split(';').map(v => parseInt(v.trim()) || 0);
                    prices.push(priceValues);
                }
                
                console.log(`座位矩阵大小: ${seats.length}x${seats[0] ? seats[0].length : 0}`);
                console.log(`价格矩阵大小: ${prices.length}x${prices[0] ? prices[0].length : 0}`);
                
                // 验证数据完整性
                if (seats.length !== stations.length || prices.length !== stations.length) {
                    console.log(`车次 ${trainNumber} 数据不完整，跳过`);
                    continue;
                }
                
                // 插入数据库
                const insertSql = `INSERT INTO trains (trainNumber, stations, arrivalTimes, seats, prices) VALUES (?, ?, ?, ?, ?)`;
                
                db.db.run(insertSql, [
                    trainNumber,
                    JSON.stringify(stations),
                    JSON.stringify(arrivalTimes),
                    JSON.stringify(seats),
                    JSON.stringify(prices)
                ], function(err) {
                    if (err) {
                        console.error(`插入车次 ${trainNumber} 失败:`, err);
                    } else {
                        processedCount++;
                        console.log(`✓ 成功导入车次: ${trainNumber}，站点数: ${stations.length}`);
                        
                        // 检查是否全部处理完成
                        if (processedCount === totalCount || processedCount >= lines.length - 1) {
                            console.log(`\n导入完成！总共处理了 ${processedCount} 个车次`);
                            
                            // 验证导入结果
                            db.getAllTrains((err, trains) => {
                                if (err) {
                                    console.error('验证失败:', err);
                                } else {
                                    console.log(`数据库中现有列车数量: ${trains.length}`);
                                    trains.forEach(train => {
                                        console.log(`- ${train.trainNumber}: ${train.stations[0]} -> ${train.stations[train.stations.length-1]}`);
                                    });
                                }
                                process.exit(0);
                            });
                        }
                    }
                });
            }
            
            if (totalCount === 0) {
                console.log('没有找到有效的列车数据');
                process.exit(0);
            }
        });
        
    } catch (error) {
        console.error('读取文件时出错:', error);
        process.exit(1);
    }
}, 2000);
