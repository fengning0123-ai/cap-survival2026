window.switchScreen = switchScreen;
window.startGame = startGame;
window.resetGame = resetGame;
window.updateStat = updateStat;
window.startDungeon = startDungeon;
window.showReview = showReview;

// 計分系統：A有6分, B有4分 / A++有7積點...依此類推
const gradesData = [
    { level: "C", pts: 2, gp: 1 },
    { level: "B", pts: 4, gp: 2 },
    { level: "B+", pts: 4, gp: 3 },
    { level: "B++", pts: 4, gp: 4 },
    { level: "A", pts: 6, gp: 5 },
    { level: "A+", pts: 6, gp: 6 },
    { level: "A++", pts: 6, gp: 7 }
];

const subjects = ["國文", "數學", "英文", "社會", "自然"];
let apPoints = 15; 
let playerStats = { "國文": 0, "數學": 0, "英文": 0, "社會": 0, "自然": 0 }; 
let battleHistory = []; 
let playerName = "獵人"; 
let isVictory = false;   

function getPts(stats) { return subjects.reduce((sum, s) => sum + gradesData[stats[s]].pts, 0); }
function getGp(stats) { return subjects.reduce((sum, s) => sum + gradesData[stats[s]].gp, 0); }
function getGpFromLevel(levelStr) { return gradesData.find(g => g.level === levelStr).gp; }
function getPtsFromLevel(levelStr) { return gradesData.find(g => g.level === levelStr).pts; }

function switchScreen(screenId) {
    document.querySelectorAll('#game-container > div').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startGame() {
    const nameInput = document.getElementById('player-name-input').value.trim();
    playerName = nameInput !== "" ? nameInput : "無名獵人";
    switchScreen('screen-stats');
}

function resetGame() {
    apPoints = 15; 
    playerStats = { "國文": 0, "數學": 0, "英文": 0, "社會": 0, "自然": 0 };
    battleHistory = [];
    isVictory = false;
    document.body.classList.remove('review-mode');
    
    document.getElementById('boss-image-container').classList.add('hidden');
    document.getElementById('boss-image').src = "";
    
    document.getElementById('battle-title').innerText = "⚠ 檢測到👾氣息 ⚠";
    document.getElementById('battle-title').classList.remove('text-sys-blue', 'drop-shadow-[0_0_8px_#45f3ff]');
    document.getElementById('battle-title').classList.add('text-sys-red');
    
    renderStats();
    switchScreen('screen-stats');
}

function renderStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';
    
    subjects.forEach(subject => {
        let lvlIdx = playerStats[subject];
        let currentGrade = gradesData[lvlIdx];
        let colorClass = currentGrade.level.includes('A') ? 'text-sys-blue' : (currentGrade.level.includes('C') ? 'text-gray-500' : 'text-white');

        container.innerHTML += `
            <div class="flex justify-between items-center bg-gray-800 p-4 md:p-6 rounded-xl shadow-md border-2 border-gray-700">
                <span class="font-black text-2xl md:text-4xl w-20 md:w-32 tracking-widest">${subject}</span>
                <span class="w-20 md:w-28 text-center font-black font-system text-3xl md:text-5xl ${colorClass} drop-shadow-[0_0_5px_currentColor]">${currentGrade.level}</span>
                <div class="flex space-x-4 md:space-x-6">
                    <button type="button" onclick="window.updateStat('${subject}', -1)" class="flex items-center justify-center w-14 h-14 md:w-20 md:h-20 text-4xl md:text-5xl bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors" ${lvlIdx === 0 ? 'disabled' : ''}>-</button>
                    <button type="button" onclick="window.updateStat('${subject}', 1)" class="flex items-center justify-center w-14 h-14 md:w-20 md:h-20 text-4xl md:text-5xl border-4 border-sys-blue text-sys-blue hover:bg-sys-blue hover:text-sys-dark rounded-xl font-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors" ${lvlIdx === 6 || apPoints === 0 ? 'disabled' : ''}>+</button>
                </div>
            </div>
        `;
    });
    document.getElementById('ap-points').innerText = apPoints;
}

