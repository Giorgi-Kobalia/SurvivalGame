import { pg } from './ui.js';

export function renderHome() {
    pg.style.backgroundImage = "url(./img/home.jpg)";
    pg.innerHTML =
        '<div class="trees"></div>' +
        '<div class="blueprint" data-action="open-upgrades"></div>' +
        '<div class="pointerHome" data-action="open-teleports"></div>' +
        '<div class="fire"></div>' +
        '<div class="boiler" data-action="open-recipes"></div>' +
        '<div class="skyHome"></div>' +
        '<div class="birdsHome"></div>' +
        '<div class="bed" data-action="sleep"></div>';
}
