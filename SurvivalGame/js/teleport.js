import { CONFIG } from './config.js';
import { GameState } from './state.js';
import { disableClick, enableClick, addAnimation, removeAnimation, showModal, hideModal } from './ui.js';
import { renderHome } from './home.js';
import { renderMine } from './mine.js';
import { renderFarm } from './farm-screen.js';
import { renderFishing, stopFishing } from './fishing.js';
import { renderMarket } from './market.js';

const SCREENS = {
    home: renderHome,
    mine: renderMine,
    farm: renderFarm,
    fishing: renderFishing,
    market: renderMarket,
};

export function teleportTo(screenName) {
    const render = SCREENS[screenName];
    if (!render) return;
    stopFishing();
    disableClick();
    addAnimation();
    setTimeout(render, CONFIG.TELEPORT_TRAVEL_MS);
    setTimeout(removeAnimation, CONFIG.TELEPORT_TOTAL_MS);
    setTimeout(enableClick, CONFIG.TELEPORT_TOTAL_MS);
    hideModal();
}

export function goToSleep() {
    stopFishing();
    disableClick();
    addAnimation();
    setTimeout(() => {
        GameState.sleep();
        renderHome();
    }, CONFIG.TELEPORT_TRAVEL_MS);
    setTimeout(removeAnimation, CONFIG.TELEPORT_TOTAL_MS);
    setTimeout(enableClick, CONFIG.TELEPORT_TOTAL_MS);
}

export function showTeleportsModal() {
    showModal(
        '<div class="modalContent">' +
            '<div class="modalButtons" data-action="teleport" data-target="home">Home</div>' +
            '<div class="modalButtons" data-action="teleport" data-target="mine">Mine</div>' +
            '<div class="modalButtons" data-action="teleport" data-target="farm">Farm</div>' +
            '<div class="modalButtons" data-action="teleport" data-target="fishing">Fishing</div>' +
            '<div class="modalButtons" data-action="teleport" data-target="market">Market</div>' +
        '</div>'
    );
}
