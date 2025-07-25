// 全局变量
let currentUser = null;
let currentAdmin = null;
let currentPurchaseData = null;
let allStations = [
    "北京", "成都", "重庆", "福州", "广州", "贵阳", "杭州", "合肥", "济南", "昆明", "兰州", "南昌", "南京", "南宁", "上海", "石家庄", "太原", "武汉", "西安", "长沙", "郑州"
];

// 密码格式验证
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

// 身份证号格式验证
function validateIdNumber(idNumber) {
    const idRegex = /^[0-9A-Za-z]{18}$/;
    return idRegex.test(idNumber);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    loadStations();
    setupEventListeners();
    updateNavbar();
    setDefaultDate();
}

// 设置默认日期为今天
function setDefaultDate() {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const dateInput = document.getElementById('departureDate');
    if (dateInput) {
        dateInput.value = dateString;
        dateInput.min = dateString; // 不允许选择过去的日期
    }
}

// 加载所有站点
async function loadStations() {
    try {
        const response = await fetch('/api/trains');
        const data = await response.json();
        
        if (!data.success || !data.trains) {
            console.error('获取列车信息失败:', data.message);
            // 即使API失败，也使用预定义的站点列表
            populateStationSelects();
            return;
        }
        
        const trains = data.trains;
        const stationsSet = new Set(allStations); // 使用预定义的站点列表
        trains.forEach(train => {
            train.stations.forEach(station => {
                stationsSet.add(station);
            });
        });
        
        allStations = Array.from(stationsSet).sort((a, b) => a.localeCompare(b, 'zh-CN'));
        populateStationSelects();
    } catch (error) {
        console.error('加载站点失败:', error);
        // 即使API失败，也使用预定义的站点列表
        populateStationSelects();
    }
}

// 填充站点选择框
function populateStationSelects() {
    const startSelect = document.getElementById('startStation');
    const endSelect = document.getElementById('endStation');
    
    if (startSelect && endSelect) {
        // 清空现有选项
        startSelect.innerHTML = '<option value="">请选择出发站</option>';
        endSelect.innerHTML = '<option value="">请选择到达站</option>';
        
        allStations.forEach(station => {
            const option1 = new Option(station, station);
            const option2 = new Option(station, station);
            startSelect.add(option1);
            endSelect.add(option2);
        });
        
        // 添加联动逻辑
        startSelect.addEventListener('change', function() {
            updateEndStationOptions();
        });
        
        endSelect.addEventListener('change', function() {
            updateStartStationOptions();
        });
    }
}

// 更新到达站选项（排除已选择的出发站）
function updateEndStationOptions() {
    const startStation = document.getElementById('startStation').value;
    const endSelect = document.getElementById('endStation');
    const currentEndValue = endSelect.value;
    
    // 重新填充到达站选项
    endSelect.innerHTML = '<option value="">请选择到达站</option>';
    allStations.forEach(station => {
        if (station !== startStation) {
            const option = new Option(station, station);
            endSelect.add(option);
        }
    });
    
    // 恢复之前的选择（如果还有效）
    if (currentEndValue && currentEndValue !== startStation) {
        endSelect.value = currentEndValue;
    }
}

// 更新出发站选项（排除已选择的到达站）
function updateStartStationOptions() {
    const endStation = document.getElementById('endStation').value;
    const startSelect = document.getElementById('startStation');
    const currentStartValue = startSelect.value;
    
    // 重新填充出发站选项
    startSelect.innerHTML = '<option value="">请选择出发站</option>';
    allStations.forEach(station => {
        if (station !== endStation) {
            const option = new Option(station, station);
            startSelect.add(option);
        }
    });
    
    // 恢复之前的选择（如果还有效）
    if (currentStartValue && currentStartValue !== endStation) {
        startSelect.value = currentStartValue;
    }
}

