import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { saveGame } from './persistence.js';
import { showModal, showNotification } from './ui.js';
import { startMiner, stopMiner } from './mine.js';

function tierCost(levels, level) {
    return level === 0 ? levels[0] : levels[level - 1];
}

function upgradeBtn(label, sub, action, type, canAfford, isMax) {
    if (isMax) return '<div class="modalButtons disabled">' + label + '<br><small>Max.</small></div>';
    const cls = canAfford ? "modalButtons" : "modalButtons disabled";
    const attrs = canAfford ? 'data-action="' + action + '" data-type="' + type + '"' : "";
    return '<div class="' + cls + '" ' + attrs + '>' + label + '<br><small>' + sub + '</small></div>';
}

export function showUpgrades() {
    const curCart  = CONFIG.MINE_LEVELS[GameState.mineLevel];
    const nextCart = CONFIG.MINE_LEVELS[GameState.mineLevel + 1];
    const maxCart  = !curCart.upgradeCost;
    const btnCart = upgradeBtn(
        '🚃 Carts',
        !maxCart ? (nextCart ? nextCart.carts + ' carts' : '') + ' · ' + curCart.upgradeCost + 'g' : '',
        'buy-upgrade', 'cart',
        !maxCart && GameState.gold >= curCart.upgradeCost,
        maxCart
    );

    const curSpeed  = CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel];
    const nextSpeed = CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel + 1];
    const maxSpeed  = !curSpeed.upgradeCost;
    const btnSpeed = upgradeBtn(
        '⚡ Speed',
        !maxSpeed ? (nextSpeed ? (nextSpeed.travelMs / 1000) + 's' : '') + ' · ' + curSpeed.upgradeCost + 'g' : '',
        'buy-upgrade', 'speed',
        !maxSpeed && GameState.gold >= curSpeed.upgradeCost,
        maxSpeed
    );

    const curMiner  = tierCost(CONFIG.MINE_MINER_LEVELS, GameState.minerLevel);
    const nextMiner = CONFIG.MINE_MINER_LEVELS[GameState.minerLevel];
    const maxMiner  = GameState.minerLevel > 0 && !curMiner.upgradeCost;
    const minerLabel = GameState.minerLevel === 0 ? '⛏️ Gnome' : '⛏️ Gnome lvl.' + (GameState.minerLevel + 1);
    const minerSub   = nextMiner ? nextMiner.ore + ' ore/10s · ' + curMiner.upgradeCost + 'g' : '';
    const minerAfford = !maxMiner && !!curMiner.upgradeCost && GameState.gold >= curMiner.upgradeCost;
    const btnMiner = upgradeBtn(minerLabel, minerSub, 'buy-upgrade', 'miner', minerAfford, maxMiner);

    const curPlot  = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel];
    const nextPlot = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel + 1];
    const maxPlot  = !curPlot.upgradeCost;
    const btnPlot = upgradeBtn(
        '🌱 Plots',
        !maxPlot ? (nextPlot ? nextPlot.slots + ' slots' : '') + ' · ' + curPlot.upgradeCost + 'g' : '',
        'buy-farm-upgrade', 'plot',
        !maxPlot && GameState.gold >= curPlot.upgradeCost,
        maxPlot
    );

    const btnScare = GameState.farmScarecrow
        ? '<div class="modalButtons disabled">🪄 Scarecrow<br><small>Active</small></div>'
        : upgradeBtn('🪄 Scarecrow', '−1 growth day · ' + CONFIG.FARM_SCARECROW_COST + 'g', 'buy-farm-upgrade', 'scarecrow', GameState.gold >= CONFIG.FARM_SCARECROW_COST, false);

    const curGnome  = tierCost(CONFIG.FARM_GNOME_LEVELS, GameState.farmGnomeLevel);
    const nextGnome = CONFIG.FARM_GNOME_LEVELS[GameState.farmGnomeLevel];
    const maxGnome  = GameState.farmGnomeLevel > 0 && !curGnome.upgradeCost;
    const gnomeLabel = GameState.farmGnomeLevel === 0 ? '🧑‍🌾 Farmer' : '🧑‍🌾 Farmer lvl.' + (GameState.farmGnomeLevel + 1);
    const gnomeSub   = nextGnome ? nextGnome.crops + ' crops/day · ' + curGnome.upgradeCost + 'g' : '';
    const gnomeAfford = !maxGnome && !!curGnome.upgradeCost && GameState.gold >= curGnome.upgradeCost;
    const btnGnome = upgradeBtn(gnomeLabel, gnomeSub, 'buy-farm-upgrade', 'gnome', gnomeAfford, maxGnome);

    showModal(
        '<div class="modalContent">' +
            '<div class="upgrades-title">🔨 Mine upgrades</div>' +
            btnCart + btnSpeed + btnMiner +
            '<div class="upgrades-title">🌾 Farm upgrades</div>' +
            btnPlot + btnScare + btnGnome +
        '</div>'
    );
}

