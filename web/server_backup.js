const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('./database');

const app = express();
const PORT = 3000;
const db = new Database();

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 用户注册
app.post('/api/register', async (req, res) => {
    const { username, password, name, idNumber } = req.body;
    
    // 密码格式验证
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.json({ 
            success: false, 
            message: '密码格式不符合要求：不少于8位，必须包含数字、大写字母和小写字母' 
        });
    }
    
    // 身份证号格式验证
    const idRegex = /^[0-9A-Za-z]{18}$/;
    if (!idRegex.test(idNumber)) {
        return res.json({ 
            success: false, 
            message: '身份证号格式不正确：必须为18位字符（数字或字母）' 
        });
    }
    
    try {
        // 检查用户名是否已存在
        const existingUser = await db.getUserByUsername(username);
        if (existingUser) {
            return res.json({ success: false, message: '用户名已存在' });
        }
        
        // 创建新用户
        await db.createUser({ username, password, name, idNumber });
        res.json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('注册失败:', error);
        res.json({ success: false, message: '注册失败' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await db.getUserByUsername(username);
        if (user && user.password === password) {
            // 检查用户是否被封禁
            if (user.banned) {
                return res.json({ success: false, message: '账号已被封禁，请联系管理员' });
            }
            
            // 获取用户行程
            const trips = await db.getUserTrips(username);
            const userResponse = { 
                ...user, 
                password: undefined,
                trips: trips 
            };
            res.json({ success: true, user: userResponse });
        } else {
            res.json({ success: false, message: '用户名或密码错误' });
        }
    } catch (error) {
        console.error('登录失败:', error);
        res.json({ success: false, message: '登录失败' });
    }
});

// 管理员注册
app.post('/api/admin/register', async (req, res) => {
    const { username, password, name, adminCode } = req.body;
    
    // 密码格式验证
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.json({ 
            success: false, 
            message: '密码格式不符合要求：不少于8位，必须包含数字、大写字母和小写字母' 
        });
    }
    
    // 验证管理员注册码
    const ADMIN_REGISTRATION_CODE = "ADMIN2024";
    if (adminCode !== ADMIN_REGISTRATION_CODE) {
        return res.json({ success: false, message: '管理员注册码错误' });
    }
    
    try {
        // 检查管理员用户名是否已存在
        const existingAdmin = await db.getAdminByUsername(username);
        if (existingAdmin) {
            return res.json({ success: false, message: '管理员用户名已存在' });
        }
        
        // 创建新管理员
        await db.createAdmin({ username, password, name });
        res.json({ success: true, message: '管理员注册成功' });
    } catch (error) {
        console.error('管理员注册失败:', error);
        res.json({ success: false, message: '管理员注册失败' });
    }
});

// 管理员登录
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const admin = await db.getAdminByUsername(username);
        if (admin && admin.password === password) {
            res.json({ success: true, admin: { ...admin, password: undefined } });
        } else {
            res.json({ success: false, message: '管理员用户名或密码错误' });
        }
    } catch (error) {
        console.error('管理员登录失败:', error);
        res.json({ success: false, message: '登录失败' });
    }
});

// 获取所有列车信息
app.get('/api/trains', async (req, res) => {
    try {
        const trains = await db.getAllTrains();
        const suspended = await db.getSuspendedTrains();
        
        // 过滤掉停运的列车
        const availableTrains = trains.filter(train => !suspended.includes(train.trainNumber));
        res.json(availableTrains);
    } catch (error) {
        console.error('获取列车信息失败:', error);
        res.json([]);
    }
});

