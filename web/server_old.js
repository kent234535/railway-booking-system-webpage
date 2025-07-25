const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = 3000;

// 初始化数据库
const db = new Database();

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API 路由

// 从new_trains.txt加载列车数据
function loadTrainsFromFile() {
    const trainFilePath = path.join(__dirname, '..', 'new_trains.txt');
    console.log('尝试从文件加载列车数据:', trainFilePath);
    
    if (!fs.existsSync(trainFilePath)) {
        console.log('new_trains.txt文件不存在，使用默认数据');
        // 使用默认数据
        const trainsData = [
            {
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
            }
        ];
        fs.writeFileSync(DATA_FILES.trains, JSON.stringify(trainsData, null, 2));
        return;
    }
    
    try {
        const data = fs.readFileSync(trainFilePath, 'utf8');
        const lines = data.trim().split('\n');
        const trainsData = [];
        
        console.log(`文件包含${lines.length}行数据`);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            
            console.log(`处理第${i+1}行: ${line.substring(0, 50)}...`);
            
            const parts = line.split(',');
            if (parts.length < 5) {
                console.log(`第${i+1}行数据格式错误，部分数：${parts.length}`);
                continue;
            }
            
            const trainNumber = parts[0].trim();
            const stations = parts[1].split('|').map(s => s.trim());
            const arrivalTimes = parts[2].split('|').map(t => t.trim());
            
            console.log(`车次${trainNumber}: 站点数=${stations.length}, 时间数=${arrivalTimes.length}`);
            console.log(`站点:`, stations.slice(0, 3).join(', ') + '...');
            console.log(`时间:`, arrivalTimes.slice(0, 6).join(', ') + '...');
            
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
            
            // 验证数据
            const expectedStations = arrivalTimes.length / 2;
            if (stations.length === expectedStations && arrivalTimes.length % 2 === 0) {
                trainsData.push({
                    trainNumber,
                    stations,
                    arrivalTimes,
                    seats,
                    prices
                });
                console.log(`✓ 成功加载车次: ${trainNumber}，站点数: ${stations.length}，时间数: ${arrivalTimes.length}`);
            } else {
                console.log(`✗ 车次${trainNumber}数据格式错误，站点数: ${stations.length}, 预期: ${expectedStations}, 时间数: ${arrivalTimes.length}`);
            }
        }
        
        fs.writeFileSync(DATA_FILES.trains, JSON.stringify(trainsData, null, 2));
        console.log(`总共加载了${trainsData.length}个车次`);
    } catch (error) {
        console.error('加载列车数据时出错:', error);
    }
}// 读取数据文件
function readDataFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
}

// 写入数据文件
function writeDataFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        return false;
    }
}

// 初始化数据
initializeDataFiles();

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 用户注册
app.post('/api/register', (req, res) => {
    const { username, password, name, idNumber } = req.body;
    const users = readDataFile(DATA_FILES.users);
    
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
    
    // 检查用户名是否已存在
    if (users.find(user => user.username === username)) {
        return res.json({ success: false, message: '用户名已存在' });
    }
    
    // 创建新用户
    const newUser = {
        username,
        password,
        name,
        idNumber,
        balance: 3000,
        banned: false,
        trips: []
    };
    
    users.push(newUser);
    if (writeDataFile(DATA_FILES.users, users)) {
        res.json({ success: true, message: '注册成功' });
    } else {
        res.json({ success: false, message: '注册失败' });
    }
});

// 用户登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readDataFile(DATA_FILES.users);
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        // 检查用户是否被封禁
        if (user.banned) {
            return res.json({ success: false, message: '账号已被封禁，请联系管理员' });
        }
        res.json({ success: true, user: { ...user, password: undefined } });
    } else {
        res.json({ success: false, message: '用户名或密码错误' });
    }
});

// 管理员注册
app.post('/api/admin/register', (req, res) => {
    const { username, password, name, adminCode } = req.body;
    const admins = readDataFile(DATA_FILES.admins);
    
    // 密码格式验证
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.json({ 
            success: false, 
            message: '密码格式不符合要求：不少于8位，必须包含数字、大写字母和小写字母' 
        });
    }
    
    // 验证管理员注册码（可以设置一个固定的注册码）
    const ADMIN_REGISTRATION_CODE = "ADMIN2024";
    if (adminCode !== ADMIN_REGISTRATION_CODE) {
        return res.json({ success: false, message: '管理员注册码错误' });
    }
    
    // 检查管理员用户名是否已存在
    if (admins.find(admin => admin.username === username)) {
        return res.json({ success: false, message: '管理员用户名已存在' });
    }
    
    // 创建新管理员
    const newAdmin = {
        username,
        password,
        name
    };
    
    admins.push(newAdmin);
    if (writeDataFile(DATA_FILES.admins, admins)) {
        res.json({ success: true, message: '管理员注册成功' });
    } else {
        res.json({ success: false, message: '管理员注册失败' });
    }
});