// 计算历时
function calculateDuration(departureTime, arrivalTime) {
    const [depHour, depMin] = departureTime.split(':').map(Number);
    const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
    
    let depMinutes = depHour * 60 + depMin;
    let arrMinutes = arrHour * 60 + arrMin;
    
    // 处理跨天情况
    if (arrMinutes < depMinutes) {
        arrMinutes += 24 * 60; // 加一天
    }
    
    const durationMinutes = arrMinutes - depMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}小时${minutes}分钟`;
}

// 设置事件监听器
function setupEventListeners() {
    // 用户登录表单
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', handleUserLogin);
    }

    // 用户注册表单
    const userRegisterForm = document.getElementById('userRegisterForm');
    if (userRegisterForm) {
        userRegisterForm.addEventListener('submit', handleUserRegister);
    }

    // 管理员登录表单
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // 管理员注册表单
    const adminRegisterForm = document.getElementById('adminRegisterForm');
    if (adminRegisterForm) {
        adminRegisterForm.addEventListener('submit', handleAdminRegister);
    }

    // 查询表单
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // 充值表单
    const rechargeForm = document.getElementById('rechargeForm');
    if (rechargeForm) {
        rechargeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            rechargeAccount();
        });
    }
}

// 显示不同的界面
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
    }
}

function showStartScreen() {
    showScreen('startScreen');
    updateNavbar();
}

function showUserLogin() {
    showScreen('userLoginScreen');
}

function showUserRegister() {
    showScreen('userRegisterScreen');
}

function showAdminLogin() {
    showScreen('adminLoginScreen');
}

function showAdminRegister() {
    showScreen('adminRegisterScreen');
}

function showUserMain() {
    showScreen('userMainScreen');
    loadUserTrips();
    updateNavbar();
}

function showAdminMain() {
    showScreen('adminMainScreen');
    loadTrainManagement();
    loadUserManagement();
    updateNavbar();
}

// 更新导航栏
function updateNavbar() {
    const navbarContent = document.getElementById('navbarContent');
    
    if (currentUser) {
        navbarContent.innerHTML = `
            <span class="navbar-text me-3">欢迎，${currentUser.name}</span>
            <button class="btn btn-outline-light btn-sm" onclick="logout()">退出</button>
        `;
    } else if (currentAdmin) {
        navbarContent.innerHTML = `
            <span class="navbar-text me-3">管理员：${currentAdmin.name}</span>
            <button class="btn btn-outline-light btn-sm" onclick="logout()">退出</button>
        `;
    } else {
        navbarContent.innerHTML = '';
    }
}

// 用户登录处理
async function handleUserLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            updateUserInfo();
            showUserMain();
            showAlert('登录成功', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('登录失败，请重试', 'danger');
    }
}

// 用户注册处理
async function handleUserRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value;
    const idNumber = document.getElementById('regIdNumber').value;
    
    // 前端验证
    if (!validatePassword(password)) {
        showAlert('密码格式不符合要求：不少于8位，必须包含数字、大写字母和小写字母', 'danger');
        return;
    }
    
    if (!validateIdNumber(idNumber)) {
        showAlert('身份证号格式不正确：必须为18位字符（数字或字母）', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, name, idNumber }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('注册成功，请登录', 'success');
            showUserLogin();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('注册失败，请重试', 'danger');
    }
}

// 管理员登录处理
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentAdmin = result.admin;
            document.getElementById('adminName').textContent = currentAdmin.name;
            showAdminMain();
            showAlert('管理员登录成功', 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('登录失败，请重试', 'danger');
    }
}

// 管理员注册处理
async function handleAdminRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminRegUsername').value;
    const password = document.getElementById('adminRegPassword').value;
    const name = document.getElementById('adminRegName').value;
    const adminCode = document.getElementById('adminRegCode').value;
    
    // 前端验证
    if (!validatePassword(password)) {
        showAlert('密码格式不符合要求：不少于8位，必须包含数字、大写字母和小写字母', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, name, adminCode }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('管理员注册成功，请登录', 'success');
            showAdminLogin();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('管理员注册失败，请重试', 'danger');
    }
}

// 更新用户信息显示
function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userIdNumber').textContent = currentUser.idNumber;
        document.getElementById('userBalance').textContent = `￥${currentUser.balance.toFixed(2)}`;
    }
}

// 查询车票处理
async function handleSearch(e) {
    e.preventDefault();
    
    const startStation = document.getElementById('startStation').value;
    const endStation = document.getElementById('endStation').value;
    const departureTime = document.getElementById('departureTime')?.value || '';  // 可选的出发时间筛选
    
    // 验证输入
    if (!startStation || !endStation) {
        showAlert('请填写完整的出发站和到达站', 'warning');
        return;
    }
    
    if (startStation === endStation) {
        showAlert('出发站和到达站不能相同', 'warning');
        return;
    }
    
    // 检查时间是否有效 - 注意：这里移除了对departureDate的引用，因为我们使用departureTime
    if (departureTime) {
        console.log('设置了出发时间筛选:', departureTime);
    }
    
    try {
        // 显示加载状态
        const resultsContainer = document.getElementById('searchResults');
        const resultsBody = document.getElementById('searchResultsBody');
        resultsBody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-spinner fa-spin"></i> 正在查询车票...</td></tr>';
        resultsContainer.style.display = 'block';
        
        // 调试信息
        console.log('发送搜索请求:', { startStation, endStation, departureTime });
        
        // 同时获取停运列车信息
        const [searchResponse, suspendedResponse] = await Promise.all([
            fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    startStation, 
                    endStation, 
                    departureTime  // 注意：这里使用时间而不是日期进行查询，符合C++版本的逻辑
                }),
            }),
            fetch('/api/admin/suspended-trains')
        ]);
        
        const results = await searchResponse.json();
        const suspendedResponse2 = await suspendedResponse.json();
        
        // 调试信息
        console.log('搜索结果:', results);
        console.log('停运列车:', suspendedResponse2);
        
        // 检查API响应是否成功
        if (!results.success) {
            showAlert(results.message || '查询失败', 'danger');
            return;
        }
        
        // 正确提取数据
        const trainsData = results.trains || [];
        const suspendedTrainsData = suspendedResponse2.success ? (suspendedResponse2.trains || []) : [];
        
        // 提取停运列车的车次号
        const suspendedTrainNumbers = suspendedTrainsData.map(train => train.trainNumber || train);
        
        displaySearchResults(trainsData, startStation, endStation, suspendedTrainNumbers);
    } catch (error) {
        showAlert('查询失败，请重试', 'danger');
        console.error('查询错误:', error);
    }
}

// 显示查询结果
function displaySearchResults(trainsData, startStation, endStation, suspendedTrains = []) {
    const resultsContainer = document.getElementById('searchResults');
    const resultsBody = document.getElementById('searchResultsBody');
    const resultCount = document.getElementById('resultCount');
    
    console.log('显示搜索结果，数据:', trainsData);
    console.log('停运列车:', suspendedTrains);
    
    if (!trainsData || trainsData.length === 0) {
        resultsBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <i class="fas fa-search text-muted fs-1"></i>
                    <p class="mt-2 text-muted">没有找到从 <strong>${startStation}</strong> 到 <strong>${endStation}</strong> 的列车</p>
                    <small class="text-muted">请尝试选择其他出发站或到达站，或调整出发时间</small>
                </td>
            </tr>
        `;
        resultCount.textContent = '0';
    } else {
        // 按出发时间排序
        trainsData.sort((a, b) => {
            return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
        });
        
        resultsBody.innerHTML = trainsData.map((train, index) => {
            console.log(`处理车次 ${index + 1}:`, train);
            
            // 安全地获取数据，提供默认值
            const trainNumber = train.trainNumber || '未知';
            const departureTime = train.departureTime || '未知';
            const arrivalTime = train.arrivalTime || '未知';
            const availableSeats = train.availableSeats !== undefined ? train.availableSeats : 0;
            const price = train.price !== undefined ? train.price : 0;
            
            // 检查是否为停运列车
            const isSuspended = suspendedTrains.includes(trainNumber);
            
            const seatText = isSuspended ? '已停开' : (availableSeats > 0 ? availableSeats : '无票');
            const seatClass = isSuspended ? 'text-muted' : (availableSeats > 0 ? 'text-success' : 'text-danger');
            
            // 计算历时
            let durationText = '未知';
            if (departureTime !== '未知' && arrivalTime !== '未知') {
                const depMinutes = timeToMinutes(departureTime);
                const arrMinutes = timeToMinutes(arrivalTime);
                let duration = arrMinutes - depMinutes;
                if (duration < 0) duration += 24 * 60; // 跨天处理
                const durationHours = Math.floor(duration / 60);
                const durationMins = duration % 60;
                durationText = `${durationHours}小时${durationMins}分钟`;
            }
            
            // 停运列车样式
            const rowClass = isSuspended ? 'table-secondary text-muted' : (index % 2 === 0 ? 'table-light' : '');
            const textClass = isSuspended ? 'text-muted' : '';
            
            return `
                <tr class="align-middle ${rowClass}">
                    <td><strong class="${isSuspended ? 'text-muted' : 'text-primary'}">${trainNumber}</strong></td>
                    <td><strong class="${textClass}">${startStation}</strong></td>
                    <td><strong class="${textClass}">${endStation}</strong></td>
                    <td><span class="${isSuspended ? 'text-muted' : 'text-primary'}">${departureTime}</span></td>
                    <td><span class="${isSuspended ? 'text-muted' : 'text-success'}">${arrivalTime}</span></td>
                    <td><span class="text-muted">${durationText}</span></td>
                    <td><span class="${seatClass}">${seatText}</span></td>
                    <td><strong class="${isSuspended ? 'text-muted' : 'text-danger'}">¥${price}</strong></td>
                    <td>
                        ${isSuspended ? 
                            '<button class="btn btn-secondary btn-sm" disabled><i class="fas fa-ban me-1"></i>已停开</button>' :
                            (availableSeats > 0 ? 
                                `<button class="btn btn-primary btn-sm" onclick="showPurchaseModal('${trainNumber}', '${startStation}', '${endStation}', '${departureTime}', '${arrivalTime}', ${price})">
                                    <i class="fas fa-ticket-alt me-1"></i>购买
                                </button>` :
                                '<button class="btn btn-secondary btn-sm" disabled><i class="fas fa-times me-1"></i>售完</button>'
                            )
                        }
                    </td>
                </tr>
            `;
        }).join('');
        
        resultCount.textContent = trainsData.length;
    }
    
    resultsContainer.style.display = 'block';
}

