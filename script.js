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

        // 在此處加大了科目字體 (text-xl md:text-3xl) 以及觸控按鈕 (w-14 h-14 md:w-16 md:h-16)
        container.innerHTML += `
            <div class="flex justify-between items-center bg-gray-800 p-3 md:p-4 rounded-lg shadow-md border border-gray-700">
                <span class="font-black text-xl md:text-3xl w-20 md:w-28 tracking-widest">${subject}</span>
                <span class="w-16 md:w-24 text-center font-black font-system text-2xl md:text-4xl ${colorClass} drop-shadow-[0_0_3px_currentColor]">${currentGrade.level}</span>
                <div class="space-x-3 md:space-x-4">
                    <button onclick="updateStat('${subject}', -1)" class="w-12 h-12 md:w-16 md:h-16 text-2xl md:text-3xl bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-black disabled:opacity-30 transition-colors" ${lvlIdx === 0 ? 'disabled' : ''}>-</button>
                    <button onclick="updateStat('${subject}', 1)" class="w-12 h-12 md:w-16 md:h-16 text-2xl md:text-3xl border-2 border-sys-blue text-sys-blue hover:bg-sys-blue hover:text-sys-dark rounded-lg font-black disabled:opacity-30 disabled:border-gray-600 disabled:text-gray-600 transition-colors" ${lvlIdx === 6 || apPoints === 0 ? 'disabled' : ''}>+</button>
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

const bosses = [
    { 
        name: "【E級 巨石神像】", 
        imgSrc: "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/boss-1.jpg?raw=true",
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
        imgSrc: "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/boss-2.jpg?raw=true",
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
        imgSrc: "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/boss-3.jpg?raw=true",
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
    
    logBox.innerHTML = "<div class='text-sys-blue mb-3'>[系統] 正在建立地下城連結...</div>";
    await delay(1000);
    
    imgContainer.classList.remove('hidden');

    for (let i = 0; i < bosses.length; i++) {
        let boss = bosses[i];
        bossImg.src = boss.imgSrc; 
        
        logBox.innerHTML += `<div class='text-sys-red mt-5 text-xl md:text-3xl font-black'>➤ 遭遇 ${boss.name}</div>`;
        logBox.innerHTML += `<div class='text-yellow-200 italic mb-2'>${boss.desc}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1500);

        logBox.innerHTML += `<div class='text-gray-300'>[系統] 進行屬性判定...</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1000);

        let result = boss.check(playerStats);
        
        if (result.pass) {
            logBox.innerHTML += `<div class='text-sys-blue text-xl md:text-2xl'>[成功] 判定結果 (${result.detail})。擊破 ${boss.name}！</div><hr class="border-gray-600 my-4">`;
        } else {
            document.getElementById('battle-title').innerText = "💀 GAME OVER 💀";
            logBox.innerHTML += `<div class='text-sys-red font-black text-xl md:text-3xl'>[失敗] 判定結果 (${result.detail})。</div>`;
            logBox.innerHTML += `<div class='text-yellow-400 mt-3 whitespace-pre-line text-lg md:text-2xl'>${boss.failMsg}</div>`;
            logBox.innerHTML += `<div class='text-gray-500 mt-6 font-bold'>[系統] 玩家已死亡。測驗結束。</div>`;
            logBox.scrollTop = logBox.scrollHeight;
            document.getElementById('btn-restart').classList.remove('hidden');
            return; 
        }
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1500);
    }

    document.getElementById('battle-title').innerText = "✨ LEVEL UP ✨";
    document.getElementById('battle-title').classList.remove('text-sys-red');
    document.getElementById('battle-title').classList.add('text-sys-blue', 'drop-shadow-[0_0_8px_#45f3ff]');
    
    bossImg.src = "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/victory.jpg?raw=true"; 
    
    logBox.innerHTML += `<div class='text-sys-blue font-black text-2xl md:text-4xl mt-6 blink drop-shadow-[0_0_5px_#45f3ff]'>[系統] 恭喜！您已通關升學地下城，獲得高中入學資格！</div>`;
    logBox.scrollTop = logBox.scrollHeight;
    document.getElementById('btn-restart').classList.remove('hidden');
}

renderStats();