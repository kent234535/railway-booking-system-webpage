const fs = require('fs');
const path = require('path');

// 测试搜索功能
function testSearchFunction() {
    const DATA_FILES = {
        trains: path.join(__dirname, 'data', 'trains.json')
    };
    
    // 读取trains.json文件
    let trains;
    try {
        const data = fs.readFileSync(DATA_FILES.trains, 'utf8');
        trains = JSON.parse(data);
        console.log(`成功加载${trains.length}个车次`);
    } catch (error) {
        console.error('读取trains.json出错:', error);
        return;
    }
    
    // 测试参数
    const startStation = '北京';
    const endStation = '昆明';
    const departureTime = ''; // 不限制出发时间
    
    console.log(`测试搜索: 从${startStation}到${endStation}`);
    
    // 辅助函数：获取指定方向的时刻表
    function getDirectionalSchedule(allTimes, startIdx, endIdx) {
        if (!allTimes || allTimes.length === 0) {
            return allTimes;
        }
        
        // 计算站点数量（前一半是正向，后一半是反向）
        const numStations = Math.floor(allTimes.length / 2);
        console.log(`时间数组长度: ${allTimes.length}, 计算站点数: ${numStations}`);
        
        // 确保索引在有效范围内
        if (startIdx >= numStations || endIdx >= numStations) {
            console.log(`索引超出范围 startIdx=${startIdx}, endIdx=${endIdx}, numStations=${numStations}`);
            return allTimes.slice(0, numStations);
        }
        
        // 如果是正向行程（startIdx < endIdx），使用前半部分时间
        if (startIdx < endIdx) {
            console.log('正向行程，使用前半部分时间');
            return allTimes.slice(0, numStations);
        }
        // 如果是反向行程（startIdx > endIdx），使用后半部分时间
        else {
            console.log('反向行程，使用后半部分时间');
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
    
    // 搜索逻辑
    const results = trains.filter(train => {
        console.log(`\n检查车次: ${train.trainNumber}`);
        console.log(`车站列表: ${train.stations.join(', ')}`);
        
        const startIndex = train.stations.indexOf(startStation);
        const endIndex = train.stations.indexOf(endStation);
        
        console.log(`起点站"${startStation}"索引=${startIndex}, 终点站"${endStation}"索引=${endIndex}`);
        
        // 站点必须存在且不相同
        if (startIndex === -1 || endIndex === -1 || startIndex === endIndex) {
            console.log(`站点不存在或相同，跳过`);
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
            console.log(`座位或价格矩阵访问越界`);
            return false;
        }

        // 获取对应方向的时刻表
        const scheduleTimes = getDirectionalSchedule(train.arrivalTimes, startIndex, endIndex);
        console.log(`选择的时刻表: ${scheduleTimes.join(', ')}`);
        
        // 计算出发时间
        let trainDepartureTime;
        
        // 如果是正向行程
        if (startIndex < endIndex) {
            trainDepartureTime = scheduleTimes[startIndex];
            console.log(`正向行程，出发时间=${trainDepartureTime}`);
        }
        // 如果是反向行程，需要调整索引
        else {
            const numStations = train.stations.length;
            const reverseStartIdx = numStations - 1 - startIndex;
            trainDepartureTime = scheduleTimes[reverseStartIdx];
            console.log(`反向行程，reverseStartIdx=${reverseStartIdx}，出发时间=${trainDepartureTime}`);
        }
        
        // 如果用户指定了出发时间，进行过滤
        if (departureTime) {
            const filterTimeMinutes = timeToMinutes(departureTime);
            const trainDepartureMinutes = timeToMinutes(trainDepartureTime);
            
            // 如果列车出发时间早于用户指定的时间，跳过此车次
            if (trainDepartureMinutes < filterTimeMinutes) {
                console.log(`出发时间不符合条件`);
                return false;
            }
        }

        console.log(`通过所有筛选条件`);
        return true;
    });
    
    // 处理结果
    console.log(`\n查询结果: 找到${results.length}个匹配车次`);
    for (const train of results) {
        console.log(`- ${train.trainNumber}: ${train.stations.indexOf(startStation) < train.stations.indexOf(endStation) ? '正向' : '反向'} ${startStation} -> ${endStation}`);
    }
    
    // 详细显示第一个结果
    if (results.length > 0) {
        const train = results[0];
        const startIndex = train.stations.indexOf(startStation);
        const endIndex = train.stations.indexOf(endStation);
        const scheduleTimes = getDirectionalSchedule(train.arrivalTimes, startIndex, endIndex);
        
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
        
        console.log(`\n详细信息(${train.trainNumber}):`);
        console.log(`- 出发: ${startStation} @ ${departureTime}`);
        console.log(`- 到达: ${endStation} @ ${arrivalTime}`);
    }
}

testSearchFunction();