// 辅助函数：时间字符串转换为分钟数
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    
    let normalizedTime = timeStr;
    
    // 处理不同的时间格式
    if (timeStr.length === 4 && timeStr[1] === ':') {
        // 格式 "3:45" -> "03:45"
        normalizedTime = "0" + timeStr;
    } else if (timeStr.length === 3 && timeStr.indexOf(':') === -1) {
        // 格式 "345" -> "03:45"
        normalizedTime = "0" + timeStr.substring(0, 1) + ":" + timeStr.substring(1, 3);
    } else if (timeStr.length === 4 && timeStr.indexOf(':') === -1) {
        // 格式 "1345" -> "13:45"
        normalizedTime = timeStr.substring(0, 2) + ":" + timeStr.substring(2, 4);
    }
    
    if (normalizedTime.length !== 5 || normalizedTime[2] !== ':') {
        return 0; // 无效时间格式，返回0
    }
    
    try {
        const hours = parseInt(normalizedTime.substring(0, 2), 10);
        const minutes = parseInt(normalizedTime.substring(3, 5), 10);
        return hours * 60 + minutes;
    } catch (e) {
        return 0; // 解析失败，返回0
    }
}

// 计算每公里票价
function calculatePricePerKm(price, segments) {
    // 假设每个站点之间的平均距离是50公里
    const estimatedDistance = segments * 50;
    const pricePerKm = (price / estimatedDistance).toFixed(2);
    return `${pricePerKm} 元/公里`;
}

