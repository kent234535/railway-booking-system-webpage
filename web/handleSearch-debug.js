// 修改script.js中的handleSearch函数，增加调试信息
// 搜索d:\newdesktop\网络版（无数据库）\web\public\script.js文件中的handleSearch函数
// 在函数内部找到fetch调用部分，修改为如下内容（在console.log后添加详细信息）：

async function handleSearch(event) {
    event.preventDefault();
    
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
    
    // 检查日期是否为今天或未来
    if (departureDate) {
        const today = new Date();
        const selectedDate = new Date(departureDate);
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showAlert('不能查询过去的日期', 'warning');
            return;
        }
    }
    
    try {
        // 显示加载状态
        const resultsContainer = document.getElementById('searchResults');
        const resultsBody = document.getElementById('searchResultsBody');
        resultsBody.innerHTML = '<tr><td colspan="9" class="text-center"><i class="fas fa-spinner fa-spin"></i> 正在查询车票...</td></tr>';
        resultsContainer.style.display = 'block';
        
        // 调试信息
        console.log('发送搜索请求:', { startStation, endStation, departureTime });
        
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                startStation, 
                endStation, 
                departureTime  // 注意：这里使用时间而不是日期进行查询，符合C++版本的逻辑
            }),
        });
        
        const results = await response.json();
        
        // 调试信息
        console.log('搜索结果:', results);
        
        displaySearchResults(results, startStation, endStation);
    } catch (error) {
        console.error('搜索出错:', error);
        showAlert('搜索过程中出错，请稍后重试', 'danger');
    }
}
