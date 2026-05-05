const gradesData = [
    { level: "C", pts: 2, plus: 0 },
    { level: "B", pts: 4, plus: 0 },
    { level: "B+", pts: 4, plus: 1 },
    { level: "B++", pts: 4, plus: 2 },
    { level: "A", pts: 6, plus: 0 },
    { level: "A+", pts: 6, plus: 1 },
    { level: "A++", pts: 6, plus: 2 }
];

const subjects = ["國文", "數學", "英文", "社會", "自然"];
let apPoints = 15; 
let playerStats = { "國文": 0, "數學": 0, "英文": 0, "社會": 0, "自然": 0 }; 

function switchScreen(screenId) {
    document.querySelectorAll('#game-container > div').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function renderStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';
    
    subjects.forEach(subject => {
        let lvlIdx = playerStats[subject];
        let currentGrade = gradesData[lvlIdx];
        let colorClass = currentGrade.level.includes('A') ? 'text-sys-blue' : (currentGrade.level.includes('C') ? 'text-gray-500' : 'text-white');

        container.innerHTML += `
            <div class="flex justify-between items-center bg-gray-800 p-2 rounded">
                <span class="font-bold w-16">${subject}</span>
                <span class="w-12 text-center font-bold font-system ${colorClass} drop-shadow-[0_0_2px_currentColor]">${currentGrade.level}</span>
                <div class="space-x-2">
                    <button onclick="updateStat('${subject}', -1)" class="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold disabled:opacity-30" ${lvlIdx === 0 ? 'disabled' : ''}>-</button>
                    <button onclick="updateStat('${subject}', 1)" class="w-8 h-8 border border-sys-blue text-sys-blue hover:bg-sys-blue hover:text-sys-dark rounded font-bold disabled:opacity-30 disabled:border-gray-600 disabled:text-gray-600" ${lvlIdx === 6 || apPoints === 0 ? 'disabled' : ''}>+</button>
                </div>
            </div>
        `;
    });
    document.getElementById('ap-points').innerText = apPoints;
}

function updateStat(subject, change) {
    playerStats[subject] += change;
    apPoints -= change;
    renderStats();
}

// 已經替換為你的專屬圖片網址
const bosses = [
    { 
        name: "【E級 巨石神像】", 
        imgSrc: "https://fengning0123-ai.github.io/cap-survival2026/images/boss-1.jpg",
        desc: "「連基本積分都沒有，休想跨過這扇門！」",
        check: (stats) => {
            let totalPts = 0;
            for(let s in stats) totalPts += gradesData[stats[s]].pts;
            return { pass: totalPts >= 24, detail: `總積分: ${totalPts}/24` };
        }, 
        failMsg: "總積分不足，遭到秒殺！\n💡 提示：盡量把C拉到B，大分(積分)最重要！" 
    },
    { 
        name: "【A級 血色騎士】", 
        imgSrc: "https://fengning0123-ai.github.io/cap-survival2026/images/boss-2.jpg",
        desc: "「同分的情況下，只有強者才能生存。」",
        check: (stats) => {
            let totalPlus = 0;
            for(let s in stats) totalPlus += gradesData[stats[s]].plus;
            return { pass: totalPlus >= 4, detail: `標示總數: ${totalPlus}/4` };
        }, 
        failMsg: "標示(+)數量不足以擊破護甲！\n💡 提示：在擅長的科目上投資點數拿到 ++！" 
    },
    { 
        name: "【S級 闇影蟻王】", 
        imgSrc: "https://fengning0123-ai.github.io/cap-survival2026/images/boss-3.jpg",
        desc: "「啟動桃連區法則，鎖定國文與數學防禦力...」",
        check: (stats) => {
            let chn = gradesData[stats["國文"]].level;
            let math = gradesData[stats["數學"]].level;
            let pass = chn.includes('A') && math.includes('A');
            return { pass: pass, detail: `國文:${chn}, 數學:${math}` };
        }, 
        failMsg: "核心科目防禦過低，被弱點擊破！\n💡 提示：注意桃連區的比序順序 (國>數>英>社>自)！" 
    }
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function startDungeon() {
    switchScreen('screen-battle');
    const logBox = document.getElementById('battle-log');
    const imgContainer = document.getElementById('boss-image-container');
    const bossImg = document.getElementById('boss-image');
    
    logBox.innerHTML = "<div class='text-sys-blue mb-2'>[系統] 正在建立地下城連結...</div>";
    await delay(1000);
    
    imgContainer.classList.remove('hidden');

    for (let i = 0; i < bosses.length; i++) {
        let boss = bosses[i];
        bossImg.src = boss.imgSrc; 
        
        logBox.innerHTML += `<div class='text-sys-red mt-3'>➤ 遭遇 ${boss.name}</div>`;
        logBox.innerHTML += `<div class='text-gray-400 italic'>${boss.desc}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1500);

        logBox.innerHTML += `<div class='text-gray-300'>[系統] 進行屬性判定...</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1000);

        let result = boss.check(playerStats);
        
        if (result.pass) {
            logBox.innerHTML += `<div class='text-sys-blue'>[成功] 判定結果 (${result.detail})。擊破 ${boss.name}！</div>`;
        } else {
            document.getElementById('battle-title').innerText = "💀 GAME OVER 💀";
            logBox.innerHTML += `<div class='text-sys-red font-bold'>[失敗] 判定結果 (${result.detail})。</div>`;
            logBox.innerHTML += `<div class='text-yellow-400 mt-2 whitespace-pre-line'>${boss.failMsg}</div>`;
            logBox.innerHTML += `<div class='text-gray-500 mt-4'>[系統] 玩家已死亡。測驗結束。</div>`;
            logBox.scrollTop = logBox.scrollHeight;
            document.getElementById('btn-restart').classList.remove('hidden');
            return; 
        }
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1500);
    }

    document.getElementById('battle-title').innerText = "✨ LEVEL UP ✨";
    document.getElementById('battle-title').classList.remove('text-sys-red');
    document.getElementById('battle-title').classList.add('text-sys-blue');
    
    // 通關勝利圖片也換成你的專屬路徑了
    bossImg.src = "https://fengning0123-ai.github.io/cap-survival2026/images/victory.jpg"; 
    
    logBox.innerHTML += `<div class='text-sys-blue font-bold text-lg mt-4 blink'>[系統] 恭喜！您已通關升學地下城，獲得高中入學資格！</div>`;
    logBox.scrollTop = logBox.scrollHeight;
    document.getElementById('btn-restart').classList.remove('hidden');
}

renderStats();