const fs = require('fs');
const path = require('path');

// 从trains.json中提取所有站点并更新script.js
function updateStationList() {
    try {
        // 读取trains.json
        const trainsFilePath = path.join(__dirname, 'data', 'trains.json');
        if (!fs.existsSync(trainsFilePath)) {
            console.error('trains.json文件不存在！');
            return;
        }
        
        const trainsData = JSON.parse(fs.readFileSync(trainsFilePath, 'utf8'));
        console.log(`加载了${trainsData.length}个车次`);
        
        // 提取所有站点
        const allStations = new Set();
        trainsData.forEach(train => {
            train.stations.forEach(station => {
                allStations.add(station);
            });
        });
        
        const stationsList = Array.from(allStations).sort((a, b) => a.localeCompare(b, 'zh-CN'));
        console.log(`提取了${stationsList.length}个站点: ${stationsList.join(', ')}`);
        
        // 更新script.js
        const scriptFilePath = path.join(__dirname, 'public', 'script.js');
        if (!fs.existsSync(scriptFilePath)) {
            console.error('script.js文件不存在！');
            return;
        }
        
        let scriptContent = fs.readFileSync(scriptFilePath, 'utf8');
        
        // 使用正则表达式找到allStations的定义并替换
        const stationsArrayRegex = /let allStations = \[[\s\S]*?\];/;
        const newStationsArray = `let allStations = [\n    "${stationsList.join('", "')}"
];`;
        
        const updatedScript = scriptContent.replace(stationsArrayRegex, newStationsArray);
        
        // 写回文件
        fs.writeFileSync(scriptFilePath, updatedScript);
        console.log('成功更新script.js中的站点列表');
    } catch (error) {
        console.error('更新站点列表失败:', error);
    }
}

updateStationList();