// 获取列车类型描述
function getTrainType(trainNumber) {
    const prefix = trainNumber.charAt(0);
    switch (prefix) {
        case 'G': return '高速铁路';
        case 'D': return '动车组';
        case 'C': return '城际铁路';
        case 'Z': return '直达特快';
        case 'T': return '特快列车';
        case 'K': return '快速列车';
        default: return '普通列车';
    }
}

// 计算行程时间
function calculateDuration(departureTime, arrivalTime) {
    const departureMinutes = timeToMinutes(departureTime);
    let arrivalMinutes = timeToMinutes(arrivalTime);
    
    // 处理跨天情况
    if (arrivalMinutes < departureMinutes) {
        arrivalMinutes += 24 * 60; // 加上24小时
    }
    
    const durationMinutes = arrivalMinutes - departureMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0) {
        return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
    } else {
        return `${minutes}分钟`;
    }
}

// 显示购票模态框
function showPurchaseModal(trainNumber, startStation, endStation, departureTime, arrivalTime, price) {
    currentPurchaseData = {
        trainNumber,
        startStation,
        endStation,
        departureTime,
        arrivalTime,
        price
    };
    
    const purchaseDetails = document.getElementById('purchaseDetails');
    purchaseDetails.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <strong>车次：</strong> ${trainNumber}<br>
                <strong>出发站：</strong> ${startStation}<br>
                <strong>到达站：</strong> ${endStation}
            </div>
            <div class="col-md-6">
                <strong>出发时间：</strong> ${departureTime}<br>
                <strong>到达时间：</strong> ${arrivalTime}<br>
                <strong>票价：</strong> ￥${price}<br>
                <strong>当前余额：</strong> ￥${currentUser.balance.toFixed(2)}
            </div>
        </div>
        <hr>
        <div class="alert ${currentUser.balance >= price ? 'alert-success' : 'alert-danger'}">
            ${currentUser.balance >= price ? '余额充足，可以购买' : '余额不足，请先充值'}
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('purchaseModal'));
    modal.show();
}

