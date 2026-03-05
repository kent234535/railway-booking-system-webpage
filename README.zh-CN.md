<div align="center">

# 🚄 铁路售票系统

### 基于 Node.js 和 SQLite 的全栈 Web 应用

一个全栈铁路售票 Web 应用，集成真实中国铁路站点网络数据、双向路线搜索和响应式 Bootstrap UI

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-数据库-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![🔗 在线演示 — 访问网站](https://img.shields.io/badge/🔗_在线演示-访问网站-brightgreen?style=for-the-badge&logo=render&logoColor=white)](https://railway-booking-system-webpage.onrender.com/)

[功能特性](#功能特性) · [系统预览](#-系统预览) · [技术栈](#技术栈) · [快速开始](#快速开始) · [API 接口](#api-接口) · [部署](#部署) · [许可证](#许可证)

[![ENGLISH](https://img.shields.io/badge/ENGLISH-gray?style=for-the-badge)](README.md)
[![简体中文](https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-blue?style=for-the-badge)](README.zh-CN.md)

</div>

---

> 一个基于 **Node.js**、**Express.js** 和 **SQLite** 的**全栈铁路售票 Web 应用**。集成真实中国铁路站点网络数据，支持双向路线搜索、实时座位管理、用户认证、管理员后台和响应式 **Bootstrap** UI。**已部署于 Render 平台。**

---

## 📸 系统预览

<div align="center">
<img src="image/overview.png" alt="铁路售票系统概览" width="800" />
</div>

## 功能特性

#### 🔐 用户管理
- 用户注册与登录，安全密码验证
- 账户余额管理与充值

#### 🎟️ 购票管理
- 按出发站和到达站搜索列车
- 实时座位余量查询
- 购票与退票

#### 👨‍💼 管理员功能
- 管理员注册（需特殊访问码）
- 列车管理（停运 / 恢复运行）
- 用户管理（封禁 / 解封 / 删除用户）

#### 🔍 高级搜索
- 双向路线搜索
- 按日期查询余票

## 技术栈

| 层级 | 技术 |
|------|------|
| **运行时** | Node.js 18.x |
| **后端** | Express.js 4.18.2 |
| **数据库** | SQLite |
| **前端** | HTML5、CSS3、JavaScript (ES6+)、Bootstrap 5 |
| **部署** | Render |

## 项目结构

```
railway-booking-system-webpage/
├── README.md                         # 英文 README
├── README.zh-CN.md                   # 中文 README
├── LICENSE
├── new_trains.txt                    # 列车时刻数据
├── image/
│   └── overview.png                  # 项目概览截图
├── data-plaintext/                   # 纯文本种子数据
└── web/                              # 主应用目录
    ├── server.js                     # Express 服务器入口
    ├── database.js                   # 数据库操作模块
    ├── package.json                  # 依赖配置
    ├── railway.db                    # SQLite 数据库（自动生成）
    ├── public/                       # 前端静态文件
    │   ├── index.html                # 主页
    │   ├── script.js                 # 客户端脚本
    │   └── styles.css                # 样式表
    ├── data/                         # JSON 种子数据
    │   ├── trains.json
    │   ├── stations.json
    │   ├── users.json
    │   ├── admins.json
    │   └── suspended_trains.json
    ├── scripts/                      # 工具与启动脚本
    └── tests/                        # 测试与调试文件
```

## 快速开始

### 环境要求
```bash
node --version  # 18.x 或更高
npm --version   # 8.x 或更高
```

### 安装与运行
```bash
git clone https://github.com/kent234535/railway-booking-system-webpage.git
cd railway-booking-system-webpage/web
npm install
npm start
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## API 接口

#### 用户认证
| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/register` | 用户注册 |
| `POST` | `/api/login` | 用户登录 |
| `POST` | `/api/logout` | 用户登出 |

#### 列车操作
| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/search` | 搜索列车 |
| `POST` | `/api/purchase` | 购买车票 |
| `POST` | `/api/refund` | 退票 |

#### 管理员操作
| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/admin/register` | 管理员注册 |
| `POST` | `/api/admin/login` | 管理员登录 |
| `POST` | `/api/admin/suspend-train` | 停运列车 |
| `POST` | `/api/admin/resume-train` | 恢复列车运行 |

## 部署

应用已部署在 **Render** 平台。如需自行部署：

1. Fork 本仓库
2. 连接到 Render
3. 设置**根目录**：`web`
4. 设置**构建命令**：`npm install`
5. 设置**启动命令**：`npm start`

## 贡献指南
1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing`）
3. 提交更改
4. 推送到分支
5. 发起 Pull Request

## 许可证

MIT 许可证 — 详情请查看 [LICENSE](LICENSE)。

---

<div align="center">

`铁路售票系统` · `火车票预订` · `Node.js` · `Express.js` · `SQLite` · `全栈应用` · `Web应用` · `REST API` · `Bootstrap` · `railway booking`

⭐ **如果觉得有用，请给个 Star！** ⭐

</div>
