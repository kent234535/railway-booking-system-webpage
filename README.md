# 🚄 Railway Booking System / 火车票预订系统

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Website-blue)](https://railway-booking-system-webpage.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-green)](https://github.com/kent234535/railway-booking-system-webpage)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-blue)](https://www.sqlite.org/)

## 🌐 Live Demo / 在线演示

**Website / 网站地址**: [https://railway-booking-system-webpage.onrender.com/](https://railway-booking-system-webpage.onrender.com/)

## 📖 Description / 项目描述

**English:**
A comprehensive web-based railway ticket booking system built with Node.js, Express, and SQLite. This full-stack application provides a complete solution for train ticket management, including user registration, authentication, ticket searching, booking, and cancellation features.

**中文:**
基于 Node.js、Express 和 SQLite 构建的完整网络火车票预订系统。这个全栈应用程序提供了完整的火车票管理解决方案，包括用户注册、身份验证、车票查询、预订和取消等功能。

## ✨ Features / 功能特性

### 🔐 User Management / 用户管理
- **English**: User registration and login with secure password validation
- **中文**: 用户注册和登录，具有安全的密码验证

### 🎟️ Ticket Management / 票务管理
- **English**: Search trains by departure and arrival stations
- **中文**: 按出发站和到达站搜索列车

- **English**: Real-time seat availability checking
- **中文**: 实时座位可用性检查

- **English**: Ticket booking and cancellation
- **中文**: 车票预订和取消

### 👨‍💼 Admin Features / 管理员功能
- **English**: Admin registration with special access code
- **中文**: 使用特殊访问代码的管理员注册

- **English**: Train management (suspend/resume services)
- **中文**: 列车管理（暂停/恢复服务）

- **English**: User management (ban/unban/delete users)
- **中文**: 用户管理（封禁/解封/删除用户）

### 🔍 Advanced Search / 高级搜索
- **English**: Bidirectional route searching
- **中文**: 双向路线搜索

- **English**: Date-based ticket availability
- **中文**: 基于日期的车票可用性

## 🛠️ Technology Stack / 技术栈

### Backend / 后端
- **Node.js 18.x** - JavaScript runtime environment / JavaScript 运行环境
- **Express.js 4.18.2** - Web application framework / Web 应用程序框架
- **SQLite 5.1.7** - Lightweight database / 轻量级数据库
- **Body-parser** - Request body parsing / 请求体解析

### Frontend / 前端
- **HTML5** - Markup language / 标记语言
- **CSS3** - Styling and layout / 样式和布局
- **JavaScript (ES6+)** - Client-side scripting / 客户端脚本
- **Bootstrap** - Responsive UI framework / 响应式 UI 框架

### Security / 安全性
- **Password encryption** - Secure user authentication / 安全用户身份验证
- **Input validation** - Data sanitization / 数据清理
- **Session management** - User session handling / 用户会话处理

## 🚀 Getting Started / 快速开始

### Prerequisites / 先决条件

**English**: Make sure you have Node.js installed on your machine.

**中文**: 确保您的计算机上安装了 Node.js。

```bash
node --version  # Should be 18.x or higher / 应该是 18.x 或更高版本
npm --version   # Should be 8.x or higher / 应该是 8.x 或更高版本
```

### Installation / 安装

1. **Clone the repository / 克隆仓库**
```bash
git clone https://github.com/kent234535/railway-booking-system-webpage.git
cd railway-booking-system-webpage
```

2. **Navigate to the web directory / 进入 web 目录**
```bash
cd web
```

3. **Install dependencies / 安装依赖项**
```bash
npm install
```

4. **Start the server / 启动服务器**
```bash
npm start
```

5. **Open your browser / 打开浏览器**
```
http://localhost:3000
```

## 📁 Project Structure / 项目结构

```
railway-booking-system-webpage/
├── web/                          # Main application directory / 主应用程序目录
│   ├── public/                   # Static files / 静态文件
│   │   ├── index.html           # Main homepage / 主页
│   │   ├── script.js            # Client-side JavaScript / 客户端 JavaScript
│   │   └── styles.css           # CSS styling / CSS 样式
│   ├── data/                    # JSON data files / JSON 数据文件
│   │   ├── trains.json          # Train information / 列车信息
│   │   ├── stations.json        # Station data / 车站数据
│   │   └── users.json           # User accounts / 用户账户
│   ├── server.js                # Express server / Express 服务器
│   ├── database.js              # Database operations / 数据库操作
│   ├── package.json             # Dependencies / 依赖项
│   └── railway.db               # SQLite database / SQLite 数据库
└── README.md                    # Project documentation / 项目文档
```

## 🔧 API Endpoints / API 接口

### User Authentication / 用户认证
- `POST /api/register` - User registration / 用户注册
- `POST /api/login` - User login / 用户登录
- `POST /api/logout` - User logout / 用户登出

### Train Operations / 列车操作
- `GET /api/search` - Search trains / 搜索列车
- `POST /api/purchase` - Book tickets / 预订车票
- `POST /api/refund` - Cancel tickets / 取消车票

### Admin Operations / 管理员操作
- `POST /api/admin/register` - Admin registration / 管理员注册
- `POST /api/admin/login` - Admin login / 管理员登录
- `POST /api/admin/suspend-train` - Suspend train service / 暂停列车服务
- `POST /api/admin/resume-train` - Resume train service / 恢复列车服务

## 🎯 Usage Examples / 使用示例

### For Regular Users / 普通用户

1. **Register an account / 注册账户**
   - **English**: Click "Register" and fill in your details
   - **中文**: 点击"注册"并填写您的详细信息

2. **Search for trains / 搜索列车**
   - **English**: Enter departure and arrival stations
   - **中文**: 输入出发站和到达站

3. **Book tickets / 预订车票**
   - **English**: Select a train and confirm booking
   - **中文**: 选择列车并确认预订

### For Administrators / 管理员

1. **Admin registration / 管理员注册**
   - **English**: Use access code: `ADMIN2024`
   - **中文**: 使用访问代码：`ADMIN2024`

2. **Manage trains / 管理列车**
   - **English**: Suspend or resume train services
   - **中文**: 暂停或恢复列车服务

## 🌟 Key Features Highlights / 主要功能亮点

### 🔄 Bidirectional Search / 双向搜索
**English**: The system automatically searches for both direct and connecting routes between stations.

**中文**: 系统自动搜索车站之间的直达和换乘路线。

### 💺 Real-time Seat Management / 实时座位管理
**English**: Automatic seat count updates when tickets are booked or cancelled.

**中文**: 预订或取消车票时自动更新座位数量。

### 🛡️ Secure Authentication / 安全认证
**English**: Password requirements include uppercase, lowercase, numbers, and minimum 8 characters.

**中文**: 密码要求包括大写字母、小写字母、数字，最少 8 个字符。

### 📱 Responsive Design / 响应式设计
**English**: Works seamlessly on desktop, tablet, and mobile devices.

**中文**: 在桌面、平板和移动设备上无缝运行。

## 🚀 Deployment / 部署

### Live Deployment / 在线部署
**English**: The application is deployed on Render and accessible at:

**中文**: 应用程序部署在 Render 上，可通过以下地址访问：

🔗 **[https://railway-booking-system-webpage.onrender.com/](https://railway-booking-system-webpage.onrender.com/)**

### Deploy Your Own / 部署您自己的版本

1. **Fork this repository / Fork 此仓库**
2. **Connect to Render / 连接到 Render**
3. **Set build command / 设置构建命令**: `npm install`
4. **Set start command / 设置启动命令**: `npm start`
5. **Set root directory / 设置根目录**: `web`

## 🤝 Contributing / 贡献

**English**: Contributions are welcome! Please feel free to submit a Pull Request.

**中文**: 欢迎贡献！请随时提交拉取请求。

1. Fork the project / Fork 项目
2. Create a feature branch / 创建功能分支
3. Commit your changes / 提交您的更改
4. Push to the branch / 推送到分支
5. Open a Pull Request / 打开拉取请求

## 📝 License / 许可证

**English**: This project is licensed under the MIT License.

**中文**: 此项目使用 MIT 许可证。

## 👨‍💻 Author / 作者

**GitHub**: [@kent234535](https://github.com/kent234535)

## 🙏 Acknowledgments / 致谢

**English**: Thanks to all the open-source libraries and tools that made this project possible.

**中文**: 感谢所有使这个项目成为可能的开源库和工具。

---

⭐ **Star this repository if you found it helpful! / 如果您觉得有帮助，请为此仓库加星！**