// 确认购票
async function confirmPurchase() {
    if (!currentPurchaseData || currentUser.balance < currentPurchaseData.price) {
        showAlert('余额不足，无法购买', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: currentUser.username,
                ...currentPurchaseData
            }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser.balance = result.balance;
            updateUserInfo();
            loadUserTrips();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
            modal.hide();
            
            showAlert('购票成功', 'success');
            
            // 重新查询以更新余票信息
            handleSearch(new Event('submit'));
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('购票失败，请重试', 'danger');
    }
}

// 加载用户行程
async function loadUserTrips() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/user/${currentUser.username}`);
        const data = await response.json();
        
        if (!data.success || !data.user) {
            console.error('获取用户信息失败:', data.message);
            return;
        }
        
        const user = data.user;
        const tripsBody = document.getElementById('tripsBody');
        if (user.trips && user.trips.length > 0) {
            tripsBody.innerHTML = user.trips.map(trip => {
                // 计算历时
                let durationText = '未知';
                if (trip.departureTime && trip.arrivalTime) {
                    const depMinutes = timeToMinutes(trip.departureTime);
                    const arrMinutes = timeToMinutes(trip.arrivalTime);
                    let duration = arrMinutes - depMinutes;
                    if (duration < 0) duration += 24 * 60; // 跨天处理
                    const durationHours = Math.floor(duration / 60);
                    const durationMins = duration % 60;
                    durationText = `${durationHours}小时${durationMins}分钟`;
                }
                
                return `
                <tr>
                    <td><strong>${trip.trainNumber}</strong></td>
                    <td>${trip.route}</td>
                    <td>${trip.departureTime}</td>
                    <td>${trip.arrivalTime || '未知'}</td>
                    <td>${durationText}</td>
                    <td>￥${trip.price}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="showRefundModal('${trip.id}', '${trip.trainNumber}', '${trip.route}', ${trip.price})">
                            <i class="fas fa-undo me-1"></i>退票
                        </button>
                    </td>
                </tr>`;
            }).join('');
        } else {
            tripsBody.innerHTML = '<tr><td colspan="7" class="text-center">暂无行程记录</td></tr>';
        }
    } catch (error) {
        console.error('加载行程失败:', error);
    }
}

// 显示充值模态框
function showRechargeModal() {
    const modal = new bootstrap.Modal(document.getElementById('rechargeModal'));
    modal.show();
}

// 显示退票模态框
function showRefundModal(tripId, trainNumber, route, price) {
    window.currentRefundData = {
        tripId,
        trainNumber,
        route,
        price
    };
    
    const refundAmount = Math.floor(price * 0.8);
    const refundDetails = document.getElementById('refundDetails');
    refundDetails.innerHTML = `
        <div class="row">
            <div class="col-12">
                <strong>车次：</strong> ${trainNumber}<br>
                <strong>路线：</strong> ${route}<br>
                <strong>原票价：</strong> ￥${price}<br>
                <strong>退款金额：</strong> ￥${refundAmount} (按票价80%退款)<br>
                <strong>当前余额：</strong> ￥${currentUser.balance.toFixed(2)}
            </div>
        </div>
        <hr>
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>注意：</strong>退票后将按照票价的80%返还到您的账户余额中，退票后无法恢复。
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('refundModal'));
    modal.show();
}

