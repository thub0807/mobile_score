// 获取DOM元素
const subject1Input = document.getElementById('subject1');
const subject2Input = document.getElementById('subject2');
const subject3Input = document.getElementById('subject3');
const subject4Input = document.getElementById('subject4');
const totalScoreElement = document.getElementById('totalScore');
const saveButton = document.getElementById('saveBtn');
const resetButton = document.getElementById('resetBtn');

// 本地存储的键名
const STORAGE_KEY = 'yz_score_settings';

// 初始化页面
function initPage() {
    // 从本地存储加载保存的成绩设置
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        subject1Input.value = settings.subject1 || '';
        subject2Input.value = settings.subject2 || '';
        subject3Input.value = settings.subject3 || '';
        subject4Input.value = settings.subject4 || '';
        updateTotalScore();
    }

    // 添加事件监听器
    subject1Input.addEventListener('input', updateTotalScore);
    subject2Input.addEventListener('input', updateTotalScore);
    subject3Input.addEventListener('input', updateTotalScore);
    subject4Input.addEventListener('input', updateTotalScore);
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
}

// 更新总分显示
function updateTotalScore() {
    const score1 = parseInt(subject1Input.value) || 0;
    const score2 = parseInt(subject2Input.value) || 0;
    const score3 = parseInt(subject3Input.value) || 0;
    const score4 = parseInt(subject4Input.value) || 0;
    
    const total = score1 + score2 + score3 + score4;
    totalScoreElement.textContent = total;
}

// 保存设置到本地存储
function saveSettings() {
    const settings = {
        subject1: subject1Input.value,
        subject2: subject2Input.value,
        subject3: subject3Input.value,
        subject4: subject4Input.value,
        total: totalScoreElement.textContent
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    alert('设置已保存！访问研招网成绩查询页面时将显示您设置的成绩。');
}

// 重置设置
function resetSettings() {
    localStorage.removeItem(STORAGE_KEY);
    subject1Input.value = '';
    subject2Input.value = '';
    subject3Input.value = '';
    subject4Input.value = '';
    updateTotalScore();
    alert('设置已重置！');
}

// 初始化页面
initPage();

// 修改研招网成绩页面的主函数
function modifyScores() {
    console.log('开始修改成绩...');
    
    // 从本地存储获取保存的成绩设置
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (!savedSettings) {
        console.log('未找到保存的成绩设置');
        return;
    }
    
    let settings;
    try {
        settings = JSON.parse(savedSettings);
        console.log('成功读取成绩设置:', settings);
    } catch (error) {
        console.error('解析成绩设置时出错:', error);
        return;
    }

    // 获取成绩表格并修改成绩的函数
    function updateScores() {
        const tbody = document.querySelector('tbody');
        if (!tbody) {
            console.log('未找到成绩表格体，1秒后重试...');
            setTimeout(updateScores, 1000);
            return;
        }

        const rows = tbody.querySelectorAll('tr');
        let scoreIndex = 0;
        let foundFirstScore = false;

        rows.forEach((row, index) => {
            const titleCell = row.querySelector('td.cjxx-info-title');
            const contentCell = row.querySelector('td.cjxx-info-content');

            if (!titleCell || !contentCell) return;

            const titleText = titleCell.textContent.trim();

            if (titleText === '总分：') {
                const totalScore = [
                    settings.subject1 || '0',
                    settings.subject2 || '0',
                    settings.subject3 || '0',
                    settings.subject4 || '0'
                ].reduce((sum, score) => sum + Number(score), 0);
                contentCell.textContent = totalScore.toString();
                console.log('总分已更新为:', totalScore);
            } else if (titleText.includes('第') && titleText.includes('门：')) {
                if (!foundFirstScore) {
                    foundFirstScore = true;
                }

                const scoreKey = `subject${scoreIndex + 1}`;
                if (settings[scoreKey]) {
                    contentCell.textContent = settings[scoreKey];
                    console.log(`第${scoreIndex + 1}科成绩已更新为:`, settings[scoreKey]);
                }
                scoreIndex++;
            }
        });

        console.log('成绩修改完成');
    }

    // 开始尝试更新成绩
    updateScores();
}

// 检查当前页面是否是研招网成绩查询页面
function checkAndModifyPage() {
    const currentUrl = window.location.href;
    console.log('检查页面URL:', currentUrl);

    if (currentUrl.includes('yz.chsi.com.cn/apply/cjcxa/')) {
        console.log('检测到研招网成绩查询页面，准备修改成绩...');
        // 确保页面完全加载后再执行修改
        if (document.readyState === 'complete') {
            modifyScores();
        } else {
            window.addEventListener('load', modifyScores);
        }
    }
}

// 监听URL变化
let lastUrl = window.location.href;
setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        checkAndModifyPage();
    }
}, 1000);

// 初始检查
checkAndModifyPage();