// 查询列车
app.post('/api/search', async (req, res) => {
    const { startStation, endStation, departureTime } = req.body;
    
    try {
        const trains = await db.getAllTrains();
        const suspended = await db.getSuspendedTrains();
        
        console.log('\n=============== 开始搜索 ===============');
        console.log('查询参数:', { startStation, endStation, departureTime });
        console.log('总列车数量:', trains.length);
        console.log('停运列车数量:', suspended.length);
        
        // 验证参数格式
        if (typeof startStation !== 'string' || typeof endStation !== 'string') {
            console.log('参数类型错误:', { 
                startStationType: typeof startStation, 
                endStationType: typeof endStation 
            });
            return res.json([]);
        }
        
        // 打印出所有车次的站点信息，用于调试
        console.log('所有车次的站点信息:');
        trains.forEach(train => {
            console.log(`车次 ${train.trainNumber}: ${train.stations.join(' -> ')}`);
        });

        // 辅助函数：获取指定方向的时刻表
        function getDirectionalSchedule(allTimes, startIdx, endIdx) {
            if (!allTimes || allTimes.length === 0) {
                console.log('时间数据为空');
                return allTimes;
            }
            
            // 计算站点数量（前一半是正向，后一半是反向）
            const numStations = Math.floor(allTimes.length / 2);
            console.log(`总时刻数=${allTimes.length}, 单向站点数=${numStations}`);
            console.log(`完整时刻表: ${allTimes.join(', ')}`);
            
            // 确保索引在有效范围内
            if (startIdx >= numStations || endIdx >= numStations) {
                console.log(`索引超出范围，startIdx=${startIdx}, endIdx=${endIdx}, numStations=${numStations}`);
                // 如果索引超出范围，返回前半部分（正向时刻表）
                return allTimes.slice(0, numStations);
            }
            
            // 如果是正向行程（startIdx < endIdx），使用前半部分时间
            if (startIdx < endIdx) {
                console.log(`正向行程 ${startIdx} -> ${endIdx}，使用前半部分时刻表`);
                return allTimes.slice(0, numStations);
            }
            // 如果是反向行程（startIdx > endIdx），使用后半部分时间
            else {
                console.log(`反向行程 ${startIdx} -> ${endIdx}，使用后半部分时刻表`);
                return allTimes.slice(numStations);
            }
        }

        // 辅助函数：时间字符串转换为分钟数
        function timeToMinutes(timeStr) {
            if (!timeStr) return 0;
            
            const parts = timeStr.split(':');
            if (parts.length !== 2) return 0;
            
            const hours = parseInt(parts[0], 10) || 0;
            const minutes = parseInt(parts[1], 10) || 0;
            return hours * 60 + minutes;
        }

        const results = trains.filter(train => {
            // 过滤停运列车
            if (suspended.includes(train.trainNumber)) {
                console.log(`跳过停运列车: ${train.trainNumber}`);
                return false;
            }
            
            const startIndex = train.stations.indexOf(startStation);
            const endIndex = train.stations.indexOf(endStation);
            
            console.log(`车次${train.trainNumber}: 起点${startStation}索引=${startIndex}, 终点${endStation}索引=${endIndex}`);
            console.log(`车次${train.trainNumber}站点:`, train.stations);
            
            // 站点必须存在且不相同
            if (startIndex === -1 || endIndex === -1 || startIndex === endIndex) {
                console.log(`车次${train.trainNumber}: 站点不存在或相同`);
                return false;
            }

            // 检查数组边界
            const numStations = train.stations.length;
            const fromIdx = Math.min(startIndex, endIndex);
            const toIdx = Math.max(startIndex, endIndex);
            
            // 检查座位和价格矩阵是否存在且有效
            if (!train.seats || !train.prices || 
                fromIdx >= train.seats.length || 
                toIdx >= train.seats.length ||
                !train.seats[fromIdx] || 
                !train.prices[fromIdx] ||
                toIdx >= train.seats[fromIdx].length ||
                toIdx >= train.prices[fromIdx].length) {
                console.log(`车次${train.trainNumber}: 座位或价格矩阵访问越界`);
                console.log(`  fromIdx=${fromIdx}, toIdx=${toIdx}`);
                console.log(`  seats.length=${train.seats ? train.seats.length : 'undefined'}`);
                console.log(`  prices.length=${train.prices ? train.prices.length : 'undefined'}`);
                return false;
            }

            // 获取对应方向的时刻表
            const scheduleTimes = getDirectionalSchedule(train.arrivalTimes, startIndex, endIndex);
            
            // 修复：正确计算出发时间
            let trainDepartureTime;
            
            // 如果是正向行程
            if (startIndex < endIndex) {
                trainDepartureTime = scheduleTimes[startIndex];
            }
            // 如果是反向行程，需要调整索引
            else {
                const numStations = train.stations.length;
                const reverseStartIdx = numStations - 1 - startIndex;
                trainDepartureTime = scheduleTimes[reverseStartIdx];
            }
            
            console.log(`车次${train.trainNumber}: 出发时间=${trainDepartureTime}`);
            
            // 如果用户指定了出发时间，进行过滤
            if (departureTime) {
                const filterTimeMinutes = timeToMinutes(departureTime);
                const trainDepartureMinutes = timeToMinutes(trainDepartureTime);
                
                // 如果列车出发时间早于用户指定的时间，跳过此车次
                if (trainDepartureMinutes < filterTimeMinutes) {
                    console.log(`车次${train.trainNumber}: 出发时间不符合条件`);
                    return false;
                }
            }

            console.log(`车次${train.trainNumber}: 通过所有筛选条件`);
            return true;
        });
        
        console.log(`过滤后的车次数量: ${results.length}`);
        
        // 处理结果
        const formattedResults = results.map(train => {
            const startIndex = train.stations.indexOf(startStation);
            const endIndex = train.stations.indexOf(endStation);
            
            // 获取对应方向的时刻表
            const scheduleTimes = getDirectionalSchedule(train.arrivalTimes, startIndex, endIndex);
            
            // 修复：正确计算出发和到达时间
            let departureTime, arrivalTime;
            
            // 如果是正向行程
            if (startIndex < endIndex) {
                departureTime = scheduleTimes[startIndex];
                arrivalTime = scheduleTimes[endIndex];
            } 
            // 如果是反向行程，需要调整索引
            else {
                // 对于反向时间，我们需要重新计算索引
                const numStations = train.stations.length;
                const reverseStartIdx = numStations - 1 - startIndex;
                const reverseEndIdx = numStations - 1 - endIndex;
                
                departureTime = scheduleTimes[reverseStartIdx];
                arrivalTime = scheduleTimes[reverseEndIdx];
            }
            
            // 确保索引顺序正确（小的在前，大的在后）- 价格和余票查询
            const fromIdx = Math.min(startIndex, endIndex);
            const toIdx = Math.max(startIndex, endIndex);

            console.log(`车次${train.trainNumber}数据格式化:`, {
                trainNumber: train.trainNumber,
                startStation: startStation,
                endStation: endStation,
                departureTime: departureTime,
                arrivalTime: arrivalTime,
                availableSeats: train.seats[fromIdx][toIdx],
                price: train.prices[fromIdx][toIdx],
                fromIdx: fromIdx,
                toIdx: toIdx
            });

            return {
                trainNumber: train.trainNumber,
                startStation: startStation,
                endStation: endStation,
                departureTime: departureTime || '未知',
                arrivalTime: arrivalTime || '未知',
                availableSeats: train.seats[fromIdx][toIdx] || 0,
                price: train.prices[fromIdx][toIdx] || 0,
                stations: train.stations.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1),
                times: scheduleTimes.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
            };
        });
        
        console.log('最终查询结果:');
        formattedResults.forEach((result, index) => {
            console.log(`结果${index + 1}:`, {
                trainNumber: result.trainNumber,
                startStation: result.startStation,
                endStation: result.endStation,
                departureTime: result.departureTime,
                arrivalTime: result.arrivalTime,
                availableSeats: result.availableSeats,
                price: result.price
            });
        });
        
        // 按票价从低到高排序
        formattedResults.sort((a, b) => a.price - b.price);
        
        console.log('查询结果数量:', formattedResults.length);
        res.json(formattedResults);
    } catch (error) {
        console.error('查询失败:', error);
        res.json([]);
    }
});