function updateStat(subject, change) {
    change = parseInt(change);
    playerStats[subject] += change;
    apPoints -= change;
    renderStats();
}

// 核心比序：戰鬥中極簡化顯示為 🗡️ 與 👾
function evaluateBattle(pStats, bGrades) {
    let pPts = getPts(pStats); 
    let bPts = subjects.reduce((sum, s) => sum + getPtsFromLevel(bGrades[s]), 0);
    let pGp = getGp(pStats);   
    let bGp = subjects.reduce((sum, s) => sum + getGpFromLevel(bGrades[s]), 0);

    let logHTML = `<div class="mt-2 space-y-2 text-lg md:text-xl text-gray-300">`;

    if (pPts > bPts) return { pass: true, decideKey: 'totalPts', detail: logHTML + `✅ 【總分】🗡️ ${pPts}分 > 👾 ${bPts}分 (獲勝)</div>` };
    if (pPts < bPts) return { pass: false, decideKey: 'totalPts', detail: logHTML + `❌ 【總分】🗡️ ${pPts}分 < 👾 ${bPts}分 (敗北)</div>` };
    logHTML += `<div>⚠️ 【總分】皆為 ${pPts}分 (平手) ➔ 比較總積點</div>`;

    if (pGp > bGp) return { pass: true, decideKey: 'totalGp', detail: logHTML + `✅ 【總積點】🗡️ ${pGp}點 > 👾 ${bGp}點 (獲勝)</div>` };
    if (pGp < bGp) return { pass: false, decideKey: 'totalGp', detail: logHTML + `❌ 【總積點】🗡️ ${pGp}點 < 👾 ${bGp}點 (敗北)</div>` };
    logHTML += `<div>⚠️ 【總積點】皆為 ${pGp}點 (平手) ➔ 啟動單科順序</div>`;

    logHTML += `<div class="border-t border-gray-600 my-2 pt-2 text-yellow-300">⚔️ 單科積點嚴格對決 (國>數>英>社>自)：</div>`;
    for(let sub of subjects) {
        let pSubGp = gradesData[pStats[sub]].gp;
        let bSubGp = getGpFromLevel(bGrades[sub]);
        if (pSubGp > bSubGp) return { pass: true, decideKey: sub, detail: logHTML + `✅ 【${sub}】🗡️ ${pSubGp}點 > 👾 ${bSubGp}點 (獲勝)</div>` };
        if (pSubGp < bSubGp) return { pass: false, decideKey: sub, detail: logHTML + `❌ 【${sub}】🗡️ ${pSubGp}點 < 👾 ${bSubGp}點 (敗北)</div>` };
        logHTML += `<div>🔹 【${sub}】${pSubGp}點 == ${bSubGp}點 (平手)</div>`;
    }
    
    return { pass: false, decideKey: 'allTied', detail: logHTML + `<div class="text-red-400 font-bold mt-2">💀 五科完全平手！未大於👾，系統判定敗北！</div></div>` };
}

