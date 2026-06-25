import { ITEMS } from './config.js';
import { GameState } from './state.js';
import { Inventory } from './inventory.js';
import { saveGame } from './persistence.js';
import { pg, showModal, showNotification } from './ui.js';

export function renderMarket() {
    pg.style.backgroundImage = "url(./img/market.jpg)";
    pg.innerHTML =
        '<div class="pointerMarket" data-action="open-teleports"></div>' +
        '<div class="marketStall" data-action="open-market">Sell goods</div>';
}

export function showMarketModal() {
    const sellable = Inventory.slots
        .filter((s) => s && ITEMS[s.id] && ITEMS[s.id].value > 0)
        .map((s) => {
            const total = ITEMS[s.id].value * s.count;
            return '<div class="modalButtons" data-action="sell-item" data-id="' + s.id + '">' +
                       ITEMS[s.id].name + ' x' + s.count + '<br>' +
                       '<small>' + total + 'g</small>' +
                   '</div>';
        }).join("");

    showModal(
        '<div class="modalContent" style="flex-wrap:wrap; width:auto; padding:10px; gap:5px;">' +
            (sellable || '<div style="padding:20px; font-size:18px;">Nothing to sell</div>') +
            '<div style="padding:10px; width:100%; font-size:20px; border-top:2px solid black; margin-top:5px;">Gold: ' + GameState.gold + 'g</div>' +
        '</div>'
    );
}

export function handleSellItem(id) {
    const count = Inventory.getCount(id);
    if (count <= 0) return;
    if (!Inventory.removeItem(id, count)) return;
    const earned = ITEMS[id].value * count;
    GameState.gold += earned;
    GameState.render();
    saveGame();
    showNotification("+" + earned + "g!");
    showMarketModal();
}