// 购买车票
app.post('/api/purchase', async (req, res) => {
    const { username, trainNumber, startStation, endStation, departureTime, arrivalTime, price } = req.body;
    
    try {
        const user = await db.getUserByUsername(username);
        if (!user) {
            return res.json({ success: false, message: '用户不存在' });
        }
        
        if (user.balance < price) {
            return res.json({ success: false, message: '余额不足' });
        }
        
        // 查找列车并更新座位
        const trains = await db.getAllTrains();
        const train = trains.find(t => t.trainNumber === trainNumber);
        if (!train) {
            return res.json({ success: false, message: '列车不存在' });
        }
        
        const startIndex = train.stations.indexOf(startStation);
        const endIndex = train.stations.indexOf(endStation);
        
        // 确保索引顺序正确（小的在前，大的在后）
        const fromIdx = Math.min(startIndex, endIndex);
        const toIdx = Math.max(startIndex, endIndex);
        
        if (train.seats[fromIdx][toIdx] <= 0) {
            return res.json({ success: false, message: '票已售完' });
        }
        
        // 扣除余额
        const newBalance = user.balance - price;
        await db.updateUserBalance(username, newBalance);
        
        // 添加行程
        const tripId = Date.now() + Math.random().toString(36).substr(2, 9);
        await db.createTrip({
            id: tripId,
            username,
            trainNumber,
            startStation,
            endStation,
            departureTime,
            arrivalTime,
            route: `${startStation}->${endStation}`,
            price
        });
        
        // 减少可用座位
        train.seats[fromIdx][toIdx]--;
        await db.updateTrainSeats(trainNumber, train.seats);
        
        res.json({ success: true, message: '购票成功', balance: newBalance });
    } catch (error) {
        console.error('购票失败:', error);
        res.json({ success: false, message: '购票失败' });
    }
});

