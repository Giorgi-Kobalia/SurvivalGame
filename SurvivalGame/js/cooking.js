import { CONFIG, RECIPES } from './config.js';
import { Inventory } from './inventory.js';
import { hideModal, showNotification } from './ui.js';

let cookingActive = false;
let cookingReady = false;
let cookingRecipeId = null;
let cookingRemainingSec = 0;
let cookingTimerInterval = null;

export function isCooking() { return cookingActive; }
export function isCookingReady() { return cookingReady; }

function fmtTime(s) {
    return "00:" + (s < 10 ? "0" : "") + s;
}

export function startCooking(id) {
    if (cookingActive || cookingReady) return;
    const recipe = RECIPES[id];
    if (!recipe) return;
    for (const item in recipe.needs) {
        if (Inventory.getCount(item) < recipe.needs[item]) return;
    }
    for (const item in recipe.needs) {
        Inventory.removeItem(item, recipe.needs[item]);
    }

    cookingActive = true;
    cookingRecipeId = id;
    cookingRemainingSec = Math.ceil(CONFIG.COOKING_TIME_MS / 1000);
    hideModal();
    renderBoiler();
    showNotification("Cooking: " + recipe.name + "...");

    clearInterval(cookingTimerInterval);
    cookingTimerInterval = setInterval(() => {
        cookingRemainingSec--;
        if (cookingRemainingSec <= 0) {
            clearInterval(cookingTimerInterval);
            cookingTimerInterval = null;
            cookingActive = false;
            cookingReady = true;
            renderBoiler();
            showNotification(recipe.name + " is ready! Click the boiler to collect.");
        } else {
            renderBoiler();
        }
    }, 1000);
}

export function collectCooking() {
    if (!cookingReady) return;
    const recipe = RECIPES[cookingRecipeId];
    cookingReady = false;
    cookingRecipeId = null;
    renderBoiler();
    if (recipe) Inventory.addItem(recipe.result, 1);
}

export function renderBoiler() {
    const fire = document.querySelector(".fire");
    const boiler = document.querySelector(".boiler");
    const timer = document.getElementById("cookingTimer");
    if (fire) fire.style.display = cookingActive ? "block" : "none";
    if (boiler) boiler.classList.toggle("ready-to-collect", cookingReady);
    if (timer) {
        if (cookingActive) {
            timer.textContent = fmtTime(cookingRemainingSec);
            timer.classList.add("active");
        } else {
            timer.textContent = "";
            timer.classList.remove("active");
        }
    }
}
