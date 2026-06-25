import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { Inventory } from './inventory.js';
import { pg, disableClick, enableClick, showNotification } from './ui.js';

let miningActive = false;
let miningTimerInterval = null;
let minerInterval = null;
let minerCountdown = CONFIG.MINE_MINER_CD_SEC;

function getTravelMs() {
    return CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel].travelMs;
}

function mineOreCount() {
    const lvl = CONFIG.MINE_LEVELS[GameState.mineLevel];
    return lvl.oreMin + Math.floor(Math.random() * (lvl.oreMax - lvl.oreMin + 1));
}

function getCartIds() {
    const count = CONFIG.MINE_LEVELS[GameState.mineLevel].carts;
    return Array.from({ length: count }, (_, i) => "cart" + (i + 1));
}

export function renderMine() {
    pg.style.backgroundImage = "url(./img/mine.jpg)";
    const cartCount = CONFIG.MINE_LEVELS[GameState.mineLevel].carts;
    let cartsHTML = "";
    for (let i = 1; i <= cartCount; i++) {
        cartsHTML += '<div class="carts" id="cart' + i + '"></div>';
    }
    const gnomeHTML = GameState.minerLevel > 0
        ? '<div class="gnomePlace"><div class="gnomeTimer" id="gnomeTimer">' + CONFIG.MINE_MINER_CD_SEC + '</div></div>'
        : '';
    pg.innerHTML =
        '<div class="skyMine"></div>' +
        '<div class="mineBack"></div>' +
        '<div class="mineFront"></div>' +
        '<div class="pointerMine" data-action="open-teleports"></div>' +
        '<div class="mineTimer" id="mineTimer"></div>' +
        gnomeHTML +
        '<div class="cartPlace" id="cartPlace" data-action="mine">' + cartsHTML + '</div>';

    if (GameState.minerLevel > 0) startMiner();
}

function startMineTimer(seconds) {
    clearInterval(miningTimerInterval);
    const el = document.getElementById("mineTimer");
    if (!el) return;
    const fmt = (s) => "00:" + (s < 10 ? "0" : "") + s;
    let remaining = seconds;
    el.textContent = fmt(remaining);
    el.classList.add("active");
    miningTimerInterval = setInterval(() => {
        remaining--;
        const timerEl = document.getElementById("mineTimer");
        if (!timerEl) { clearInterval(miningTimerInterval); return; }
        if (remaining <= 0) {
            clearInterval(miningTimerInterval);
            timerEl.classList.remove("active");
            timerEl.textContent = "";
        } else {
            timerEl.textContent = fmt(remaining);
        }
    }, 1000);
}

export function handleMineClick() {
    if (miningActive) return;
    if (!GameState.spendEnergy(CONFIG.ENERGY_COST_MINING)) return;
    miningActive = true;
    const travelMs = getTravelMs();
    const totalMs = travelMs * 2 + 2000;
    const cartIds = getCartIds();
    startMineTimer(Math.ceil(totalMs / 1000));
    cartAnimate(cartIds, travelMs, true);
    setTimeout(() => {
        setTimeout(() => {
            cartAnimate(cartIds, travelMs, false);
        }, 2000);
    }, travelMs);
    setTimeout(() => {
        cartReset(cartIds);
        Inventory.addItem("ore", mineOreCount());
        miningActive = false;
        enableClick();
    }, totalMs);
}

function cartAnimate(ids, travelMs, toLeft) {
    const sec = (travelMs / 1000) + "s";
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (toLeft) {
            el.style.animation = "cartToLeft " + sec + " linear forwards";
            el.style.backgroundImage = "url(./img/mineItems/cartG.gif)";
        } else {
            el.style.animation = "cartToRight " + sec + " linear";
            el.style.backgroundImage = "url(./img/mineItems/cartFullG.gif)";
        }
    });
    if (toLeft) disableClick();
}

function cartReset(ids) {
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.animation = "none";
        el.style.backgroundImage = "url(./img/mineItems/cart.png)";
    });
}

export function startMiner() {
    if (minerInterval) return;
    minerCountdown = CONFIG.MINE_MINER_CD_SEC;
    minerInterval = setInterval(() => {
        minerCountdown--;
        const el = document.getElementById("gnomeTimer");
        if (el) el.textContent = minerCountdown;
        if (minerCountdown <= 0) {
            minerCountdown = CONFIG.MINE_MINER_CD_SEC;
            if (el) el.textContent = minerCountdown;
            const ore = CONFIG.MINE_MINER_LEVELS[GameState.minerLevel - 1].ore;
            Inventory.addItem("ore", ore);
            showNotification("⛏️ The gnome mined " + ore + " ore!");
        }
    }, 1000);
}

export function stopMiner() {
    clearInterval(minerInterval);
    minerInterval = null;
    minerCountdown = CONFIG.MINE_MINER_CD_SEC;
}
