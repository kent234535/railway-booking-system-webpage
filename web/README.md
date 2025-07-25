# 火车票预订系统 - Web版

这是基于原有Qt桌面应用程序的Web版本火车票预订系统。

## 功能特性

### 用户功能
- 用户注册和登录
- 查询车票（按出发站和到达站）
- 购买车票
- 查看个人行程
- 账户余额管理和充值

### 管理员功能
- 管理员登录
- 查看所有用户信息
- 列车运行状态管理（停运/恢复）
- 用户行程统计

## 技术栈

- **后端**: Node.js + Express
- **前端**: HTML5 + CSS3 + JavaScript + Bootstrap 5
- **数据存储**: SQLite 数据库
- **UI框架**: Bootstrap 5
- **图标**: Font Awesome

## 安装和运行

### 前提条件
- Node.js (版本 14 或更高)
- npm

### 安装步骤

1. 进入项目目录：
```bash
cd web
```

2. 安装依赖：
```bash
npm install
```

3. 启动服务器：
```bash
npm start
```

或者使用启动脚本（推荐）：
```bash
start.bat
```

或者使用开发模式（自动重启）：
```bash
npm run dev
```

4. 打开浏览器访问：
```
http://localhost:3000
```

## 默认账户

### 测试用户
- 用户名: `k`
- 密码: `k`
- 余额: ￥5937

### 管理员账户
- 用户名: `admin`
- 密码: `admin123`

## 数据存储

系统使用SQLite数据库存储数据，运行后会在 `web/` 目录下创建 `railway.db` 数据库文件，包含以下数据表：
- `users` - 用户数据
- `admins` - 管理员数据
- `trains` - 列车数据
- `user_trips` - 用户行程记录
- `suspended_trains` - 停运列车列表
- `stations` - 站点距离数据

## 项目结构

```
web/
├── server.js              # 服务器主文件
├── database.js            # 数据库模块
├── package.json           # 依赖配置
├── start.bat              # 启动脚本
├── public/                # 静态文件目录
│   ├── index.html        # 主页面
│   ├── styles.css        # 样式文件
│   └── script.js         # 前端JavaScript
└── railway.db            # SQLite数据库文件（运行时创建）
```

## API接口

### 用户相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /api/user/:username` - 获取用户信息
- `POST /api/recharge` - 充值

### 车票相关
- `GET /api/trains` - 获取所有列车
- `POST /api/search` - 查询车票
- `POST /api/purchase` - 购买车票

### 管理员相关
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/users` - 获取所有用户
- `POST /api/admin/suspend-train` - 停运列车
- `POST /api/admin/resume-train` - 恢复列车
- `GET /api/admin/suspended-trains` - 获取停运列车列表

## 主要改进

相比原Qt版本，Web版本具有以下改进：

1. **跨平台兼容性**: 可在任何支持Web浏览器的设备上运行
2. **现代化UI**: 使用Bootstrap 5响应式设计
3. **实时更新**: 无需重新编译，即时生效
4. **易于部署**: 可部署到任何支持Node.js的服务器
5. **RESTful API**: 清晰的API设计，便于扩展
6. **移动端友好**: 响应式设计，支持手机和平板

## 开发说明

### 添加新功能
1. 在 `server.js` 中添加新的API路由
2. 在 `public/script.js` 中添加前端逻辑
3. 在 `public/index.html` 中添加UI组件
4. 在 `public/styles.css` 中添加样式

### 数据结构
系统使用JSON文件存储数据，结构与原Qt版本保持兼容。

## 注意事项

1. 这是一个演示版本，生产环境使用需要添加：
   - 用户认证和会话管理
   - 数据加密
   - 错误处理增强
   - 数据库支持
   - 缓存机制

2. 默认端口为3000，如需修改可在 `server.js` 中更改PORT变量

3. 数据文件在首次运行时自动创建，包含示例数据

## 许可证

MIT License