// 获取用户信息
app.get('/api/user/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await db.getUserByUsername(username);
        if (user) {
            const trips = await db.getUserTrips(username);
            res.json({ ...user, password: undefined, trips });
        } else {
            res.status(404).json({ message: '用户不存在' });
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 退票
app.post('/api/refund', async (req, res) => {
    const { username, tripId } = req.body;
    
    try {
        const user = await db.getUserByUsername(username);
        if (!user) {
            return res.json({ success: false, message: '用户不存在' });
        }
        
        const trip = await db.getTripById(tripId);
        if (!trip || trip.username !== username) {
            return res.json({ success: false, message: '行程不存在' });
        }
        
        // 查找列车并恢复座位
        const trains = await db.getAllTrains();
        const train = trains.find(t => t.trainNumber === trip.trainNumber);
        if (train) {
            const startIndex = train.stations.indexOf(trip.startStation);
            const endIndex = train.stations.indexOf(trip.endStation);
            
            if (startIndex !== -1 && endIndex !== -1) {
                // 确保索引顺序正确（小的在前，大的在后）
                const fromIdx = Math.min(startIndex, endIndex);
                const toIdx = Math.max(startIndex, endIndex);
                
                // 增加可用座位
                train.seats[fromIdx][toIdx]++;
                await db.updateTrainSeats(trip.trainNumber, train.seats);
            }
        }
        
        // 退款80%票价
        const refundAmount = Math.floor(trip.price * 0.8);
        const newBalance = user.balance + refundAmount;
        await db.updateUserBalance(username, newBalance);
        
        // 删除行程记录
        await db.deleteTrip(tripId);
        
        res.json({ 
            success: true, 
            message: `退票成功，退款金额：￥${refundAmount}`, 
            balance: newBalance,
            refundAmount: refundAmount
        });
    } catch (error) {
        console.error('退票失败:', error);
        res.json({ success: false, message: '退票失败' });
    }
});

// 充值
app.post('/api/recharge', async (req, res) => {
    const { username, amount } = req.body;
    
    try {
        const user = await db.getUserByUsername(username);
        if (!user) {
            return res.json({ success: false, message: '用户不存在' });
        }
        
        const newBalance = user.balance + parseFloat(amount);
        await db.updateUserBalance(username, newBalance);
        
        res.json({ success: true, balance: newBalance });
    } catch (error) {
        console.error('充值失败:', error);
        res.json({ success: false, message: '充值失败' });
    }
});

// 管理员功能 - 获取所有用户
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.json([]);
    }
});

// 管理员功能 - 封禁用户
app.post('/api/admin/ban-user', async (req, res) => {
    const { username } = req.body;
    
    try {
        const result = await db.banUser(username);
        if (result.changes > 0) {
            res.json({ success: true, message: '用户已被封禁' });
        } else {
            res.json({ success: false, message: '用户不存在' });
        }
    } catch (error) {
        console.error('封禁用户失败:', error);
        res.json({ success: false, message: '操作失败' });
    }
});

// 管理员功能 - 解封用户
app.post('/api/admin/unban-user', async (req, res) => {
    const { username } = req.body;
    
    try {
        const result = await db.unbanUser(username);
        if (result.changes > 0) {
            res.json({ success: true, message: '用户已被解封' });
        } else {
            res.json({ success: false, message: '用户不存在' });
        }
    } catch (error) {
        console.error('解封用户失败:', error);
        res.json({ success: false, message: '操作失败' });
    }
});

// 管理员功能 - 删除用户
app.post('/api/admin/delete-user', async (req, res) => {
    const { username } = req.body;
    
    try {
        const result = await db.deleteUser(username);
        if (result.changes > 0) {
            res.json({ success: true, message: '用户已被删除' });
        } else {
            res.json({ success: false, message: '用户不存在' });
        }
    } catch (error) {
        console.error('删除用户失败:', error);
        res.json({ success: false, message: '操作失败' });
    }
});

// 管理员功能 - 停运列车
app.post('/api/admin/suspend-train', async (req, res) => {
    const { trainNumber } = req.body;
    
    try {
        await db.suspendTrain(trainNumber);
        res.json({ success: true, message: '列车已停运' });
    } catch (error) {
        console.error('停运列车失败:', error);
        res.json({ success: false, message: '操作失败' });
    }
});

// 管理员功能 - 恢复列车
app.post('/api/admin/resume-train', async (req, res) => {
    const { trainNumber } = req.body;
    
    try {
        const result = await db.resumeTrain(trainNumber);
        if (result.changes > 0) {
            res.json({ success: true, message: '列车已恢复运行' });
        } else {
            res.json({ success: false, message: '列车不在停运列表中' });
        }
    } catch (error) {
        console.error('恢复列车失败:', error);
        res.json({ success: false, message: '操作失败' });
    }
});

// 获取停运列车列表
app.get('/api/admin/suspended-trains', async (req, res) => {
    try {
        const suspended = await db.getSuspendedTrains();
        res.json(suspended);
    } catch (error) {
        console.error('获取停运列车列表失败:', error);
        res.json([]);
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('正在关闭服务器...');
    await db.close();
    process.exit(0);
});
