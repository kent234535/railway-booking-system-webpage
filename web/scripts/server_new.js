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

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 用户注册
app.post('/api/register', (req, res) => {
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
    
    db.registerUser(username, password, name, idNumber, (err, result) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.json({ success: false, message: '用户名已存在' });
            } else {
                res.json({ success: false, message: '注册失败' });
            }
        } else {
            res.json({ success: true, message: '注册成功' });
        }
    });
});

// 用户登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.loginUser(username, password, (err, user) => {
        if (err) {
            res.json({ success: false, message: '登录失败' });
        } else if (!user) {
            res.json({ success: false, message: '用户名或密码错误' });
        } else if (user.banned) {
            res.json({ success: false, message: '账户已被禁用' });
        } else {
            res.json({ success: true, message: '登录成功', user: user });
        }
    });
});

// 获取用户信息
app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    
    db.getUserInfo(username, (err, user) => {
        if (err) {
            res.json({ success: false, message: '获取用户信息失败' });
        } else if (!user) {
            res.json({ success: false, message: '用户不存在' });
        } else {
            res.json({ success: true, user: user });
        }
    });
});

// 充值
app.post('/api/recharge', (req, res) => {
    const { username, amount } = req.body;
    
    if (amount <= 0 || amount > 100000) {
        return res.json({ success: false, message: '充值金额必须在0-100000之间' });
    }
    
    db.rechargeUser(username, amount, (err, result) => {
        if (err) {
            res.json({ success: false, message: '充值失败' });
        } else {
            res.json({ success: true, message: '充值成功' });
        }
    });
});

// 获取所有列车
app.get('/api/trains', (req, res) => {
    db.getAllTrains((err, trains) => {
        if (err) {
            res.json({ success: false, message: '获取列车信息失败' });
        } else {
            res.json({ success: true, trains: trains });
        }
    });
});

// 查询车票
app.post('/api/search', (req, res) => {
    const { startStation, endStation } = req.body;
    
    if (!startStation || !endStation) {
        return res.json({ success: false, message: '请输入出发站和到达站' });
    }
    
    if (startStation === endStation) {
        return res.json({ success: false, message: '出发站和到达站不能相同' });
    }
    
    db.searchTrains(startStation, endStation, (err, results) => {
        if (err) {
            res.json({ success: false, message: '查询失败' });
        } else {
            res.json({ success: true, trains: results });
        }
    });
});

// 购买车票
app.post('/api/purchase', (req, res) => {
    const { username, trainNumber, startStation, endStation } = req.body;
    
    db.purchaseTicket(username, trainNumber, startStation, endStation, (err, result) => {
        if (err) {
            if (err.message.includes('余票不足')) {
                res.json({ success: false, message: '余票不足' });
            } else if (err.message.includes('余额不足')) {
                res.json({ success: false, message: '余额不足' });
            } else {
                res.json({ success: false, message: '购票失败' });
            }
        } else {
            res.json({ success: true, message: '购票成功', ticket: result });
        }
    });
});

// 管理员登录
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    db.loginAdmin(username, password, (err, admin) => {
        if (err) {
            res.json({ success: false, message: '登录失败' });
        } else if (!admin) {
            res.json({ success: false, message: '用户名或密码错误' });
        } else {
            res.json({ success: true, message: '登录成功', admin: admin });
        }
    });
});

// 获取所有用户（管理员功能）
app.get('/api/admin/users', (req, res) => {
    db.getAllUsers((err, users) => {
        if (err) {
            res.json({ success: false, message: '获取用户列表失败' });
        } else {
            res.json({ success: true, users: users });
        }
    });
});

// 停运列车
app.post('/api/admin/suspend-train', (req, res) => {
    const { trainNumber } = req.body;
    
    db.suspendTrain(trainNumber, (err, result) => {
        if (err) {
            res.json({ success: false, message: '停运失败' });
        } else {
            res.json({ success: true, message: '列车已停运' });
        }
    });
});

// 恢复列车
app.post('/api/admin/resume-train', (req, res) => {
    const { trainNumber } = req.body;
    
    db.resumeTrain(trainNumber, (err, result) => {
        if (err) {
            res.json({ success: false, message: '恢复失败' });
        } else {
            res.json({ success: true, message: '列车已恢复运行' });
        }
    });
});

// 获取停运列车列表
app.get('/api/admin/suspended-trains', (req, res) => {
    db.getSuspendedTrains((err, trains) => {
        if (err) {
            res.json({ success: false, message: '获取停运列车失败' });
        } else {
            res.json({ success: true, trains: trains });
        }
    });
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