// 管理员登录
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admins = readDataFile(DATA_FILES.admins);
    
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
        res.json({ success: true, admin: { ...admin, password: undefined } });
    } else {
        res.json({ success: false, message: '管理员用户名或密码错误' });
    }
});

// 获取所有列车信息
app.get('/api/trains', (req, res) => {
    const trains = readDataFile(DATA_FILES.trains);
    const suspended = readDataFile(DATA_FILES.suspended);
    
    // 过滤掉停运的列车
    const availableTrains = trains.filter(train => !suspended.includes(train.trainNumber));
    res.json(availableTrains);
});

// 查询列车
app.post('/api/search', (req, res) => {
    const { startStation, endStation, departureTime } = req.body;
    const trains = readDataFile(DATA_FILES.trains);
    const suspended = readDataFile(DATA_FILES.suspended);
    
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
        
        // 如果用户指定了出发时间，进行过滤（只对正常运行的列车生效）
        if (departureTime && !suspended.includes(train.trainNumber)) {
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
});

// 购买车票
app.post('/api/purchase', (req, res) => {
    const { username, trainNumber, startStation, endStation, departureTime, arrivalTime, price } = req.body;
    
    const users = readDataFile(DATA_FILES.users);
    const trains = readDataFile(DATA_FILES.trains);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.json({ success: false, message: '用户不存在' });
    }
    
    const user = users[userIndex];
    if (user.balance < price) {
        return res.json({ success: false, message: '余额不足' });
    }
    
    // 查找列车并更新座位
    const trainIndex = trains.findIndex(t => t.trainNumber === trainNumber);
    if (trainIndex === -1) {
        return res.json({ success: false, message: '列车不存在' });
    }
    
    const train = trains[trainIndex];
    const startIndex = train.stations.indexOf(startStation);
    const endIndex = train.stations.indexOf(endStation);
    
    // 确保索引顺序正确（小的在前，大的在后）
    const fromIdx = Math.min(startIndex, endIndex);
    const toIdx = Math.max(startIndex, endIndex);
    
    if (train.seats[fromIdx][toIdx] <= 0) {
        return res.json({ success: false, message: '票已售完' });
    }
    
    // 扣除余额并添加行程
    user.balance -= price;
    const tripId = Date.now() + Math.random().toString(36).substr(2, 9);
    user.trips.push({
        id: tripId,
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
    
    // 保存数据
    writeDataFile(DATA_FILES.users, users);
    writeDataFile(DATA_FILES.trains, trains);
    
    res.json({ success: true, message: '购票成功', balance: user.balance });
});

// 获取用户信息
app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const users = readDataFile(DATA_FILES.users);
    
    const user = users.find(u => u.username === username);
    if (user) {
        res.json({ ...user, password: undefined });
    } else {
        res.status(404).json({ message: '用户不存在' });
    }
});

// 退票
app.post('/api/refund', (req, res) => {
    const { username, tripId } = req.body;
    
    const users = readDataFile(DATA_FILES.users);
    const trains = readDataFile(DATA_FILES.trains);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.json({ success: false, message: '用户不存在' });
    }
    
    const user = users[userIndex];
    const tripIndex = user.trips.findIndex(trip => trip.id === tripId);
    if (tripIndex === -1) {
        return res.json({ success: false, message: '行程不存在' });
    }
    
    const trip = user.trips[tripIndex];
    
    // 查找列车并恢复座位
    const trainIndex = trains.findIndex(t => t.trainNumber === trip.trainNumber);
    if (trainIndex !== -1) {
        const train = trains[trainIndex];
        const startIndex = train.stations.indexOf(trip.startStation);
        const endIndex = train.stations.indexOf(trip.endStation);
        
        if (startIndex !== -1 && endIndex !== -1) {
            // 确保索引顺序正确（小的在前，大的在后）
            const fromIdx = Math.min(startIndex, endIndex);
            const toIdx = Math.max(startIndex, endIndex);
            
            // 增加可用座位
            train.seats[fromIdx][toIdx]++;
        }
    }
    
    // 退款80%票价
    const refundAmount = Math.floor(trip.price * 0.8);
    user.balance += refundAmount;
    
    // 删除行程记录
    user.trips.splice(tripIndex, 1);
    
    // 保存数据
    writeDataFile(DATA_FILES.users, users);
    writeDataFile(DATA_FILES.trains, trains);
    
    res.json({ 
        success: true, 
        message: `退票成功，退款金额：￥${refundAmount}`, 
        balance: user.balance,
        refundAmount: refundAmount
    });
});

