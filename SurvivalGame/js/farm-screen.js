import { CONFIG, ITEMS, CROP_EMOJI } from './config.js';
import { GameState, getGrowDays } from './state.js';
import { FarmSystem } from './farm-system.js';
import { pg, showModal, hideModal, showNotification } from './ui.js';

export function renderFarm() {
    pg.style.backgroundImage = "url(./img/Farm.jpg)";
    const activeSlots = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel].slots;
    let seedsHTML = "";
    for (let i = 0; i < CONFIG.FARM_SLOTS; i++) {
        seedsHTML += i < activeSlots
            ? '<div class="seed" data-action="seed-click" data-index="' + i + '"></div>'
            : '<div class="seed seed-locked"></div>';
    }
    const farmGnomeHTML = GameState.farmGnomeLevel > 0
        ? '<div class="farmGnomePlace"></div>'
        : '';
    pg.innerHTML =
        '<div class="windmill"></div>' +
        '<div class="skyFarm"></div>' +
        '<div class="seedbeds" id="seedbeds">' + seedsHTML + '</div>' +
        farmGnomeHTML +
        '<div class="stickman" id="farmScarecrow" style="display:' + (GameState.farmScarecrow ? 'block' : 'none') + '"></div>' +
        '<div class="pointerFarm" data-action="open-teleports"></div>';

    FarmSystem.renderAll();
}

export function handleSeedClick(index) {
    const crop = FarmSystem.crops[index];
    if (!crop) {
        showSeedPicker(index);
    } else if (crop.stage >= 3) {
        FarmSystem.harvest(index);
    } else {
        const daysLeft = getGrowDays(crop.type) - (GameState.day - crop.dayPlanted);
        showNotification("Growing... ~" + daysLeft + " days left.");
    }
}

function showSeedPicker(index) {
    const wd = GameState.farmScarecrow ? ' (−1 day)' : '';
    const buttons = CONFIG.FARM_CROPS.map((crop) => (
        '<div class="modalButtons" data-action="plant" data-index="' + index + '" data-crop="' + crop + '">' +
            (CROP_EMOJI[crop] || '') + ' ' + ITEMS[crop].name + '<br><small>' + getGrowDays(crop) + ' days' + wd + '</small>' +
        '</div>'
    )).join('');
    showModal('<div class="modalContent">' + buttons + '</div>');
}

export function handlePlantCrop(index, type) {
    if (!GameState.spendEnergy(CONFIG.ENERGY_COST_PLANT)) return;
    FarmSystem.plant(index, type);
    hideModal();
    showNotification("Planted: " + ITEMS[type].name);
}
