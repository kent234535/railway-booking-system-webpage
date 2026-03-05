const fs = require('fs');
const path = require('path');

// 测试数据加载
function testLoadTrains() {
    const trainFilePath = path.join(__dirname, '..', 'new_trains.txt');
    console.log('测试加载文件:', trainFilePath);
    console.log('文件是否存在:', fs.existsSync(trainFilePath));
    
    if (!fs.existsSync(trainFilePath)) {
        console.log('文件不存在，退出测试');
        return;
    }
    
    try {
        const data = fs.readFileSync(trainFilePath, 'utf8');
        console.log('文件内容长度:', data.length);
        
        const lines = data.trim().split('\n');
        console.log('文件行数:', lines.length);
        
        // 测试第一行
        if (lines.length > 0) {
            const line = lines[0];
            console.log('第一行内容:', line);
            
            const parts = line.split(',');
            console.log('分割后部分数:', parts.length);
            
            if (parts.length >= 5) {
                const trainNumber = parts[0].trim();
                const stations = parts[1].split('|').map(s => s.trim());
                const arrivalTimes = parts[2].split('|').map(t => t.trim());
                
                console.log('车次:', trainNumber);
                console.log('站点数:', stations.length);
                console.log('站点:', stations);
                console.log('时间数:', arrivalTimes.length);
                console.log('时间:', arrivalTimes);
                
                // 验证数据
                const expectedStations = arrivalTimes.length / 2;
                console.log('预期站点数:', expectedStations);
                console.log('验证通过:', stations.length === expectedStations && arrivalTimes.length % 2 === 0);
            }
        }
        
    } catch (error) {
        console.error('测试出错:', error);
    }
}

// 测试搜索逻辑
function testSearchLogic() {
    console.log('\n=== 测试搜索逻辑 ===');
    
    // 模拟G847数据
    const train = {
        trainNumber: "G847",
        stations: ["北京", "石家庄", "郑州", "西安", "成都", "重庆", "贵阳", "昆明"],
        arrivalTimes: ["06:00", "07:24", "09:27", "11:42", "15:19", "16:33", "18:16", "21:27", "21:42", "01:03", "02:46", "04:29", "07:46", "08:43", "10:08", "11:32"]
    };
    
    const startStation = "北京";
    const endStation = "昆明";
    
    const startIndex = train.stations.indexOf(startStation);
    const endIndex = train.stations.indexOf(endStation);
    
    console.log('起点站索引:', startIndex);
    console.log('终点站索引:', endIndex);
    
    // 获取对应方向的时刻表
    function getDirectionalSchedule(allTimes, startIdx, endIdx) {
        if (!allTimes || allTimes.length === 0) {
            return allTimes;
        }
        
        // 计算站点数量（前一半是正向，后一半是反向）
        const numStations = Math.floor(allTimes.length / 2);
        console.log('站点数量:', numStations);
        
        // 确保索引在有效范围内
        if (startIdx >= numStations || endIdx >= numStations) {
            console.log('索引超出范围，使用正向时刻表');
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
    
    const scheduleTimes = getDirectionalSchedule(train.arrivalTimes, startIndex, endIndex);
    console.log('选择的时刻表:', scheduleTimes);
    console.log('出发时间:', scheduleTimes[startIndex]);
    console.log('到达时间:', scheduleTimes[endIndex]);
}

console.log('=== 测试数据加载 ===');
testLoadTrains();
testSearchLogic();