// 充值
app.post('/api/recharge', (req, res) => {
    const { username, amount } = req.body;
    const users = readDataFile(DATA_FILES.users);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.json({ success: false, message: '用户不存在' });
    }
    
    users[userIndex].balance += parseFloat(amount);
    
    if (writeDataFile(DATA_FILES.users, users)) {
        res.json({ success: true, balance: users[userIndex].balance });
    } else {
        res.json({ success: false, message: '充值失败' });
    }
});

// 管理员功能 - 获取所有用户
app.get('/api/admin/users', (req, res) => {
    const users = readDataFile(DATA_FILES.users);
    res.json(users.map(user => ({ ...user, password: undefined })));
});

// 管理员功能 - 封禁用户
app.post('/api/admin/ban-user', (req, res) => {
    const { username } = req.body;
    const users = readDataFile(DATA_FILES.users);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.json({ success: false, message: '用户不存在' });
    }
    
    users[userIndex].banned = true;
    
    if (writeDataFile(DATA_FILES.users, users)) {
        res.json({ success: true, message: '用户已被封禁' });
    } else {
        res.json({ success: false, message: '操作失败' });
    }
});

// 管理员功能 - 解封用户
app.post('/api/admin/unban-user', (req, res) => {
    const { username } = req.body;
    const users = readDataFile(DATA_FILES.users);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.json({ success: false, message: '用户不存在' });
    }
    
    users[userIndex].banned = false;
    
    if (writeDataFile(DATA_FILES.users, users)) {
        res.json({ success: true, message: '用户已被解封' });
    } else {
        res.json({ success: false, message: '操作失败' });
    }
});

// 管理员功能 - 删除用户
app.post('/api/admin/delete-user', (req, res) => {
    const { username } = req.body;
    const users = readDataFile(DATA_FILES.users);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.json({ success: false, message: '用户不存在' });
    }
    
    // 删除用户
    users.splice(userIndex, 1);
    
    if (writeDataFile(DATA_FILES.users, users)) {
        res.json({ success: true, message: '用户已被删除' });
    } else {
        res.json({ success: false, message: '操作失败' });
    }
});

// 管理员功能 - 停运列车
app.post('/api/admin/suspend-train', (req, res) => {
    const { trainNumber } = req.body;
    const suspended = readDataFile(DATA_FILES.suspended);
    
    if (!suspended.includes(trainNumber)) {
        suspended.push(trainNumber);
        if (writeDataFile(DATA_FILES.suspended, suspended)) {
            res.json({ success: true, message: '列车已停运' });
        } else {
            res.json({ success: false, message: '操作失败' });
        }
    } else {
        res.json({ success: false, message: '列车已在停运列表中' });
    }
});

// 管理员功能 - 恢复列车
app.post('/api/admin/resume-train', (req, res) => {
    const { trainNumber } = req.body;
    const suspended = readDataFile(DATA_FILES.suspended);
    
    const index = suspended.indexOf(trainNumber);
    if (index !== -1) {
        suspended.splice(index, 1);
        if (writeDataFile(DATA_FILES.suspended, suspended)) {
            res.json({ success: true, message: '列车已恢复运行' });
        } else {
            res.json({ success: false, message: '操作失败' });
        }
    } else {
        res.json({ success: false, message: '列车不在停运列表中' });
    }
});

// 获取停运列车列表
app.get('/api/admin/suspended-trains', (req, res) => {
    const suspended = readDataFile(DATA_FILES.suspended);
    res.json(suspended);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    
    // 等待一下，然后隐藏控制台
    setTimeout(() => {
        // 在Windows上隐藏控制台窗口
        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec('powershell -Command "Add-Type -Name ConsoleUtils -Namespace Win32 -MemberDefinition \'[DllImport(\\\"user32.dll\\\")]public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);\'; $consolePtr = [System.Diagnostics.Process]::GetCurrentProcess().MainWindowHandle; [Win32.ConsoleUtils]::ShowWindow($consolePtr, 0)"', 
            (error) => {
                if (error) {
                    console.log('控制台隐藏失败，请手动最小化窗口');
                }
            });
        }
    }, 2000); // 2秒后隐藏控制台
});
