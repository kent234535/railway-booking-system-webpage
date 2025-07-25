const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'railway.db');
        this.db = null;
        this.init();
    }

    // 初始化数据库连接
    init() {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('数据库连接失败:', err.message);
            } else {
                console.log('数据库连接成功');
                this.createTables();
            }
        });
    }

    // 创建数据表
    createTables() {
        // 创建用户表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                idNumber TEXT NOT NULL,
                balance REAL DEFAULT 3000,
                banned INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 创建管理员表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 创建列车表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS trains (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trainNumber TEXT UNIQUE NOT NULL,
                stations TEXT NOT NULL,
                arrivalTimes TEXT NOT NULL,
                seats TEXT NOT NULL,
                prices TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 创建用户行程表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS user_trips (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                trainNumber TEXT NOT NULL,
                startStation TEXT NOT NULL,
                endStation TEXT NOT NULL,
                departureTime TEXT NOT NULL,
                arrivalTime TEXT NOT NULL,
                route TEXT NOT NULL,
                price REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES users (username)
            )
        `);

        // 创建停运列车表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS suspended_trains (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trainNumber TEXT UNIQUE NOT NULL,
                suspended_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 创建站点图表
        this.db.run(`
            CREATE TABLE IF NOT EXISTS stations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stationName TEXT UNIQUE NOT NULL,
                connections TEXT NOT NULL
            )
        `);

        console.log('数据表创建完成');
        this.initializeData();
    }

    // 初始化基础数据
    initializeData() {
        // 检查是否已有数据
        this.db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (err) {
                console.error('检查用户数据失败:', err);
                return;
            }
            
            if (row.count === 0) {
                console.log('初始化基础数据...');
                this.insertInitialData();
            }
        });
    }

    // 插入初始数据
    insertInitialData() {
        // 插入初始用户
        const insertUser = this.db.prepare(`
            INSERT INTO users (username, password, name, idNumber, balance, banned)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        insertUser.run('k', 'k', 'k', '51010620050814011X', 5937, 0);
        insertUser.finalize();

        // 插入初始管理员
        const insertAdmin = this.db.prepare(`
            INSERT INTO admins (username, password, name)
            VALUES (?, ?, ?)
        `);
        
        insertAdmin.run('admin', 'admin123', '系统管理员');
        insertAdmin.finalize();

        // 插入站点数据
        const stationsData = {
            "成都": { "兰州": 837, "重庆": 247, "西安": 658, "昆明": 1139 },
            "兰州": { "成都": 837, "西安": 568 },
            "西安": { "兰州": 568, "成都": 658, "重庆": 614, "太原": 570, "郑州": 450, "武汉": 657 },
            "重庆": { "西安": 614, "成都": 247, "昆明": 700, "武汉": 845, "长沙": 740, "贵阳": 345 },
            "昆明": { "成都": 1139, "重庆": 700, "贵阳": 639, "南宁": 710 },
            "贵阳": { "昆明": 639, "重庆": 345, "长沙": 800, "广州": 857, "南宁": 482 },
            "南宁": { "昆明": 710, "贵阳": 482, "广州": 550 },
            "广州": { "南宁": 550, "贵阳": 857, "长沙": 707, "福州": 850, "南昌": 780 },
            "长沙": { "重庆": 740, "武汉": 332, "南昌": 340, "广州": 707, "贵阳": 800 },
            "太原": { "西安": 570, "郑州": 432, "石家庄": 190 },
            "郑州": { "太原": 432, "西安": 450, "武汉": 377, "合肥": 536, "济南": 407, "石家庄": 412 },
            "武汉": { "西安": 657, "重庆": 845, "长沙": 332, "南昌": 350, "合肥": 350, "郑州": 377 },
            "石家庄": { "太原": 190, "郑州": 412, "济南": 298, "北京": 281 },
            "北京": { "石家庄": 281, "济南": 406 },
            "济南": { "北京": 406, "石家庄": 298, "郑州": 407, "合肥": 594, "南京": 580 },
            "合肥": { "济南": 594, "郑州": 536, "武汉": 350, "南昌": 450, "南京": 157 },
            "南昌": { "武汉": 350, "长沙": 340, "广州": 780, "福州": 547, "杭州": 470, "合肥": 450 },
            "福州": { "广州": 850, "南昌": 547, "杭州": 560 },
            "杭州": { "福州": 560, "南昌": 470, "南京": 256, "上海": 202 },
            "上海": { "杭州": 202, "南京": 300 },
            "南京": { "上海": 300, "杭州": 256, "合肥": 157, "济南": 580 }
        };

        const insertStation = this.db.prepare(`
            INSERT INTO stations (stationName, connections)
            VALUES (?, ?)
        `);

        for (const [station, connections] of Object.entries(stationsData)) {
            insertStation.run(station, JSON.stringify(connections));
        }
        insertStation.finalize();

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

        const insertTrain = this.db.prepare(`
            INSERT INTO trains (trainNumber, stations, arrivalTimes, seats, prices)
            VALUES (?, ?, ?, ?, ?)
        `);

        insertTrain.run(
            defaultTrain.trainNumber,
            JSON.stringify(defaultTrain.stations),
            JSON.stringify(defaultTrain.arrivalTimes),
            JSON.stringify(defaultTrain.seats),
            JSON.stringify(defaultTrain.prices)
        );
        insertTrain.finalize();

        console.log('基础数据初始化完成');
    }

    // 用户相关操作
    async createUser(userData) {
        return new Promise((resolve, reject) => {
            const { username, password, name, idNumber } = userData;
            const stmt = this.db.prepare(`
                INSERT INTO users (username, password, name, idNumber, balance, banned)
                VALUES (?, ?, ?, ?, 3000, 0)
            `);
            
            stmt.run([username, password, name, idNumber], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, success: true });
                }
            });
            stmt.finalize();
        });
    }

    async getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM users WHERE username = ?",
                [username],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    async updateUserBalance(username, newBalance) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE users SET balance = ? WHERE username = ?",
                [newBalance, username],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async banUser(username) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE users SET banned = 1 WHERE username = ?",
                [username],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async unbanUser(username) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE users SET banned = 0 WHERE username = ?",
                [username],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async deleteUser(username) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run("DELETE FROM user_trips WHERE username = ?", [username]);
                this.db.run("DELETE FROM users WHERE username = ?", [username], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                });
            });
        });
    }

    async getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM users", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 管理员相关操作
    async createAdmin(adminData) {
        return new Promise((resolve, reject) => {
            const { username, password, name } = adminData;
            const stmt = this.db.prepare(`
                INSERT INTO admins (username, password, name)
                VALUES (?, ?, ?)
            `);
            
            stmt.run([username, password, name], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, success: true });
                }
            });
            stmt.finalize();
        });
    }

    async getAdminByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM admins WHERE username = ?",
                [username],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // 列车相关操作
    async getAllTrains() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM trains", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 解析JSON字段
                    const trains = rows.map(row => ({
                        ...row,
                        stations: JSON.parse(row.stations),
                        arrivalTimes: JSON.parse(row.arrivalTimes),
                        seats: JSON.parse(row.seats),
                        prices: JSON.parse(row.prices)
                    }));
                    resolve(trains);
                }
            });
        });
    }

    async updateTrainSeats(trainNumber, seats) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE trains SET seats = ? WHERE trainNumber = ?",
                [JSON.stringify(seats), trainNumber],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    // 行程相关操作
    async createTrip(tripData) {
        return new Promise((resolve, reject) => {
            const { id, username, trainNumber, startStation, endStation, departureTime, arrivalTime, route, price } = tripData;
            const stmt = this.db.prepare(`
                INSERT INTO user_trips (id, username, trainNumber, startStation, endStation, departureTime, arrivalTime, route, price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run([id, username, trainNumber, startStation, endStation, departureTime, arrivalTime, route, price], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ success: true });
                }
            });
            stmt.finalize();
        });
    }

    async getUserTrips(username) {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT * FROM user_trips WHERE username = ? ORDER BY created_at DESC",
                [username],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async deleteTrip(tripId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "DELETE FROM user_trips WHERE id = ?",
                [tripId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async getTripById(tripId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM user_trips WHERE id = ?",
                [tripId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // 停运列车相关操作
    async suspendTrain(trainNumber) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT OR IGNORE INTO suspended_trains (trainNumber)
                VALUES (?)
            `);
            
            stmt.run([trainNumber], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
            stmt.finalize();
        });
    }

    async resumeTrain(trainNumber) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "DELETE FROM suspended_trains WHERE trainNumber = ?",
                [trainNumber],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async getSuspendedTrains() {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT trainNumber FROM suspended_trains",
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => row.trainNumber));
                    }
                }
            );
        });
    }

    // 站点相关操作
    async getAllStations() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM stations", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const stationsData = {};
                    rows.forEach(row => {
                        stationsData[row.stationName] = JSON.parse(row.connections);
                    });
                    resolve(stationsData);
                }
            });
        });
    }

    // 关闭数据库连接
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('数据库连接已关闭');
                    resolve();
                }
            });
        });
    }

    // ======= 回调函数版本的方法（供server.js使用） =======
    
    // 用户注册（回调版本）
    registerUser(username, password, name, idNumber, callback) {
        const sql = `INSERT INTO users (username, password, name, idNumber, balance, banned) VALUES (?, ?, ?, ?, ?, ?)`;
        this.db.run(sql, [username, password, name, idNumber, 3000, 0], function(err) {
            callback(err, this);
        });
    }

    // 用户登录（回调版本）
    loginUser(username, password, callback) {
        const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
        this.db.get(sql, [username, password], (err, row) => {
            if (err) {
                callback(err, null);
            } else {
                if (row) {
                    // 获取用户的行程
                    this.db.all(
                        `SELECT * FROM user_trips WHERE username = ?`,
                        [username],
                        (err, trips) => {
                            if (err) {
                                callback(err, null);
                            } else {
                                row.trips = trips || [];
                                callback(null, row);
                            }
                        }
                    );
                } else {
                    callback(null, null);
                }
            }
        });
    }

    // 获取用户信息（回调版本）
    getUserInfo(username, callback) {
        const sql = `SELECT * FROM users WHERE username = ?`;
        this.db.get(sql, [username], (err, row) => {
            if (err) {
                callback(err, null);
            } else if (row) {
                // 获取用户的行程
                this.db.all(
                    `SELECT * FROM user_trips WHERE username = ?`,
                    [username],
                    (err, trips) => {
                        if (err) {
                            callback(err, null);
                        } else {
                            row.trips = trips || [];
                            callback(null, row);
                        }
                    }
                );
            } else {
                callback(null, null);
            }
        });
    }

    // 用户充值（回调版本）
    rechargeUser(username, amount, callback) {
        const sql = `UPDATE users SET balance = balance + ? WHERE username = ?`;
        this.db.run(sql, [amount, username], function(err) {
            callback(err, this);
        });
    }

    // 获取所有列车（回调版本）
    getAllTrains(callback) {
        const sql = `SELECT * FROM trains`;
        this.db.all(sql, [], (err, rows) => {
            if (err) {
                callback(err, null);
            } else {
                const trains = rows.map(row => ({
                    trainNumber: row.trainNumber,
                    stations: JSON.parse(row.stations),
                    arrivalTimes: JSON.parse(row.arrivalTimes),
                    seats: JSON.parse(row.seats),
                    prices: JSON.parse(row.prices)
                }));
                callback(null, trains);
            }
        });
    }

    // 查询列车（回调版本）
    searchTrains(startStation, endStation, callback) {
        this.getAllTrains((err, trains) => {
            if (err) {
                callback(err, null);
                return;
            }

            const results = [];
            for (const train of trains) {
                const startIndex = train.stations.indexOf(startStation);
                const endIndex = train.stations.indexOf(endStation);
                
                if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                    // 支持双向匹配：确保索引顺序正确（小的在前，大的在后）
                    const fromIdx = Math.min(startIndex, endIndex);
                    const toIdx = Math.max(startIndex, endIndex);
                    
                    const availableSeats = train.seats[fromIdx][toIdx];
                    const price = train.prices[fromIdx][toIdx];
                    
                    // 根据实际的起点和终点获取时间（保持用户查询的方向）
                    const departureTime = train.arrivalTimes[startIndex * 2];
                    const arrivalTime = train.arrivalTimes[endIndex * 2 + 1];
                    
                    results.push({
                        trainNumber: train.trainNumber,
                        startStation,
                        endStation,
                        departureTime,
                        arrivalTime,
                        availableSeats,
                        price
                    });
                }
            }
            callback(null, results);
        });
    }

    // 购买车票（回调版本）
    purchaseTicket(username, trainNumber, startStation, endStation, callback) {
        // 先检查余票和价格
        this.searchTrains(startStation, endStation, (err, results) => {
            if (err) {
                callback(err, null);
                return;
            }

            const train = results.find(t => t.trainNumber === trainNumber);
            if (!train) {
                callback(new Error('列车不存在'), null);
                return;
            }

            if (train.availableSeats <= 0) {
                callback(new Error('余票不足'), null);
                return;
            }

            // 检查用户余额
            this.getUserInfo(username, (err, user) => {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (user.balance < train.price) {
                    callback(new Error('余额不足'), null);
                    return;
                }

                // 开始事务：扣除余额、减少余票、添加行程
                const tripId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                
                this.db.run('BEGIN TRANSACTION');
                
                // 扣除余额
                this.db.run(
                    `UPDATE users SET balance = balance - ? WHERE username = ?`,
                    [train.price, username],
                    (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            callback(err, null);
                            return;
                        }

                        // 添加行程记录
                        this.db.run(
                            `INSERT INTO user_trips (id, username, trainNumber, startStation, endStation, departureTime, arrivalTime, route, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [tripId, username, trainNumber, startStation, endStation, train.departureTime, train.arrivalTime, `${startStation}->${endStation}`, train.price],
                            (err) => {
                                if (err) {
                                    this.db.run('ROLLBACK');
                                    callback(err, null);
                                    return;
                                }

                                // 更新余票 (这里需要更新trains表中的seats数据)
                                this.db.get(`SELECT * FROM trains WHERE trainNumber = ?`, [trainNumber], (err, trainRow) => {
                                    if (err) {
                                        this.db.run('ROLLBACK');
                                        callback(err, null);
                                        return;
                                    }

                                    const seats = JSON.parse(trainRow.seats);
                                    const stations = JSON.parse(trainRow.stations);
                                    const startIndex = stations.indexOf(startStation);
                                    const endIndex = stations.indexOf(endStation);
                                    
                                    // 支持双向匹配：确保索引顺序正确（小的在前，大的在后）
                                    const fromIdx = Math.min(startIndex, endIndex);
                                    const toIdx = Math.max(startIndex, endIndex);
                                    
                                    seats[fromIdx][toIdx] -= 1;

                                    this.db.run(
                                        `UPDATE trains SET seats = ? WHERE trainNumber = ?`,
                                        [JSON.stringify(seats), trainNumber],
                                        (err) => {
                                            if (err) {
                                                this.db.run('ROLLBACK');
                                                callback(err, null);
                                            } else {
                                                this.db.run('COMMIT');
                                                callback(null, {
                                                    id: tripId,
                                                    trainNumber,
                                                    route: `${startStation}->${endStation}`,
                                                    departureTime: train.departureTime,
                                                    arrivalTime: train.arrivalTime,
                                                    price: train.price
                                                });
                                            }
                                        }
                                    );
                                });
                            }
                        );
                    }
                );
            });
        });
    }

    // 管理员注册（回调版本）
    registerAdmin(username, password, name, callback) {
        const sql = `INSERT INTO admins (username, password, name) VALUES (?, ?, ?)`;
        this.db.run(sql, [username, password, name], function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { id: this.lastID, username, name });
            }
        });
    }

    // 管理员登录（回调版本）
    loginAdmin(username, password, callback) {
        const sql = `SELECT * FROM admins WHERE username = ? AND password = ?`;
        this.db.get(sql, [username, password], callback);
    }

    // 获取所有用户（回调版本）
    getAllUsers(callback) {
        const sql = `SELECT username, name, idNumber, balance, banned, created_at FROM users`;
        this.db.all(sql, [], (err, rows) => {
            if (err) {
                callback(err, null);
            } else {
                // 为每个用户获取行程数量
                let completed = 0;
                const users = rows.map(user => ({ ...user, tripCount: 0 }));
                
                if (users.length === 0) {
                    callback(null, users);
                    return;
                }

                users.forEach((user, index) => {
                    this.db.get(
                        `SELECT COUNT(*) as count FROM user_trips WHERE username = ?`,
                        [user.username],
                        (err, result) => {
                            if (!err && result) {
                                users[index].tripCount = result.count;
                            }
                            completed++;
                            if (completed === users.length) {
                                callback(null, users);
                            }
                        }
                    );
                });
            }
        });
    }

    // 封禁用户（回调版本）
    banUser(username, callback) {
        const sql = `UPDATE users SET banned = 1 WHERE username = ?`;
        this.db.run(sql, [username], function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { changes: this.changes });
            }
        });
    }

    // 解封用户（回调版本）
    unbanUser(username, callback) {
        const sql = `UPDATE users SET banned = 0 WHERE username = ?`;
        this.db.run(sql, [username], function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { changes: this.changes });
            }
        });
    }

    // 删除用户（回调版本）
    deleteUser(username, callback) {
        this.db.serialize(() => {
            this.db.run(`DELETE FROM user_trips WHERE username = ?`, [username]);
            this.db.run(`DELETE FROM users WHERE username = ?`, [username], function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, { changes: this.changes });
                }
            });
        });
    }

    // 停运列车（回调版本）
    suspendTrain(trainNumber, callback) {
        const sql = `INSERT OR IGNORE INTO suspended_trains (trainNumber) VALUES (?)`;
        this.db.run(sql, [trainNumber], function(err) {
            callback(err, this);
        });
    }

    // 恢复列车（回调版本）
    resumeTrain(trainNumber, callback) {
        const sql = `DELETE FROM suspended_trains WHERE trainNumber = ?`;
        this.db.run(sql, [trainNumber], function(err) {
            callback(err, this);
        });
    }

    // 获取停运列车（回调版本）
    getSuspendedTrains(callback) {
        const sql = `SELECT trainNumber FROM suspended_trains`;
        this.db.all(sql, [], (err, rows) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, rows.map(row => row.trainNumber));
            }
        });
    }

    // 退票（回调版本）
    refundTicket(username, tripId, callback) {
        // 获取行程信息
        this.db.get(
            `SELECT * FROM user_trips WHERE id = ? AND username = ?`,
            [tripId, username],
            (err, trip) => {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (!trip) {
                    callback(new Error('行程不存在'), null);
                    return;
                }

                // 计算退款金额（80%）
                const refundAmount = Math.floor(trip.price * 0.8);

                // 开始事务：增加余额、删除行程、恢复余票
                this.db.run('BEGIN TRANSACTION');

                // 增加用户余额
                this.db.run(
                    `UPDATE users SET balance = balance + ? WHERE username = ?`,
                    [refundAmount, username],
                    (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            callback(err, null);
                            return;
                        }

                        // 删除行程记录
                        this.db.run(
                            `DELETE FROM user_trips WHERE id = ?`,
                            [tripId],
                            (err) => {
                                if (err) {
                                    this.db.run('ROLLBACK');
                                    callback(err, null);
                                    return;
                                }

                                // 恢复余票（增加seats数据）
                                this.db.get(`SELECT * FROM trains WHERE trainNumber = ?`, [trip.trainNumber], (err, trainRow) => {
                                    if (err) {
                                        this.db.run('ROLLBACK');
                                        callback(err, null);
                                        return;
                                    }

                                    if (trainRow) {
                                        const seats = JSON.parse(trainRow.seats);
                                        const stations = JSON.parse(trainRow.stations);
                                        const startIndex = stations.indexOf(trip.startStation);
                                        const endIndex = stations.indexOf(trip.endStation);
                                        
                                        if (startIndex !== -1 && endIndex !== -1) {
                                            // 支持双向匹配：确保索引顺序正确（小的在前，大的在后）
                                            const fromIdx = Math.min(startIndex, endIndex);
                                            const toIdx = Math.max(startIndex, endIndex);
                                            
                                            seats[fromIdx][toIdx] += 1;

                                            this.db.run(
                                                `UPDATE trains SET seats = ? WHERE trainNumber = ?`,
                                                [JSON.stringify(seats), trip.trainNumber],
                                                (err) => {
                                                    if (err) {
                                                        this.db.run('ROLLBACK');
                                                        callback(err, null);
                                                    } else {
                                                        this.db.run('COMMIT');
                                                        callback(null, {
                                                            tripId,
                                                            refundAmount,
                                                            originalPrice: trip.price,
                                                            trainNumber: trip.trainNumber,
                                                            route: trip.route
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            this.db.run('COMMIT');
                                            callback(null, {
                                                tripId,
                                                refundAmount,
                                                originalPrice: trip.price,
                                                trainNumber: trip.trainNumber,
                                                route: trip.route
                                            });
                                        }
                                    } else {
                                        this.db.run('COMMIT');
                                        callback(null, {
                                            tripId,
                                            refundAmount,
                                            originalPrice: trip.price,
                                            trainNumber: trip.trainNumber,
                                            route: trip.route
                                        });
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );
    }
}

module.exports = Database;
