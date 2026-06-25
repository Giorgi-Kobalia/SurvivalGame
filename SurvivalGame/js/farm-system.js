import { CONFIG } from './config.js';
import { Inventory } from './inventory.js';
import { GameState, getGrowDays } from './state.js';
import { saveGame } from './persistence.js';

export const FarmSystem = {
    crops: new Array(CONFIG.FARM_SLOTS).fill(null),

    plant(index, type) {
        this.crops[index] = { type: type, dayPlanted: GameState.day, stage: 1 };
        this.renderCrop(index);
        saveGame();
    },

    harvest(index) {
        const crop = this.crops[index];
        if (!crop || crop.stage < 3) return;
        Inventory.addItem(crop.type, 1);
        this.crops[index] = null;
        this.renderCrop(index);
        saveGame();
    },

    onNewDay() {
        for (let i = 0; i < this.crops.length; i++) {
            const crop = this.crops[i];
            if (!crop) continue;
            const elapsed = GameState.day - crop.dayPlanted;
            const growDays = getGrowDays(crop.type);
            if (elapsed >= growDays) {
                crop.stage = 3;
            } else if (elapsed >= Math.ceil(growDays / 2)) {
                crop.stage = 2;
            }
            this.renderCrop(i);
        }
    },

    renderCrop(index) {
        const seeds = document.querySelectorAll(".seed");
        if (!seeds[index]) return;
        const el = seeds[index];
        const crop = this.crops[index];
        el.classList.remove("ready-to-harvest");
        if (!crop) {
            el.style.backgroundImage = "url('./img/farmItems/seed.png')";
        } else if (crop.stage >= 3) {
            el.style.backgroundImage = "url('./img/farmItems/" + crop.type + "3.png')";
            el.classList.add("ready-to-harvest");
        } else {
            el.style.backgroundImage = "url('./img/farmItems/" + crop.type + crop.stage + ".png')";
        }
    },

    renderAll() {
        for (let i = 0; i < this.crops.length; i++) {
            this.renderCrop(i);
        }
    }
};