const bosses = [
    { 
        name: "【E級 巨石神像】", 
        imgSrc: "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/boss-1.jpg?raw=true",
        desc: "「連基本分數都沒有，休想跨過這扇門！」",
        bossGrades: { "國文": "B++", "數學": "B++", "英文": "B++", "社會": "B++", "自然": "B++" }, 
        reqDesc: "總分須大於👾<br>(👾：5B++ / 20分 / 20積點)"
    },
    { 
        name: "【A級 血色騎士】", 
        imgSrc: "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/boss-2.jpg?raw=true",
        desc: "「總分達標了？那來比比誰的細節更強。」",
        bossGrades: { "國文": "A", "數學": "A", "英文": "A", "社會": "B", "自然": "B" }, 
        reqDesc: "同總分下，總積點須大於👾<br>(👾：3A2B / 26分 / 19積點)"
    },
    { 
        name: "【S級 闇影蟻王】", 
        imgSrc: "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/boss-3.jpg?raw=true",
        desc: "「同分同積點...啟動桃連區單科比序法則！」",
        // 修正第三關成績為 ABAAB+ (國文A、數學B、英文A、社會A、自然B+)
        bossGrades: { "國文": "A", "數學": "B", "英文": "A", "社會": "A", "自然": "B+" }, 
        reqDesc: "同分同積點，單科積點須大於👾<br>(👾：3A 1B+ 1B / 26分 / 20積點)"
    }
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function startDungeon() {
    battleHistory = []; 
    isVictory = false;
    switchScreen('screen-battle');
    const logBox = document.getElementById('battle-log');
    const imgContainer = document.getElementById('boss-image-container');
    const bossImg = document.getElementById('boss-image');
    document.getElementById('end-buttons').classList.add('hidden'); 
    
    imgContainer.classList.add('hidden');
    bossImg.src = "";
    
    logBox.innerHTML = `<div class='text-sys-blue mb-3'>[系統] 正在為🗡️ ${playerName} 建立地下城連結...</div>`;
    await delay(1000);

    for (let i = 0; i < bosses.length; i++) {
        let boss = bosses[i];
        bossImg.src = boss.imgSrc; 
        imgContainer.classList.remove('hidden');
        
        logBox.innerHTML += `<div class='text-sys-red mt-5 text-xl md:text-3xl font-black'>➤ 🗡️ ${playerName} 遭遇 ${boss.name}</div>`;
        logBox.innerHTML += `<div class='text-yellow-200 italic mb-2'>${boss.desc}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1500);

        let bossGradeStr = subjects.map(s => `${s}${boss.bossGrades[s]}`).join(" ");
        let playerGradeStr = subjects.map(s => `${s}${gradesData[playerStats[s]].level}`).join(" ");

        logBox.innerHTML += `<div class='text-purple-300 text-lg md:text-2xl font-bold mt-3 bg-gray-800 p-2 rounded-t-lg border-b border-gray-600'>👾：${bossGradeStr}</div>`;
        logBox.innerHTML += `<div class='text-yellow-300 text-lg md:text-2xl font-bold mb-3 bg-gray-800 p-2 rounded-b-lg'>🗡️：${playerGradeStr}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        await delay(1500);

        let result = evaluateBattle(playerStats, boss.bossGrades);
        
        battleHistory.push({
            bossName: boss.name,
            reqDesc: boss.reqDesc,
            bossGrades: boss.bossGrades,
            playerStats: { ...playerStats },
            passed: result.pass,
            decideKey: result.decideKey
        });
        
        if (result.pass) {
            logBox.innerHTML += `<div class='mt-2'>${result.detail}</div><hr class="border-gray-600 my-4">`;
        } else {
            document.getElementById('battle-title').innerText = "💀 GAME OVER 💀";
            bossImg.src = "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/defeat.jpg?raw=true";
            
            logBox.innerHTML += `<div class='mt-2'>${result.detail}</div>`;
            logBox.innerHTML += `<div class='text-gray-500 mt-6 font-bold'>[系統] 🗡️ ${playerName} 挑戰失敗。</div>`;
            logBox.scrollTop = logBox.scrollHeight;
            
            document.getElementById('battle-btn-restart').classList.remove('hidden');
            document.getElementById('end-buttons').classList.remove('hidden'); 
            document.getElementById('end-buttons').classList.add('flex');
            return; 
        }
        logBox.scrollTop = logBox.scrollHeight;
        await delay(2000);
    }

    isVictory = true;
    document.getElementById('battle-title').innerText = "✨ LEVEL UP ✨";
    document.getElementById('battle-title').classList.remove('text-sys-red');
    document.getElementById('battle-title').classList.add('text-sys-blue', 'drop-shadow-[0_0_8px_#45f3ff]');
    bossImg.src = "https://github.com/fengning0123-ai/cap-survival2026/blob/main/image/victory.jpg?raw=true"; 
    
    logBox.innerHTML += `<div class='text-sys-blue font-black text-[4.5vw] sm:text-2xl md:text-4xl mt-6 blink drop-shadow-[0_0_5px_#45f3ff] whitespace-nowrap tracking-tighter sm:tracking-normal text-center'>[系統] 恭喜🗡️ ${playerName}！全數通關！</div>`;
    
    logBox.scrollTop = logBox.scrollHeight;
    
    document.getElementById('battle-btn-restart').classList.add('hidden');
    document.getElementById('end-buttons').classList.remove('hidden'); 
    document.getElementById('end-buttons').classList.add('flex');
}

function formatResult(isDeciding, text, isWin) {
    if (isDeciding) {
        return isWin 
            ? `<span class="text-green-400 drop-shadow-[0_0_5px_#4ade80] font-black tracking-widest text-lg md:text-xl">✅ ${text}</span>` 
            : `<span class="text-red-400 drop-shadow-[0_0_5px_#f87171] font-black tracking-widest text-lg md:text-xl">❌ ${text}</span>`;
    } else {
        return `<span class="text-gray-600 font-bold opacity-70">${text}</span>`;
    }
}

function showReview() {
    document.body.classList.add('review-mode'); 
    switchScreen('screen-review');
    const reviewContent = document.getElementById('review-content');
    let html = "";
    
    if (isVictory) {
        document.getElementById('btn-review-restart').classList.add('hidden');
        html += `
            <div class="bg-gradient-to-br from-yellow-700 via-yellow-600 to-yellow-800 border-4 border-yellow-400 p-6 md:p-8 rounded-xl shadow-[0_0_20px_#facc15] mb-8 text-center relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);"></div>
                <h2 class="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-yellow-100 drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] mb-6 whitespace-nowrap tracking-tighter sm:tracking-normal relative z-10">🏆桃連區地下城破關證明🏆</h2>
                <p class="text-xl md:text-2xl text-white font-bold relative z-10 mb-8 tracking-wider">茲證明🗡️獵人 <span class="text-sys-blue text-3xl md:text-5xl px-3 drop-shadow-[0_0_10px_#45f3ff] bg-black bg-opacity-50 rounded-lg py-1">${playerName}</span></p>
                <p class="text-lg md:text-2xl text-yellow-100 font-bold relative z-10 bg-black bg-opacity-30 p-4 rounded-lg inline-block border border-yellow-500">以卓越的戰略，成功突破所有比序防線<br><span class="text-2xl md:text-3xl text-yellow-300 mt-2 block">榮獲<span class="text-yellow-400 font-black drop-shadow-[0_0_8px_#facc15]">【桃連區最佳獵人】</span>稱號！</span></p>
            </div>
        `;
    } else {
        document.getElementById('btn-review-restart').classList.remove('hidden');
    }

    html += `<h3 class="text-yellow-400 text-2xl md:text-3xl font-black mt-4 mb-4 border-b-2 border-yellow-400 pb-3">⚔ 戰報分析紀錄 (表格對照)</h3>`;
    
    battleHistory.forEach(record => {
        let statusClass = record.passed ? 'border-sys-blue bg-gray-900' : 'border-sys-red bg-gray-900';
        let statusTitleClass = record.passed ? 'text-sys-blue' : 'text-sys-red';
        let statusText = record.passed ? '✅ 突破' : '❌ 敗北';

        let bPts = subjects.reduce((sum, s) => sum + getPtsFromLevel(record.bossGrades[s]), 0);
        let pPts = subjects.reduce((sum, s) => sum + gradesData[record.playerStats[s]].pts, 0);
        let bGp = subjects.reduce((sum, s) => sum + getGpFromLevel(record.bossGrades[s]), 0);
        let pGp = subjects.reduce((sum, s) => sum + gradesData[record.playerStats[s]].gp, 0);

        html += `
            <div class="border-l-8 ${statusClass} p-4 md:p-6 rounded-r-xl shadow-lg mb-8">
                <div class="font-black text-2xl md:text-3xl mb-4 ${statusTitleClass}">👾魔王 ${record.bossName} <span class="float-right text-xl md:text-2xl bg-black px-3 py-1 rounded border border-gray-700">${statusText}</span></div>
                
                <div class="text-lg md:text-xl text-gray-400 mb-4 font-bold border-b border-gray-600 pb-2 tracking-wide leading-relaxed text-center">
                    ⚖️ ${record.reqDesc}
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-center border-collapse border-2 border-sys-blue bg-[#0d1321] rounded-lg text-base md:text-xl shadow-[0_0_15px_rgba(69,243,255,0.2)]">
                        <thead>
                            <tr class="bg-[rgba(69,243,255,0.15)] text-sys-blue font-black tracking-widest border-b-2 border-sys-blue">
                                <th class="border border-sys-blue/50 p-3 w-1/4">比較項目</th>
                                <th class="border border-sys-blue/50 p-3 w-1/4 text-purple-300">👾魔王</th>
                                <th class="border border-sys-blue/50 p-3 w-1/4 text-yellow-300">🗡️獵人</th>
                                <th class="border border-sys-blue/50 p-3 w-1/4">小計判斷</th>
                            </tr>
                        </thead>
                        <tbody class="text-white font-bold tracking-wide">
        `;
        
        let ptsText = pPts > bPts ? '勝出' : (pPts < bPts ? '敗北' : '平手');
        let ptsHTML = formatResult(record.decideKey === 'totalPts', ptsText, pPts > bPts);
        
        html += `
                            <tr class="bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(69,243,255,0.05)] transition-colors">
                                <td class="border border-gray-700 p-3 text-blue-400">總 分</td>
                                <td class="border border-gray-700 p-3 text-gray-300">${bPts}</td>
                                <td class="border border-gray-700 p-3 text-gray-300">${pPts}</td>
                                <td class="border border-gray-700 p-3">${ptsHTML}</td>
                            </tr>
        `;

        let gpText = pGp > bGp ? '勝出' : (pGp < bGp ? '敗北' : '平手');
        let gpHTML = formatResult(record.decideKey === 'totalGp', gpText, pGp > bGp);
        
        html += `
                            <tr class="bg-[rgba(255,255,255,0.02)] border-b-2 border-sys-blue hover:bg-[rgba(69,243,255,0.05)] transition-colors">
                                <td class="border border-gray-700 p-3 text-blue-400">總積點</td>
                                <td class="border border-gray-700 p-3 text-gray-300">${bGp}</td>
                                <td class="border border-gray-700 p-3 text-gray-300">${pGp}</td>
                                <td class="border border-gray-700 p-3">${gpHTML}</td>
                            </tr>
        `;
        
        subjects.forEach(sub => {
            let bLvl = record.bossGrades[sub];
            let pLvl = gradesData[record.playerStats[sub]].level;
            let bSubGp = getGpFromLevel(bLvl);
            let pSubGp = gradesData[record.playerStats[sub]].gp;
            
            let isDeciding = record.decideKey === sub || (record.decideKey === 'allTied' && sub === '自然');
            let subText = pSubGp > bSubGp ? '大於' : (pSubGp < bSubGp ? '小於' : (isDeciding && !record.passed ? '平手(敗北)' : '平手'));
            let subHTML = formatResult(isDeciding, subText, pSubGp > bSubGp);
            
            html += `
                            <tr class="hover:bg-[rgba(69,243,255,0.05)] transition-colors">
                                <td class="border border-gray-700 p-3 text-blue-400">${sub}</td>
                                <td class="border border-gray-700 p-3">${bLvl} <span class="text-gray-500 text-sm ml-1">(${bSubGp}點)</span></td>
                                <td class="border border-gray-700 p-3">${pLvl} <span class="text-gray-500 text-sm ml-1">(${pSubGp}點)</span></td>
                                <td class="border border-gray-700 p-3">${subHTML}</td>
                            </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    reviewContent.innerHTML = html;
}

renderStats();