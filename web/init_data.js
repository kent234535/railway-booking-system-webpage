const Database = require('./database');

console.log('强制重新初始化数据库...');

const db = new Database();

// 等待数据库连接完成
setTimeout(() => {
    console.log('手动插入列车数据...');
    
    // 删除现有列车数据
    db.db.run(`DELETE FROM trains`, (err) => {
        if (err) {
            console.error('删除现有数据失败:', err);
        } else {
            console.log('已清空现有列车数据');
            
            // 插入默认列车数据
            const defaultTrain = {
                trainNumber: "G847",
                stations: ["北京", "石家庄", "郑州", "西安", "成都", "重庆", "贵阳", "昆明"],
                arrivalTimes: ["06:00", "07:24", "09:27", "11:42", "15:19", "16:33", "18:16", "21:27", "21:42", "01:03", "02:46", "04:29", "07:46", "08:43", "10:08", "11:32"],
                seats: [
                    [0, 235, 220, 205, 190, 175, 160, 145],
                    [235, 0, 220, 205, 190, 175, 160, 145],
                    [220, 220, 0, 205, 190, 175, 160, 145],
                    [205, 205, 205, 0, 190, 175, 160, 145],
                    [190, 190, 190, 190, 0, 175, 160, 145],
                    [175, 175, 175, 175, 175, 0, 160, 145],
                    [160, 160, 160, 160, 160, 160, 0, 145],
                    [145, 145, 145, 145, 145, 145, 145, 0]
                ],
                prices: [
                    [0, 140, 346, 571, 900, 1023, 1195, 1514],
                    [140, 0, 206, 431, 760, 883, 1055, 1374],
                    [346, 206, 0, 225, 554, 677, 849, 1168],
                    [571, 431, 225, 0, 329, 452, 624, 943],
                    [900, 760, 554, 329, 0, 123, 295, 614],
                    [1023, 883, 677, 452, 123, 0, 172, 491],
                    [1195, 1055, 849, 624, 295, 172, 0, 319],
                    [1514, 1374, 1168, 943, 614, 491, 319, 0]
                ]
            };

            const insertSql = `INSERT INTO trains (trainNumber, stations, arrivalTimes, seats, prices) VALUES (?, ?, ?, ?, ?)`;
            
            db.db.run(insertSql, [
                defaultTrain.trainNumber,
                JSON.stringify(defaultTrain.stations),
                JSON.stringify(defaultTrain.arrivalTimes),
                JSON.stringify(defaultTrain.seats),
                JSON.stringify(defaultTrain.prices)
            ], function(err) {
                if (err) {
                    console.error('插入列车数据失败:', err);
                } else {
                    console.log('成功插入列车数据:', defaultTrain.trainNumber);
                    
                    // 验证数据
                    db.getAllTrains((err, trains) => {
                        if (err) {
                            console.error('验证失败:', err);
                        } else {
                            console.log('数据库中现有列车数量:', trains.length);
                            if (trains.length > 0) {
                                console.log('第一个列车:', trains[0].trainNumber);
                                console.log('站点:', trains[0].stations);
                            }
                        }
                        process.exit(0);
                    });
                }
            });
        }
    });
}, 2000);