// 确认退票
async function confirmRefund() {
    if (!window.currentRefundData) {
        showAlert('退票信息错误', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/refund', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: currentUser.username,
                tripId: window.currentRefundData.tripId
            }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser.balance = result.balance;
            updateUserInfo();
            loadUserTrips();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('refundModal'));
            modal.hide();
            
            showAlert(result.message, 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('退票失败，请重试', 'danger');
    }
}

// 充值账户
async function rechargeAccount() {
    const amount = parseFloat(document.getElementById('rechargeAmount').value);
    
    if (!amount || amount <= 0) {
        showAlert('请输入有效的充值金额', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/recharge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: currentUser.username,
                amount: amount
            }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser.balance = result.balance;
            updateUserInfo();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('rechargeModal'));
            modal.hide();
            
            document.getElementById('rechargeAmount').value = '';
            showAlert(`充值成功，当前余额：￥${result.balance.toFixed(2)}`, 'success');
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('充值失败，请重试', 'danger');
    }
}

// 加载列车管理
async function loadTrainManagement() {
    try {
        const [trainsResponse, suspendedResponse] = await Promise.all([
            fetch('/api/trains'),
            fetch('/api/admin/suspended-trains')
        ]);
        
        const trainsData = await trainsResponse.json();
        const suspendedData = await suspendedResponse.json();
        
        // 检查API响应格式 - 修正这里的问题
        const trains = trainsData.success ? trainsData.trains : [];
        const suspended = suspendedData.success ? suspendedData.trains : [];
        
        const trainManagementBody = document.getElementById('trainManagementBody');
        
        // 创建显示列车列表
        const displayTrains = trains.map(train => {
            const isRunning = !suspended.includes(train.trainNumber);
            
            return {
                trainNumber: train.trainNumber,
                route: `${train.stations[0]} → ${train.stations[train.stations.length - 1]}`,
                isRunning
            };
        });
        
        trainManagementBody.innerHTML = displayTrains.map(train => `
            <tr>
                <td><strong>${train.trainNumber}</strong></td>
                <td>${train.route}</td>
                <td>
                    <span class="badge ${train.isRunning ? 'bg-success' : 'bg-danger'}">
                        ${train.isRunning ? '正常运行' : '已停运'}
                    </span>
                </td>
                <td>
                    ${train.isRunning ? 
                        `<button class="btn btn-warning btn-sm" onclick="suspendTrain('${train.trainNumber}')">停运</button>` :
                        `<button class="btn btn-success btn-sm" onclick="resumeTrain('${train.trainNumber}')">恢复</button>`
                    }
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载列车管理失败:', error);
        const trainManagementBody = document.getElementById('trainManagementBody');
        trainManagementBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">加载列车信息失败</td></tr>';
    }
}

// 停运列车
async function suspendTrain(trainNumber) {
    try {
        const response = await fetch('/api/admin/suspend-train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trainNumber }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            loadTrainManagement();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('操作失败，请重试', 'danger');
    }
}

// 恢复列车
async function resumeTrain(trainNumber) {
    try {
        const response = await fetch('/api/admin/resume-train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trainNumber }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            loadTrainManagement();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('操作失败，请重试', 'danger');
    }
}

// 退出登录
function logout() {
    currentUser = null;
    currentAdmin = null;
    showStartScreen();
    showAlert('已退出登录', 'info');
}

// 显示提示信息
function showAlert(message, type = 'info') {
    // 移除现有的提示
    const existingAlert = document.querySelector('.alert-floating');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 创建新的提示
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show alert-floating`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // 3秒后自动消失
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}


// 管理员功能 - 加载用户管理
async function loadUserManagement() {
    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        
        if (!data.success || !data.users) {
            console.error('获取用户列表失败:', data.message);
            return;
        }
        
        const users = data.users;
        const userManagementBody = document.getElementById('userManagementBody');
        userManagementBody.innerHTML = users.map(user => {
            const isBanned = user.banned;
            const statusText = isBanned ? '已封禁' : '正常';
            const statusClass = isBanned ? 'text-danger' : 'text-success';
            
            return `
                <tr>
                    <td><strong>${user.username}</strong></td>
                    <td>${user.name}</td>
                    <td>${user.idNumber}</td>
                    <td>￥${user.balance.toFixed(2)}</td>
                    <td>${user.tripCount || 0}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="btn-group" role="group">
                            ${isBanned ? 
                                `<button class="btn btn-success btn-sm" onclick="unbanUser('${user.username}')" title="解封用户">
                                    <i class="fas fa-unlock"></i>
                                </button>` :
                                `<button class="btn btn-warning btn-sm" onclick="banUser('${user.username}')" title="封禁用户">
                                    <i class="fas fa-ban"></i>
                                </button>`
                            }
                            <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.username}')" title="删除用户">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('加载用户管理失败:', error);
    }
}

// 管理员功能 - 停运列车
async function suspendTrain(trainNumber) {
    if (!confirm(`确定要停运列车 ${trainNumber} 吗？`)) return;
    
    try {
        const response = await fetch('/api/admin/suspend-train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trainNumber }),
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert(result.message, 'success');
            loadTrainManagement();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('操作失败，请重试', 'danger');
    }
}

// 管理员功能 - 恢复列车
async function resumeTrain(trainNumber) {
    if (!confirm(`确定要恢复列车 ${trainNumber} 的运行吗？`)) return;
    
    try {
        const response = await fetch('/api/admin/resume-train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trainNumber }),
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert(result.message, 'success');
            loadTrainManagement();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('操作失败，请重试', 'danger');
    }
}

// 管理员功能 - 封禁用户
async function banUser(username) {
    if (!confirm(`确定要封禁用户 ${username} 吗？`)) return;
    
    try {
        const response = await fetch('/api/admin/ban-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert(result.message, 'success');
            loadUserManagement();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('操作失败，请重试', 'danger');
    }
}

// 管理员功能 - 解封用户
async function unbanUser(username) {
    if (!confirm(`确定要解封用户 ${username} 吗？`)) return;
    
    try {
        const response = await fetch('/api/admin/unban-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert(result.message, 'success');
            loadUserManagement();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('操作失败，请重试', 'danger');
    }
}

// 管理员功能 - 删除用户
async function deleteUser(username) {
    if (!confirm(`确定要删除用户 ${username} 吗？\n注意：此操作不可恢复！`)) return;
    
    try {
        const response = await fetch('/api/admin/delete-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert(result.message, 'success');
            loadUserManagement();
        } else {
            showAlert(result.message, 'danger');
        }
    } catch (error) {
        showAlert('操作失败，请重试', 'danger');
    }
}
