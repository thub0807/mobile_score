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
    // 检查是否在研招网成绩查询页面
    if (!window.location.href.includes('https://yz.chsi.com.cn/apply/cjcxa/')) {
        return;
    }
    
    // 从本地存储获取保存的成绩设置
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (!savedSettings) {
        return;
    }
    
    const settings = JSON.parse(savedSettings);
    
    // 修改页面上显示的成绩
    function modifyScores() {
        // 获取成绩表格
        const scoreTable = document.querySelector('.zsml-result-table');
        if (!scoreTable) {
            // 如果没有找到成绩表格，可能页面结构有变化，稍后再试
            setTimeout(modifyScores, 10);
            return;
        }
        
        // 获取所有成绩行
        const scoreRows = scoreTable.querySelectorAll('tr');
        if (scoreRows.length < 2) {
            // 如果没有足够的行，可能页面还在加载，稍后再试
            setTimeout(modifyScores, 10);
            return;
        }
        
        // 修改各科目成绩
        let subjectIndex = 0;
        let totalScore = 0;
        
        // 从第二行开始（第一行是表头）
        for (let i = 1; i < scoreRows.length && subjectIndex < 4; i++) {
            const cells = scoreRows[i].querySelectorAll('td');
            // 确保这一行是成绩行（至少有两个单元格）
            if (cells.length >= 2) {
                // 获取成绩单元格（通常是第二个单元格）
                const scoreCell = cells[1];
                if (scoreCell) {
                    // 保存原始文本内容（保留科目代码和名称）
                    const originalText = scoreCell.textContent;
                    // 查找冒号的位置
                    const colonIndex = originalText.indexOf('：');
                    
                    if (colonIndex !== -1) {
                        // 获取对应的设置成绩
                        const newScore = settings[`subject${subjectIndex + 1}`] || '0';
                        // 替换冒号后面的成绩
                        const newText = originalText.substring(0, colonIndex + 1) + newScore;
                        scoreCell.textContent = newText;
                        
                        // 累加总分
                        totalScore += parseInt(newScore) || 0;
                        subjectIndex++;
                    }
                }
            }
        }
        
        // 修改总分显示
        const totalRow = scoreRows[scoreRows.length - 1];
        if (totalRow) {
            const totalCell = totalRow.querySelector('td:last-child');
            if (totalCell) {
                totalCell.textContent = totalScore.toString();
            }
        }
        
        console.log('研招网成绩修改工具：成绩已修改');
    }
    
    // 立即尝试修改成绩
    modifyScores();
    
    // 如果页面还在加载，等待页面加载完成后再次尝试
    if (document.readyState !== 'complete') {
        window.addEventListener('load', modifyScores);
    }
    
    // 添加DOM变化监听，以防页面动态加载
    const observer = new MutationObserver(() => {
        modifyScores();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 检查当前页面是否是研招网成绩查询页面并注入脚本
function injectScoreModifier() {
    if (window.location.href.includes('https://yz.chsi.com.cn/apply/cjcxa/')) {
        createScoreModifierScript();
    }
}

// 在页面加载完成后执行脚本注入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectScoreModifier);
} else {
    injectScoreModifier();
}