import { RECIPES, ITEMS } from './config.js';
import { Inventory } from './inventory.js';
import { showModal, hideModal, showNotification } from './ui.js';

export function showRecipes() {
    const buttons = Object.keys(RECIPES).map((id) => {
        const r = RECIPES[id];
        const needs = Object.keys(r.needs).map((item) => ITEMS[item].name + " x" + r.needs[item]).join(", ");
        const canCraft = Object.keys(r.needs).every((item) => Inventory.getCount(item) >= r.needs[item]);
        const cls = canCraft ? "modalButtons" : "modalButtons disabled";
        const attrs = canCraft ? 'data-action="craft-recipe" data-id="' + id + '"' : "";
        return '<div class="' + cls + '" ' + attrs + '>' +
                   r.name + '<br><small>' + needs + '</small>' +
               '</div>';
    }).join("");

    showModal('<div class="modalContent" style="flex-wrap:wrap;">' + buttons + '</div>');
}

export function handleCraftRecipe(id) {
    const recipe = RECIPES[id];
    for (const item in recipe.needs) {
        Inventory.removeItem(item, recipe.needs[item]);
    }
    Inventory.addItem(recipe.result, 1);
    hideModal();
    showNotification("Ready: " + recipe.name + "! (click the slot to eat)");
}
