import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { Inventory } from './inventory.js';
import { FarmSystem } from './farm-system.js';

const SAVE_KEY = "farmgame_save";
const SAVE_VERSION = 3;

export function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            v: SAVE_VERSION,
            state: {
                hunger: GameState.hunger,
                energy: GameState.energy,
                day: GameState.day,
                gold: GameState.gold,
                mineLevel: GameState.mineLevel,
                mineSpeedLevel: GameState.mineSpeedLevel,
                minerLevel: GameState.minerLevel,
                farmPlotLevel: GameState.farmPlotLevel,
                farmScarecrow: GameState.farmScarecrow,
                farmGnomeLevel: GameState.farmGnomeLevel,
            },
            inventory: Inventory.slots,
            farm: FarmSystem.crops,
        }));
    } catch (e) {}
}

export function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data.v || data.v < SAVE_VERSION) {
            localStorage.removeItem(SAVE_KEY);
            return;
        }
        if (data.state) {
            GameState.hunger         = data.state.hunger;
            GameState.energy         = data.state.energy;
            GameState.day            = data.state.day;
            GameState.gold           = data.state.gold;
            GameState.mineLevel      = data.state.mineLevel      ?? 0;
            GameState.mineSpeedLevel = data.state.mineSpeedLevel || 0;
            GameState.minerLevel     = data.state.minerLevel     || 0;
            GameState.farmPlotLevel  = data.state.farmPlotLevel  || 0;
            GameState.farmScarecrow  = data.state.farmScarecrow  || false;
            GameState.farmGnomeLevel = data.state.farmGnomeLevel || 0;
        }
        if (data.inventory) Inventory.slots = data.inventory;
        if (data.farm)      FarmSystem.crops = data.farm;
    } catch (e) {}
}

export function resetGameData() {
    localStorage.removeItem(SAVE_KEY);
    Object.assign(GameState, {
        hunger: 100,
        energy: 100,
        day: 1,
        gold: 2000,
        mineLevel: 0,
        mineSpeedLevel: 0,
        minerLevel: 0,
        farmPlotLevel: 0,
        farmScarecrow: false,
        farmGnomeLevel: 0,
    });
    Inventory.slots  = new Array(CONFIG.INVENTORY_SLOTS).fill(null);
    FarmSystem.crops = new Array(CONFIG.FARM_SLOTS).fill(null);
}
