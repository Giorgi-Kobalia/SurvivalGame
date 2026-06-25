import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { Inventory } from './inventory.js';
import { pg, showNotification } from './ui.js';

let fishingActive = false;
let fishingMarkerPos = 0;
let fishingMarkerDir = 1;
let fishingInterval = null;
let fishingZoneStart = 30;
let fishingAutoFail = null;

export function renderFishing() {
    stopFishing();
    pg.style.backgroundImage = "url(./img/fishing.jpg)";
    pg.innerHTML =
        '<div class="pointerFishing" data-action="open-teleports"></div>' +
        '<div class="fishingArea">' +
            '<div class="fishingBtn" id="fishingBtn" data-action="start-fishing">Cast the rod</div>' +
            '<div class="fishingProgress" id="fishingProgress">' +
                '<div class="fishingBar">' +
                    '<div class="fishingZone" id="fishingZone"></div>' +
                    '<div class="fishingMarker" id="fishingMarker"></div>' +
                '</div>' +
                '<div class="fishingCatch" id="fishingCatch" data-action="catch-fish">CATCH!</div>' +
            '</div>' +
        '</div>';
}

export function handleStartFishing() {
    if (fishingActive) return;
    if (!GameState.spendEnergy(CONFIG.ENERGY_COST_FISHING)) return;
    fishingActive = true;

    document.getElementById("fishingBtn").style.display = "none";
    document.getElementById("fishingProgress").style.display = "block";

    fishingZoneStart = CONFIG.FISHING_ZONE_MIN + Math.random() * (CONFIG.FISHING_ZONE_MAX_START - CONFIG.FISHING_ZONE_MIN);
    document.getElementById("fishingZone").style.left = fishingZoneStart + "%";

    fishingMarkerPos = 0;
    fishingMarkerDir = 1;

    fishingInterval = setInterval(() => {
        fishingMarkerPos += fishingMarkerDir * CONFIG.FISHING_MARKER_SPEED;
        if (fishingMarkerPos >= 88) fishingMarkerDir = -1;
        if (fishingMarkerPos <= 0)  fishingMarkerDir = 1;
        const marker = document.getElementById("fishingMarker");
        if (marker) marker.style.left = fishingMarkerPos + "%";
    }, 30);

    fishingAutoFail = setTimeout(() => {
        if (!fishingActive) return;
        stopFishing();
        showNotification("The fish got away...");
    }, CONFIG.FISHING_AUTOFAIL_MS);
}

export function handleCatchFish() {
    if (!fishingActive) return;
    clearTimeout(fishingAutoFail);
    const inZone = fishingMarkerPos >= fishingZoneStart && fishingMarkerPos <= (fishingZoneStart + CONFIG.FISHING_ZONE_WIDTH);
    stopFishing();
    if (inZone) {
        Inventory.addItem("fish", 1);
    } else {
        showNotification("Missed! Try again.");
    }
}

export function stopFishing() {
    fishingActive = false;
    clearTimeout(fishingAutoFail);
    clearInterval(fishingInterval);
    const btn = document.getElementById("fishingBtn");
    const progress = document.getElementById("fishingProgress");
    if (btn) btn.style.display = "block";
    if (progress) progress.style.display = "none";
}
