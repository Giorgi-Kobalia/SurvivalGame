import { GameState } from './state.js';
import { Inventory } from './inventory.js';
import { ITEMS } from './config.js';
import { loadGame, resetGameData } from './persistence.js';
import { initModalBackdropClose, showNotification } from './ui.js';
import { renderHome } from './home.js';
import { handleMineClick, startMiner, stopMiner } from './mine.js';
import { handleSeedClick, handlePlantCrop } from './farm-screen.js';
import { handleStartFishing, handleCatchFish } from './fishing.js';
import { showMarketModal, handleSellItem } from './market.js';
import { handleBoilerClick, handleCraftRecipe } from './recipes.js';
import { showUpgrades, handleBuyUpgrade, handleBuyFarmUpgrade } from './upgrades.js';
import { teleportTo, goToSleep, showTeleportsModal } from './teleport.js';

function handleInventorySlotClick(index) {
    const slot = Inventory.slots[index];
    if (!slot) return;
    const item = ITEMS[slot.id];
    if (item && item.heals > 0) GameState.eat(slot.id);
}

function handleResetGame() {
    if (!confirm("Reset progress?")) return;
    stopMiner();
    resetGameData();
    GameState.render();
    Inventory.render();
    renderHome();
    showNotification("New game!");
}

const ACTIONS = {
    "open-teleports": () => showTeleportsModal(),
    "teleport":        (el) => teleportTo(el.dataset.target),
    "sleep":           () => goToSleep(),
    "open-upgrades":   () => showUpgrades(),
    "open-recipes":    () => handleBoilerClick(),
    "mine":            () => handleMineClick(),
    "seed-click":      (el) => handleSeedClick(Number(el.dataset.index)),
    "plant":           (el) => handlePlantCrop(Number(el.dataset.index), el.dataset.crop),
    "start-fishing":   () => handleStartFishing(),
    "catch-fish":      () => handleCatchFish(),
    "open-market":     () => showMarketModal(),
    "sell-item":       (el) => handleSellItem(el.dataset.id),
    "craft-recipe":    (el) => handleCraftRecipe(el.dataset.id),
    "buy-upgrade":     (el) => handleBuyUpgrade(el.dataset.type),
    "buy-farm-upgrade": (el) => handleBuyFarmUpgrade(el.dataset.type),
    "reset-game":      () => handleResetGame(),
    "inventory-slot":  (el) => handleInventorySlotClick(Number(el.dataset.index)),
};

document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const handler = ACTIONS[target.dataset.action];
    if (handler) handler(target);
});

initModalBackdropClose();

loadGame();
GameState.render();
Inventory.render();
if (GameState.minerLevel > 0) startMiner();
renderHome();
