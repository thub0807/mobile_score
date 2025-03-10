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

// 创建用于修改研招网成绩页面的脚本
function createScoreModifierScript() {
    
    
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
    
    // 修改页面上显示的成绩
    function modifyScores() {
        console.log('开始修改成绩...');
        // 获取成绩表格
        const scoreTable = document.querySelector('table.cjxx-info');
        if (!scoreTable) {
            console.log('未找到成绩表格，10ms后重试...');
            setTimeout(modifyScores, 10);
            return;
        }

        const tbody = scoreTable.querySelector('tbody');
        if (!tbody) {
            console.log('未找到成绩表格体，10ms后重试...');
            setTimeout(modifyScores, 10);
            return;
        }

        const rows = tbody.querySelectorAll('tr');
        let scoreIndex = 0;
        let foundFirstScore = false;
        let totalScore = 0;

        // 遍历tbody中的所有行
        rows.forEach(row => {
            const titleCell = row.querySelector('td.cjxx-info-title');
            const contentCell = row.querySelector('td.cjxx-info-content');

            if (!titleCell || !contentCell) return;

            const titleText = titleCell.textContent.trim();

            // 更新总分
            if (titleText === '总分：') {
                totalScore = [
                    settings.subject1 || '0',
                    settings.subject2 || '0',
                    settings.subject3 || '0',
                    settings.subject4 || '0'
                ].reduce((sum, score) => sum + Number(score), 0);
                contentCell.textContent = totalScore.toString();
                console.log('总分已更新为:', totalScore);
            }
            // 更新各科成绩
            else if (titleText.includes('第') && titleText.includes('门：')) {
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

        console.log('研招网成绩修改工具：成绩修改完成');
    }
    
    // 等待页面完全加载后再执行修改
    if (document.readyState === 'complete') {
        console.log('页面已完全加载，立即执行修改');
        modifyScores();
    } else {
        console.log('页面正在加载，等待加载完成...');
        window.addEventListener('load', () => {
            console.log('页面加载完成，开始执行修改');
            modifyScores();
        });
    }
    
    // 添加DOM变化监听，以防页面动态加载
    const observer = new MutationObserver(() => {
        console.log('检测到DOM变化，重新执行修改...');
        modifyScores();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    console.log('已添加DOM变化监听器');
}

// 检查当前页面是否是研招网成绩查询页面并注入脚本
function injectScoreModifier() {
    console.log('开始检查页面URL...');
    console.log('当前页面URL:', window.location.href);
    
    // 修改URL匹配逻辑
    if (window.location.href.includes('yz.chsi.com.cn') || 
        window.location.href.includes('vercel.app') ||
        window.location.href.includes('localhost')) {  // 添加本地开发支持
        console.log('URL匹配成功，准备注入脚本...');
        createScoreModifierScript();
    } else {
        console.log('URL不匹配，不执行脚本注入');
    }
}

// 在页面加载完成后执行脚本注入
console.log('当前页面加载状态:', document.readyState);
if (document.readyState === 'loading') {
    console.log('页面正在加载中，添加DOMContentLoaded事件监听...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded事件触发，执行脚本注入...');
        injectScoreModifier();
    });
} else {
    console.log('页面已加载完成，直接执行脚本注入...');
    injectScoreModifier();
}