export function handleBuyUpgrade(type) {
    if (type === "cart") {
        const cur = CONFIG.MINE_LEVELS[GameState.mineLevel];
        if (!cur.upgradeCost || GameState.gold < cur.upgradeCost) return;
        GameState.gold -= cur.upgradeCost;
        GameState.mineLevel++;
        showNotification("🚃 Carts: " + CONFIG.MINE_LEVELS[GameState.mineLevel].carts);
    } else if (type === "speed") {
        const cur = CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel];
        if (!cur.upgradeCost || GameState.gold < cur.upgradeCost) return;
        GameState.gold -= cur.upgradeCost;
        GameState.mineSpeedLevel++;
        showNotification("⚡ Speed lvl. " + (GameState.mineSpeedLevel + 1));
    } else if (type === "miner") {
        const cur = tierCost(CONFIG.MINE_MINER_LEVELS, GameState.minerLevel);
        if (!cur.upgradeCost || GameState.gold < cur.upgradeCost) return;
        GameState.gold -= cur.upgradeCost;
        GameState.minerLevel++;
        const newOre = CONFIG.MINE_MINER_LEVELS[GameState.minerLevel - 1].ore;
        showNotification(GameState.minerLevel === 1
            ? "⛏️ Gnome hired! Mines " + newOre + " ore/10s"
            : "⛏️ Gnome lvl." + GameState.minerLevel + " — " + newOre + " ore/10s");
        stopMiner();
        startMiner();
    } else {
        return;
    }
    GameState.render();
    saveGame();
    showUpgrades();
}

export function handleBuyFarmUpgrade(type) {
    if (type === "plot") {
        const cur = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel];
        if (!cur.upgradeCost || GameState.gold < cur.upgradeCost) return;
        GameState.gold -= cur.upgradeCost;
        GameState.farmPlotLevel++;
        showNotification("🌱 Plots: " + CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel].slots);
    } else if (type === "scarecrow") {
        if (GameState.farmScarecrow || GameState.gold < CONFIG.FARM_SCARECROW_COST) return;
        GameState.gold -= CONFIG.FARM_SCARECROW_COST;
        GameState.farmScarecrow = true;
        showNotification("🪄 Scarecrow placed! Crops grow faster");
    } else if (type === "gnome") {
        const cur = tierCost(CONFIG.FARM_GNOME_LEVELS, GameState.farmGnomeLevel);
        if (!cur.upgradeCost || GameState.gold < cur.upgradeCost) return;
        GameState.gold -= cur.upgradeCost;
        GameState.farmGnomeLevel++;
        const cnt = CONFIG.FARM_GNOME_LEVELS[GameState.farmGnomeLevel - 1].crops;
        showNotification(GameState.farmGnomeLevel === 1
            ? "🧑‍🌾 Farmer hired! Brings " + cnt + " crops/day"
            : "🧑‍🌾 Farmer lvl." + GameState.farmGnomeLevel + " — " + cnt + " crops/day");
    } else {
        return;
    }
    GameState.render();
    saveGame();
    showUpgrades();
}
