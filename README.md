# 🚄 Railway Ticket Booking System — Full-Stack Web App

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Website-blue?style=for-the-badge)](https://railway-booking-system-webpage.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<div align="center">

### 🌐 Language / 语言切换

<a href="#-english">📖 English</a> ｜ <a href="#-简体中文">📖 简体中文</a>

</div>

---

## 📸 Preview / 概览

<div align="center">
<img src="image/overview.png" alt="Railway Booking System Overview" width="800" />
</div>

---

<!-- ==================== ENGLISH ==================== -->

## 📖 English

### Overview

A **full-stack railway ticket booking web application** built with **Node.js**, **Express.js**, and **SQLite**. Features real Chinese railway station network data, bidirectional route search, real-time seat management, user authentication, admin dashboard, and a responsive **Bootstrap** UI. **Deployed live on Render.**

🔗 **Live Demo**: [https://railway-booking-system-webpage.onrender.com/](https://railway-booking-system-webpage.onrender.com/)

### Features

#### 🔐 User Management
- User registration and login with secure password validation
- Account balance management and recharge

#### 🎟️ Ticket Management
- Search trains by departure and arrival stations
- Real-time seat availability checking
- Ticket booking and cancellation

#### 👨‍💼 Admin Features
- Admin registration with special access code
- Train management (suspend / resume services)
- User management (ban / unban / delete users)

#### 🔍 Advanced Search
- Bidirectional route searching
- Date-based ticket availability

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 18.x |
| **Backend** | Express.js 4.18.2 |
| **Database** | SQLite |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 |
| **Deployment** | Render |

### Project Structure

```
railway-booking-system-webpage/
├── README.md
├── LICENSE
├── image/
│   └── overview.png              # Project overview screenshot
└── web/                          # Main application
    ├── server.js                 # Express server entry point
    ├── database.js               # Database operations
    ├── init_data.js              # Data initialization
    ├── import_trains.js          # Train data import utility
    ├── package.json              # Dependencies
    ├── railway.db                # SQLite database (auto-generated)
    ├── public/                   # Static frontend files
    │   ├── index.html            # Main homepage
    │   ├── script.js             # Client-side JavaScript
    │   └── styles.css            # CSS styling
    └── data/                     # JSON seed data
        ├── trains.json           # Train information
        ├── stations.json         # Station network data
        ├── users.json            # User accounts
        ├── admins.json           # Admin accounts
        └── suspended_trains.json # Suspended services
```

### Quick Start

#### Prerequisites
```bash
node --version  # 18.x or higher
npm --version   # 8.x or higher
```

#### Install & Run
```bash
git clone https://github.com/kent234535/railway-booking-system-webpage.git
cd railway-booking-system-webpage/web
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Endpoints

#### User Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | User registration |
| `POST` | `/api/login` | User login |
| `POST` | `/api/logout` | User logout |

#### Train Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search` | Search trains |
| `POST` | `/api/purchase` | Book tickets |
| `POST` | `/api/refund` | Cancel tickets |

#### Admin Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/register` | Admin registration |
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/admin/suspend-train` | Suspend train |
| `POST` | `/api/admin/resume-train` | Resume train |

### Deployment

The app is deployed on **Render**. To deploy your own:

1. Fork this repository
2. Connect to Render
3. Set **root directory**: `web`
4. Set **build command**: `npm install`
5. Set **start command**: `npm start`

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### License

MIT License — see [LICENSE](LICENSE) for details.

---

<!-- ==================== 中文 ==================== -->

## 📖 简体中文

### 项目概述

基于 **Node.js**、**Express.js** 和 **SQLite** 构建的 **全栈火车票在线预订系统**。使用真实中国铁路站点网络数据，支持双向路线搜索、实时座位管理、用户注册与安全认证、车票预订与退票、余额管理，以及管理员后台列车调度控制。前端采用响应式 **Bootstrap** UI，已部署至 **Render** 平台。

🔗 **在线体验**: [https://railway-booking-system-webpage.onrender.com/](https://railway-booking-system-webpage.onrender.com/)

### 功能特性

#### 🔐 用户管理
- 用户注册和登录，安全密码验证
- 账户余额管理与充值

#### 🎟️ 票务管理
- 按出发站和到达站搜索列车
- 实时座位可用性检查
- 车票预订与取消

#### 👨‍💼 管理员功能
- 使用特殊访问代码的管理员注册
- 列车管理（暂停/恢复服务）
- 用户管理（封禁/解封/删除用户）

#### 🔍 高级搜索
- 双向路线搜索
- 基于日期的车票可用性查询

### 技术栈

| 层级 | 技术 |
|------|------|
| **运行时** | Node.js 18.x |
| **后端** | Express.js 4.18.2 |
| **数据库** | SQLite |
| **前端** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 |
| **部署** | Render |

### 项目结构

```
railway-booking-system-webpage/
├── README.md
├── LICENSE
├── image/
│   └── overview.png              # 项目概览截图
└── web/                          # 主应用目录
    ├── server.js                 # Express 服务器入口
    ├── database.js               # 数据库操作
    ├── init_data.js              # 数据初始化
    ├── import_trains.js          # 列车数据导入工具
    ├── package.json              # 依赖项
    ├── railway.db                # SQLite 数据库（自动生成）
    ├── public/                   # 静态前端文件
    │   ├── index.html            # 主页
    │   ├── script.js             # 客户端 JavaScript
    │   └── styles.css            # CSS 样式
    └── data/                     # JSON 种子数据
        ├── trains.json           # 列车信息
        ├── stations.json         # 站点网络数据
        ├── users.json            # 用户账户
        ├── admins.json           # 管理员账户
        └── suspended_trains.json # 停运列车
```

### 快速开始

#### 前置要求
```bash
node --version  # 18.x 或更高
npm --version   # 8.x 或更高
```

#### 安装 & 运行
```bash
git clone https://github.com/kent234535/railway-booking-system-webpage.git
cd railway-booking-system-webpage/web
npm install
npm start
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

### API 接口

#### 用户认证
| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/api/register` | 用户注册 |
| `POST` | `/api/login` | 用户登录 |
| `POST` | `/api/logout` | 用户登出 |

#### 列车操作
| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/api/search` | 搜索列车 |
| `POST` | `/api/purchase` | 预订车票 |
| `POST` | `/api/refund` | 取消车票 |

#### 管理员操作
| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/api/admin/register` | 管理员注册 |
| `POST` | `/api/admin/login` | 管理员登录 |
| `POST` | `/api/admin/suspend-train` | 暂停列车服务 |
| `POST` | `/api/admin/resume-train` | 恢复列车服务 |

### 部署

应用已部署在 **Render** 上。部署你自己的版本：

1. Fork 此仓库
2. 连接到 Render
3. 设置 **根目录**: `web`
4. 设置 **构建命令**: `npm install`
5. 设置 **启动命令**: `npm start`

### 贡献指南
1. Fork 此仓库
2. 创建功能分支 (`git checkout -b feature/amazing`)
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 许可证

MIT 许可证 — 详见 [LICENSE](LICENSE)。

---

## 🏷️ Keywords

`railway booking system` · `train ticket` · `Node.js` · `Express.js` · `SQLite` · `full-stack` · `web application` · `REST API` · `Bootstrap` · `real-time seat management` · `火车票预订` · `全栈应用`

---

<div align="center">

⭐ **Star this repo if you find it useful!** ⭐

</div>
