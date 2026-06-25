import { CROP_GROW_DAYS } from './config.js';
import { ITEMS, CONFIG } from './config.js';
import { Inventory } from './inventory.js';
import { FarmSystem } from './farm-system.js';
import { showNotification } from './ui.js';
import { saveGame } from './persistence.js';

export const GameState = {
    hunger: 100,
    energy: 100,
    day: 1,
    gold: 2000,
    mineLevel:      0,
    mineSpeedLevel:  0,
    minerLevel:      0,
    farmPlotLevel:   0,
    farmScarecrow:   false,
    farmGnomeLevel:  0,

    render() {
        document.getElementById("hunger-bar").style.width = this.hunger + "%";
        document.getElementById("energy-bar").style.width = this.energy + "%";
        document.getElementById("days").textContent = "Day " + this.day;
        document.getElementById("gold-display").textContent = "💰 " + this.gold + "g";

        const hungerVal = document.getElementById("hunger-val");
        const energyVal = document.getElementById("energy-val");
        if (hungerVal) hungerVal.textContent = Math.round(this.hunger);
        if (energyVal) energyVal.textContent = Math.round(this.energy);

        const hb = document.getElementById("hunger-bar");
        hb.style.backgroundColor = this.hunger > 50 ? "#2ecc71" : this.hunger > 25 ? "#e67e22" : "#e74c3c";

        const eb = document.getElementById("energy-bar");
        eb.style.backgroundColor = this.energy > 50 ? "#3498db" : this.energy > 25 ? "#9b59b6" : "#c0392b";
    },

    spendEnergy(energyAmt, hungerAmt = energyAmt * 0.5) {
        if (this.energy <= 0 || this.hunger <= 0) {
            showNotification("Too tired!");
            return false;
        }
        this.energy = Math.max(0, this.energy - energyAmt);
        this.hunger = Math.max(0, this.hunger - hungerAmt);
        this.render();
        saveGame();
        return true;
    },

    sleep() {
        this.energy = 100;
        this.day++;
        FarmSystem.onNewDay();
        if (this.farmGnomeLevel > 0) {
            const count = CONFIG.FARM_GNOME_LEVELS[this.farmGnomeLevel - 1].crops;
            for (let i = 0; i < count; i++) {
                const crop = CONFIG.FARM_CROPS[Math.floor(Math.random() * CONFIG.FARM_CROPS.length)];
                Inventory.addItem(crop, 1);
            }
            showNotification("🧑‍🌾 The farmer brought " + count + " crops!");
        }
        this.render();
        saveGame();
    },

    eat(itemId) {
        const item = ITEMS[itemId];
        if (!item || !item.heals) return false;
        if (!Inventory.removeItem(itemId, 1)) return false;
        this.hunger = Math.min(100, this.hunger + item.heals);
        this.render();
        showNotification("+" + item.heals + " hunger");
        saveGame();
        return true;
    }
};

export function getGrowDays(type) {
    const base = CROP_GROW_DAYS[type] || 2;
    return Math.max(1, base - (GameState.farmScarecrow ? 1 : 0));
}
