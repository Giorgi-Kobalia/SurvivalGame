import { RECIPES, ITEMS, CROP_EMOJI } from './config.js';
import { Inventory } from './inventory.js';
import { showModal, showNotification } from './ui.js';
import { startCooking, isCooking, isCookingReady, collectCooking } from './cooking.js';

function ingredientEmoji(item) {
    return CROP_EMOJI[item] || ITEMS[item].emoji || ITEMS[item].name;
}

export function showRecipes() {
    const buttons = Object.keys(RECIPES).map((id) => {
        const r = RECIPES[id];
        const needs = Object.keys(r.needs).map((item) => ingredientEmoji(item) + r.needs[item]).join(" ");
        const canCraft = Object.keys(r.needs).every((item) => Inventory.getCount(item) >= r.needs[item]);
        const cls = canCraft ? "modalButtons" : "modalButtons disabled";
        const attrs = canCraft ? 'data-action="craft-recipe" data-id="' + id + '"' : "";
        return '<div class="' + cls + '" ' + attrs + '>' +
                   '<span class="recipeHeals">+' + r.heals + '</span>' +
                   r.name + '<br><small>' + needs + '</small>' +
               '</div>';
    }).join("");

    showModal('<div class="modalContent" style="flex-wrap:wrap;">' + buttons + '</div>');
}

export function handleCraftRecipe(id) {
    startCooking(id);
}

export function handleBoilerClick() {
    if (isCookingReady()) {
        collectCooking();
    } else if (isCooking()) {
        showNotification("Still cooking...");
    } else {
        showRecipes();
    }
}
