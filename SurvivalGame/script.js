// ================================================================ CONFIG

const CONFIG = {
    ENERGY_COST_MINING:   10,
    ENERGY_COST_FISHING:  5,
    ENERGY_COST_PLANT:    5,
    FISHING_AUTOFAIL_MS:  6000,
    FISHING_MARKER_SPEED: 2.5,
    FISHING_ZONE_WIDTH:   20,
    FISHING_ZONE_MIN:     10,
    FISHING_ZONE_MAX_START: 65,
    INVENTORY_SLOTS:      18,
    FARM_SLOTS:           8,
    // улучшение 1: вагонетки
    MINE_LEVELS: [
        { carts: 1, oreMin: 1, oreMax: 3, upgradeCost: 50  },
        { carts: 2, oreMin: 2, oreMax: 6, upgradeCost: 100 },
        { carts: 3, oreMin: 3, oreMax: 9, upgradeCost: null },
    ],
    // улучшение 2: скорость (время поездки в мс, внутри всегда 2000)
    MINE_SPEED_LEVELS: [
        { travelMs: 5000, upgradeCost: 75  },
        { travelMs: 3000, upgradeCost: 125 },
        { travelMs: 1500, upgradeCost: null },
    ],
    // улучшение 3: гном-майнер (уровни; upgradeCost = цена перехода с этого уровня на следующий)
    MINE_MINER_LEVELS: [
        { ore: 2, upgradeCost: 200 },
        { ore: 4, upgradeCost: 350 },
        { ore: 6, upgradeCost: null },
    ],
    MINE_MINER_CD_SEC: 10,

    // ---- ферма ----
    FARM_PLOT_LEVELS: [
        { slots: 3, upgradeCost: 50  },
        { slots: 4, upgradeCost: 75  },
        { slots: 5, upgradeCost: 100 },
        { slots: 6, upgradeCost: 125 },
        { slots: 7, upgradeCost: 150 },
        { slots: 8, upgradeCost: null },
    ],
    FARM_SCARECROW_COST: 150,
    FARM_GNOME_LEVELS: [
        { crops: 1, upgradeCost: 400 },
        { crops: 2, upgradeCost: 600 },
        { crops: 3, upgradeCost: null },
    ],
    FARM_CROPS: ['wheat', 'cucumber', 'tomato'],
};

// ================================================================ ITEMS DATA

const ITEMS = {
    wheat:    { name: "Пшеница",  icon: "farmItems/wheat3",    emoji: null, value: 5,  heals: 0  },
    cucumber: { name: "Огурец",   icon: "farmItems/cucumber3", emoji: null, value: 8,  heals: 0  },
    tomato:   { name: "Помидор",  icon: "farmItems/tomato3",   emoji: null, value: 10, heals: 0  },
    ore:      { name: "Руда",     icon: "mineItems/cartFull",  emoji: null, value: 15, heals: 0  },
    fish:     { name: "Рыба",     icon: null, emoji: "🐟",     value: 12, heals: 20 },
    bread:    { name: "Хлеб",     icon: null, emoji: "🍞",     value: 0,  heals: 30 },
    soup:     { name: "Суп",      icon: null, emoji: "🍲",     value: 0,  heals: 40 },
    fries:    { name: "Жаркое",   icon: null, emoji: "🍳",     value: 0,  heals: 25 },
};

const CROP_GROW_DAYS = { wheat: 2, cucumber: 3, tomato: 3 };

function getGrowDays(type) {
    var base = CROP_GROW_DAYS[type] || 2;
    return Math.max(1, base - (GameState.farmScarecrow ? 1 : 0));
}

// ================================================================ GAME STATE

const GameState = {
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
        document.getElementById("days").textContent = "День " + this.day;
        document.getElementById("gold-display").textContent = "💰 " + this.gold + "g";

        const hungerVal = document.getElementById("hunger-val");
        const energyVal = document.getElementById("energy-val");
        if (hungerVal) hungerVal.textContent = Math.round(this.hunger);
        if (energyVal) energyVal.textContent = Math.round(this.energy);

        const hb = document.getElementById("hunger-bar");
        hb.style.backgroundColor = this.hunger > 50 ? "#2ecc71" : this.hunger > 25 ? "#e67e22" : "#e74c3c";

        const eb = document.getElementById("energy-bar");
        eb.style.backgroundColor = this.energy > 50 ? "#3498db" : this.energy > 25 ? "#9b59b6" : "#c0392b";

        saveGame();
    },

    spendEnergy(energyAmt, hungerAmt) {
        if (hungerAmt === undefined) hungerAmt = energyAmt * 0.5;
        if (this.energy <= 0 || this.hunger <= 0) {
            showNotification("Ты слишком устал!");
            return false;
        }
        this.energy = Math.max(0, this.energy - energyAmt);
        this.hunger = Math.max(0, this.hunger - hungerAmt);
        this.render();
        return true;
    },

    sleep() {
        this.energy = 100;
        this.day++;
        FarmSystem.onNewDay();
        if (this.farmGnomeLevel > 0) {
            var count = CONFIG.FARM_GNOME_LEVELS[this.farmGnomeLevel - 1].crops;
            for (var i = 0; i < count; i++) {
                var crop = CONFIG.FARM_CROPS[Math.floor(Math.random() * CONFIG.FARM_CROPS.length)];
                Inventory.addItem(crop, 1);
            }
            showNotification("🧑‍🌾 Фермер принёс " + count + " урожай!");
        }
        this.render();
    },

    eat(itemId) {
        const item = ITEMS[itemId];
        if (!item || !item.heals) return false;
        if (!Inventory.removeItem(itemId, 1)) return false;
        this.hunger = Math.min(100, this.hunger + item.heals);
        this.render();
        showNotification("+" + item.heals + " сытости");
        return true;
    }
};

// ================================================================ INVENTORY

const Inventory = {
    slots: new Array(18).fill(null),

    addItem(id, count) {
        if (count === undefined) count = 1;
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] && this.slots[i].id === id) {
                this.slots[i].count += count;
                this.render();
                showNotification("+" + count + " " + ITEMS[id].name);
                saveGame();
                return true;
            }
        }
        for (let i = 0; i < this.slots.length; i++) {
            if (!this.slots[i]) {
                this.slots[i] = { id: id, count: count };
                this.render();
                showNotification("+" + count + " " + ITEMS[id].name);
                saveGame();
                return true;
            }
        }
        showNotification("Инвентарь полон!");
        return false;
    },

    removeItem(id, count) {
        if (count === undefined) count = 1;
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] && this.slots[i].id === id) {
                if (this.slots[i].count < count) return false;
                this.slots[i].count -= count;
                if (this.slots[i].count === 0) this.slots[i] = null;
                this.render();
                saveGame();
                return true;
            }
        }
        return false;
    },

    getCount(id) {
        for (const slot of this.slots) {
            if (slot && slot.id === id) return slot.count;
        }
        return 0;
    },

    render() {
        const itemEls = document.querySelectorAll(".items");
        itemEls.forEach((el, i) => {
            const slot = this.slots[i];
            if (slot && ITEMS[slot.id]) {
                const item = ITEMS[slot.id];
                const wasEmpty = !el.classList.contains("has-item");
                el.classList.add("has-item");
                el.style.backgroundImage = item.icon ? "url('./img/" + item.icon + ".png')" : "none";
                el.style.backgroundSize = "cover";
                el.style.backgroundRepeat = "no-repeat";
                el.style.backgroundPosition = "center";
                const emojiHtml = item.emoji ? "<span class='item-emoji'>" + item.emoji + "</span>" : "";
                el.innerHTML = emojiHtml +
                               "<span class='item-count'>" + slot.count + "</span>" +
                               "<span class='item-name'>" + item.name + "</span>";
                const tipParts = [item.name];
                if (item.heals) tipParts.push("+" + item.heals + " сытости");
                if (item.value) tipParts.push("Цена: " + item.value + "g");
                el.title = tipParts.join("\n");
                el.onclick = () => this.onSlotClick(i);
                if (wasEmpty) {
                    el.classList.add("item-pop");
                    setTimeout(() => el.classList.remove("item-pop"), 350);
                }
            } else {
                el.classList.remove("has-item");
                el.style.backgroundImage = "none";
                el.innerHTML = "";
                el.title = "";
                el.onclick = null;
            }
        });
    },

    onSlotClick(i) {
        const slot = this.slots[i];
        if (!slot) return;
        const item = ITEMS[slot.id];
        if (item && item.heals > 0) {
            GameState.eat(slot.id);
        }
    }
};

// ================================================================ FARM SYSTEM

const FarmSystem = {
    crops: new Array(8).fill(null),

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

// ================================================================ SAVE / LOAD

var SAVE_VERSION = 3;

function saveGame() {
    try {
        localStorage.setItem("farmgame_save", JSON.stringify({
            v:         SAVE_VERSION,
            state:     { hunger: GameState.hunger, energy: GameState.energy, day: GameState.day, gold: GameState.gold, mineLevel: GameState.mineLevel, mineSpeedLevel: GameState.mineSpeedLevel, minerLevel: GameState.minerLevel, farmPlotLevel: GameState.farmPlotLevel, farmScarecrow: GameState.farmScarecrow, farmGnomeLevel: GameState.farmGnomeLevel },
            inventory: Inventory.slots,
            farm:      FarmSystem.crops,
        }));
    } catch(e) {}
}

function loadGame() {
    try {
        const raw = localStorage.getItem("farmgame_save");
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data.v || data.v < SAVE_VERSION) {
            localStorage.removeItem("farmgame_save");
            return;
        }
        if (data.state) {
            GameState.hunger          = data.state.hunger;
            GameState.energy          = data.state.energy;
            GameState.day             = data.state.day;
            GameState.gold            = data.state.gold;
            GameState.mineLevel       = data.state.mineLevel      ?? 0;
            GameState.mineSpeedLevel  = data.state.mineSpeedLevel || 0;
            GameState.minerLevel      = data.state.minerLevel     || 0;
            GameState.farmPlotLevel   = data.state.farmPlotLevel  || 0;
            GameState.farmScarecrow   = data.state.farmScarecrow  || false;
            GameState.farmGnomeLevel  = data.state.farmGnomeLevel || 0;
        }
        if (data.inventory) Inventory.slots = data.inventory;
        if (data.farm)      FarmSystem.crops = data.farm;
    } catch(e) {}
}

function resetGame() {
    if (!confirm("Сбросить прогресс?")) return;
    localStorage.removeItem("farmgame_save");
    GameState.hunger          = 100;
    GameState.energy          = 100;
    GameState.day             = 1;
    GameState.gold            = 2000;
    GameState.mineLevel       = 0;
    GameState.mineSpeedLevel  = 0;
    GameState.minerLevel      = 0;
    GameState.farmPlotLevel   = 0;
    GameState.farmScarecrow   = false;
    GameState.farmGnomeLevel  = 0;
    stopMiner();
    Inventory.slots  = new Array(CONFIG.INVENTORY_SLOTS).fill(null);
    FarmSystem.crops = new Array(CONFIG.FARM_SLOTS).fill(null);
    GameState.render();
    Inventory.render();
    innerHome();
    showNotification("Новая игра!");
}

// ================================================================ NOTIFICATION

function showNotification(text) {
    const el = document.getElementById("notification");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove("show"), 2500);
}

// ================================================================ TELEPORTATIONS

const pg   = document.getElementById("playground");
const cl   = document.getElementById("cl");
const cr   = document.getElementById("cr");
const nav  = document.getElementById("navigation");
const modal = document.getElementById("modal");

cl.style.animation = "none";
cr.style.animation = "none";

function enableClick()  { nav.style.pointerEvents = "all";  }
function disableClick() { nav.style.pointerEvents = "none"; }

function addAnimation() {
    cl.style.animation = "go_right 4s linear";
    cr.style.animation = "go_left 4s linear";
}
function removeAnimation() {
    cl.style.animation = "none";
    cr.style.animation = "none";
}

function teleportTo(innerFn) {
    disableClick();
    addAnimation();
    setTimeout(innerFn, 2000);
    setTimeout(removeAnimation, 4500);
    setTimeout(enableClick, 4500);
    modal.style.display = "none";
}

function tpHome()    { teleportTo(innerHome);    }
function tpMine()    { teleportTo(innerMine);    }
function tpFarm()    { teleportTo(innerFarm);    }
function tpFishing() { teleportTo(innerFishing); }
function tpMarket()  { teleportTo(innerMarket);  }

// ================================================================ SLEEP

function goToSleep() {
    disableClick();
    addAnimation();
    setTimeout(function() {
        GameState.sleep();
        innerHome();
    }, 2000);
    setTimeout(removeAnimation, 4500);
    setTimeout(enableClick, 4500);
}

// ================================================================ HOME

function innerHome() {
    pg.style.backgroundImage = "url(./img/Home.jpg)";
    pg.innerHTML =
        '<div class="trees"></div>' +
        '<div class="blueprint" onclick="showUpgrades()"></div>' +
        '<div class="pointerHome" onclick="showTeleports()"></div>' +
        '<div class="fire"></div>' +
        '<div class="boiler" onclick="showRecipes()"></div>' +
        '<div class="skyHome"></div>' +
        '<div class="birdsHome"></div>' +
        '<div class="bed" onclick="goToSleep()"></div>';
}

// ================================================================ MINE

let miningActive      = false;
let miningTimerInterval = null;
let minerInterval     = null;

function getTravelMs() {
    return CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel].travelMs;
}

function mineOreCount() {
    var lvl = CONFIG.MINE_LEVELS[GameState.mineLevel];
    return lvl.oreMin + Math.floor(Math.random() * (lvl.oreMax - lvl.oreMin + 1));
}

function innerMine() {
    pg.style.backgroundImage = "url(./img/mine.jpg)";
    var cartCount = CONFIG.MINE_LEVELS[GameState.mineLevel].carts;
    var cartsHTML = "";
    for (var i = 1; i <= cartCount; i++) {
        cartsHTML += '<div class="carts" id="cart' + i + '"></div>';
    }
    var gnomeHTML = GameState.minerLevel > 0
        ? '<div class="gnomePlace"><div class="gnomeTimer" id="gnomeTimer">' + CONFIG.MINE_MINER_CD_SEC + '</div></div>'
        : '';
    pg.innerHTML =
        '<div class="skyMine"></div>' +
        '<div class="mineBack"></div>' +
        '<div class="mineFront"></div>' +
        '<div class="pointerMine" onclick="showTeleports()"></div>' +
        '<div class="mineTimer" id="mineTimer"></div>' +
        gnomeHTML +
        '<div class="cartPlace" id="cartPlace" onclick="mining()">' + cartsHTML + '</div>';

    if (GameState.minerLevel > 0) startMiner();
}

// ---- таймер ----

function startMineTimer(seconds) {
    clearInterval(miningTimerInterval);
    var el = document.getElementById("mineTimer");
    if (!el) return;
    function fmt(s) { return "00:" + (s < 10 ? "0" : "") + s; }
    var remaining = seconds;
    el.textContent = fmt(remaining);
    el.classList.add("active");
    miningTimerInterval = setInterval(function() {
        remaining--;
        var timerEl = document.getElementById("mineTimer");
        if (!timerEl) { clearInterval(miningTimerInterval); return; }
        if (remaining <= 0) {
            clearInterval(miningTimerInterval);
            timerEl.classList.remove("active");
            timerEl.textContent = "";
        } else {
            timerEl.textContent = fmt(remaining);
        }
    }, 1000);
}

// ---- ручная добыча ----

function mining() {
    if (miningActive) return;
    if (!GameState.spendEnergy(CONFIG.ENERGY_COST_MINING)) return;
    miningActive = true;
    var travelMs = getTravelMs();
    var totalMs  = travelMs * 2 + 2000;
    startMineTimer(Math.ceil(totalMs / 1000));
    cartAnimate(["cart1","cart2","cart3"], travelMs, true);
    setTimeout(function() {
        setTimeout(function() {
            cartAnimate(["cart1","cart2","cart3"], travelMs, false);
        }, 2000);
    }, travelMs);
    setTimeout(function() {
        cartReset(["cart1","cart2","cart3"]);
        Inventory.addItem("ore", mineOreCount());
        miningActive = false;
        enableClick();
    }, totalMs);
}

// ---- анимация тележек ----

function cartAnimate(ids, travelMs, toLeft) {
    var sec = (travelMs / 1000) + "s";
    ids.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (toLeft) {
            el.style.animation = "cartToLeft " + sec + " linear forwards";
            el.style.backgroundImage = "url(./img/mineItems/cartG.gif)";
        } else {
            el.style.animation = "cartToRight " + sec + " linear";
            el.style.backgroundImage = "url(./img/mineItems/cartFullG.gif)";
        }
    });
    if (toLeft) disableClick();
}

function cartReset(ids) {
    ids.forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.animation = "none";
        el.style.backgroundImage = "url(./img/mineItems/cart.png)";
    });
}

// ---- гном-майнер ----

var minerCountdown = CONFIG.MINE_MINER_CD_SEC;

function startMiner() {
    if (minerInterval) return;
    minerCountdown = CONFIG.MINE_MINER_CD_SEC;
    minerInterval = setInterval(function() {
        minerCountdown--;
        var el = document.getElementById("gnomeTimer");
        if (el) el.textContent = minerCountdown;
        if (minerCountdown <= 0) {
            minerCountdown = CONFIG.MINE_MINER_CD_SEC;
            if (el) el.textContent = minerCountdown;
            var ore = CONFIG.MINE_MINER_LEVELS[GameState.minerLevel - 1].ore;
            Inventory.addItem("ore", ore);
            showNotification("⛏️ Гном добыл " + ore + " руды!");
        }
    }, 1000);
}

function stopMiner() {
    clearInterval(minerInterval);
    minerInterval = null;
    minerCountdown = CONFIG.MINE_MINER_CD_SEC;
}

// ================================================================ FARM

function innerFarm() {
    pg.style.backgroundImage = "url(./img/Farm.jpg)";
    var activeSlots = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel].slots;
    var seedsHTML = "";
    for (var i = 0; i < 8; i++) {
        if (i < activeSlots) {
            seedsHTML += '<div class="seed"></div>';
        } else {
            seedsHTML += '<div class="seed seed-locked"></div>';
        }
    }
    var farmGnomeHTML = GameState.farmGnomeLevel > 0
        ? '<div class="farmGnomePlace"></div>'
        : '';
    pg.innerHTML =
        '<div class="windmill"></div>' +
        '<div class="skyFarm"></div>' +
        '<div class="seedbeds" id="seedbeds">' + seedsHTML + '</div>' +
        farmGnomeHTML +
        '<div class="stickman" id="farmScarecrow" style="display:' + (GameState.farmScarecrow ? 'block' : 'none') + '"></div>' +
        '<div class="pointerFarm" onclick="showTeleports()"></div>';

    FarmSystem.renderAll();

    document.querySelectorAll(".seed").forEach(function(el, i) {
        if (el.classList.contains("seed-locked")) return;
        el.addEventListener("click", function() {
            var crop = FarmSystem.crops[i];
            if (!crop) {
                showSeedPicker(i);
            } else if (crop.stage >= 3) {
                FarmSystem.harvest(i);
            } else {
                var daysLeft = getGrowDays(crop.type) - (GameState.day - crop.dayPlanted);
                showNotification("Растёт... ещё ~" + daysLeft + " дн.");
            }
        });
    });
}

function showSeedPicker(seedIndex) {
    var wd = GameState.farmScarecrow ? ' (−1 день)' : '';
    modal.innerHTML =
        '<div class="modalContent">' +
            '<div class="modalButtons" onclick="plantCrop(' + seedIndex + ', \'wheat\')">🌾 Пшеница<br><small>' + getGrowDays('wheat') + ' дня' + wd + '</small></div>' +
            '<div class="modalButtons" onclick="plantCrop(' + seedIndex + ', \'cucumber\')">🥒 Огурец<br><small>' + getGrowDays('cucumber') + ' дня' + wd + '</small></div>' +
            '<div class="modalButtons" onclick="plantCrop(' + seedIndex + ', \'tomato\')">🍅 Помидор<br><small>' + getGrowDays('tomato') + ' дня' + wd + '</small></div>' +
        '</div>';
    modal.style.display = "block";
}

function plantCrop(index, type) {
    if (!GameState.spendEnergy(CONFIG.ENERGY_COST_PLANT)) return;
    FarmSystem.plant(index, type);
    modal.style.display = "none";
    showNotification("Посажено: " + ITEMS[type].name);
}

// ================================================================ FISHING

var fishingActive = false;
var fishingMarkerPos = 0;
var fishingMarkerDir = 1;
var fishingInterval = null;
var fishingZoneStart = 30;
var fishingAutoFail = null;

function innerFishing() {
    pg.style.backgroundImage = "url(./img/fishing.jpg)";
    pg.innerHTML =
        '<div class="pointerFishing" onclick="showTeleports()"></div>' +
        '<div class="fishingArea">' +
            '<div class="fishingBtn" id="fishingBtn" onclick="startFishing()">Забросить удочку</div>' +
            '<div class="fishingProgress" id="fishingProgress">' +
                '<div class="fishingBar">' +
                    '<div class="fishingZone" id="fishingZone"></div>' +
                    '<div class="fishingMarker" id="fishingMarker"></div>' +
                '</div>' +
                '<div class="fishingCatch" id="fishingCatch" onclick="catchFish()">ПОЙМАТЬ!</div>' +
            '</div>' +
        '</div>';
}

function startFishing() {
    if (fishingActive) return;
    if (!GameState.spendEnergy(CONFIG.ENERGY_COST_FISHING)) return;
    fishingActive = true;

    document.getElementById("fishingBtn").style.display = "none";
    document.getElementById("fishingProgress").style.display = "block";

    fishingZoneStart = CONFIG.FISHING_ZONE_MIN + Math.random() * (CONFIG.FISHING_ZONE_MAX_START - CONFIG.FISHING_ZONE_MIN);
    document.getElementById("fishingZone").style.left = fishingZoneStart + "%";

    fishingMarkerPos = 0;
    fishingMarkerDir = 1;

    fishingInterval = setInterval(function() {
        fishingMarkerPos += fishingMarkerDir * CONFIG.FISHING_MARKER_SPEED;
        if (fishingMarkerPos >= 88) fishingMarkerDir = -1;
        if (fishingMarkerPos <= 0)  fishingMarkerDir = 1;
        var marker = document.getElementById("fishingMarker");
        if (marker) marker.style.left = fishingMarkerPos + "%";
    }, 30);

    fishingAutoFail = setTimeout(function() {
        if (!fishingActive) return;
        stopFishing();
        showNotification("Рыба сорвалась...");
    }, CONFIG.FISHING_AUTOFAIL_MS);
}

function catchFish() {
    if (!fishingActive) return;
    clearTimeout(fishingAutoFail);
    var inZone = fishingMarkerPos >= fishingZoneStart && fishingMarkerPos <= (fishingZoneStart + CONFIG.FISHING_ZONE_WIDTH);
    stopFishing();
    if (inZone) {
        Inventory.addItem("fish", 1);
    } else {
        showNotification("Промазал! Попробуй ещё раз.");
    }
}

function stopFishing() {
    fishingActive = false;
    clearInterval(fishingInterval);
    var btn = document.getElementById("fishingBtn");
    var progress = document.getElementById("fishingProgress");
    if (btn) btn.style.display = "block";
    if (progress) progress.style.display = "none";
}

// ================================================================ MARKET

function innerMarket() {
    pg.style.backgroundImage = "url(./img/market.jpg)";
    pg.innerHTML =
        '<div class="pointerMarket" onclick="showTeleports()"></div>' +
        '<div class="marketStall" onclick="showMarketModal()">Продать товары</div>';
}

function showMarketModal() {
    var sellable = Inventory.slots
        .filter(function(s) { return s && ITEMS[s.id] && ITEMS[s.id].value > 0; })
        .map(function(s) {
            var total = ITEMS[s.id].value * s.count;
            return '<div class="modalButtons" onclick="sellItem(\'' + s.id + '\')">' +
                       ITEMS[s.id].name + ' x' + s.count + '<br>' +
                       '<small>' + total + 'g</small>' +
                   '</div>';
        }).join("");

    modal.innerHTML =
        '<div class="modalContent" style="flex-wrap:wrap; width:auto; padding:10px; gap:5px;">' +
            (sellable || '<div style="padding:20px; font-size:18px;">Нечего продавать</div>') +
            '<div style="padding:10px; width:100%; font-size:20px; border-top:2px solid black; margin-top:5px;">Золото: ' + GameState.gold + 'g</div>' +
        '</div>';
    modal.style.display = "block";
}

function sellItem(id) {
    var count = Inventory.getCount(id);
    if (count <= 0) return;
    if (!Inventory.removeItem(id, count)) return;
    var earned = ITEMS[id].value * count;
    GameState.gold += earned;
    GameState.render();
    showNotification("+" + earned + "g!");
    showMarketModal();
}

// ================================================================ RECIPES

const RECIPES = {
    bread: { needs: { wheat: 3 },                   heals: 30, name: "Хлеб",   result: "bread" },
    soup:  { needs: { tomato: 2 },                  heals: 40, name: "Суп",    result: "soup"  },
    fries: { needs: { tomato: 1, wheat: 1 },        heals: 25, name: "Жаркое", result: "fries" },
};

function showRecipes() {
    var buttons = Object.keys(RECIPES).map(function(id) {
        var r = RECIPES[id];
        var needs = Object.keys(r.needs).map(function(item) {
            return ITEMS[item].name + " x" + r.needs[item];
        }).join(", ");
        var canCraft = Object.keys(r.needs).every(function(item) {
            return Inventory.getCount(item) >= r.needs[item];
        });
        var cls = canCraft ? "modalButtons" : "modalButtons disabled";
        var click = canCraft ? "onclick=\"craftRecipe('" + id + "')\"" : "";
        return '<div class="' + cls + '" ' + click + '>' +
                   r.name + '<br><small>' + needs + '</small>' +
               '</div>';
    }).join("");

    modal.innerHTML = '<div class="modalContent" style="flex-wrap:wrap;">' + buttons + '</div>';
    modal.style.display = "block";
}

function craftRecipe(id) {
    var recipe = RECIPES[id];
    for (var item in recipe.needs) {
        Inventory.removeItem(item, recipe.needs[item]);
    }
    Inventory.addItem(recipe.result, 1);
    modal.style.display = "none";
    showNotification("Готово: " + recipe.name + "! (клик по слоту чтобы съесть)");
}

// ================================================================ UPGRADES

function upgradeBtn(label, sub, onclick, canAfford, isMax) {
    if (isMax) return '<div class="modalButtons disabled">' + label + '<br><small>Макс.</small></div>';
    var cls   = canAfford ? "modalButtons" : "modalButtons disabled";
    var click = canAfford ? 'onclick="' + onclick + '"' : '';
    return '<div class="' + cls + '" ' + click + '>' + label + '<br><small>' + sub + '</small></div>';
}

function showUpgrades() {
    // upgradeCost хранится на ТЕКУЩЕМ уровне — стоимость перехода на следующий
    var curCart  = CONFIG.MINE_LEVELS[GameState.mineLevel];
    var curSpeed = CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel];
    var nextCartData  = CONFIG.MINE_LEVELS[GameState.mineLevel + 1];
    var nextSpeedData = CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel + 1];

    var maxCart  = !curCart.upgradeCost;
    var maxSpeed = !curSpeed.upgradeCost;

    var btnCart = upgradeBtn(
        '🚃 Вагонетки',
        !maxCart ? (nextCartData ? nextCartData.carts + ' шт' : '') + ' · ' + curCart.upgradeCost + 'g' : '',
        "buyUpgrade('cart')",
        !maxCart && GameState.gold >= curCart.upgradeCost,
        maxCart
    );

    var btnSpeed = upgradeBtn(
        '⚡ Скорость',
        !maxSpeed ? (nextSpeedData ? (nextSpeedData.travelMs / 1000) + 'с' : '') + ' · ' + curSpeed.upgradeCost + 'g' : '',
        "buyUpgrade('speed')",
        !maxSpeed && GameState.gold >= curSpeed.upgradeCost,
        maxSpeed
    );

    var curMiner  = CONFIG.MINE_MINER_LEVELS[Math.max(GameState.minerLevel - 1, 0)];
    var nextMiner = CONFIG.MINE_MINER_LEVELS[GameState.minerLevel];
    var maxMiner  = GameState.minerLevel > 0 && !curMiner.upgradeCost;
    var minerLabel = GameState.minerLevel === 0 ? '⛏️ Гном' : '⛏️ Гном ур.' + (GameState.minerLevel + 1);
    var minerSub;
    if (GameState.minerLevel === 0) {
        var firstCost = CONFIG.MINE_MINER_LEVELS[0].upgradeCost;
        minerSub = nextMiner ? nextMiner.ore + ' руды/10с · ' + firstCost + 'g' : '';
    } else {
        minerSub = nextMiner ? nextMiner.ore + ' руды/10с · ' + curMiner.upgradeCost + 'g' : '';
    }
    var minerAfford = GameState.minerLevel === 0
        ? GameState.gold >= CONFIG.MINE_MINER_LEVELS[0].upgradeCost
        : !maxMiner && GameState.gold >= curMiner.upgradeCost;
    var btnMiner = upgradeBtn(minerLabel, minerSub, "buyUpgrade('miner')", minerAfford, maxMiner);

    // ---- ферма ----
    var curPlot  = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel];
    var nextPlot = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel + 1];
    var maxPlot  = !curPlot.upgradeCost;
    var btnPlot  = upgradeBtn(
        '🌱 Грядки',
        !maxPlot ? (nextPlot ? nextPlot.slots + ' шт' : '') + ' · ' + curPlot.upgradeCost + 'g' : '',
        "buyFarmUpgrade('plot')",
        !maxPlot && GameState.gold >= curPlot.upgradeCost,
        maxPlot
    );

    var btnScare = GameState.farmScarecrow
        ? '<div class="modalButtons disabled">🪄 Пугало<br><small>Работает</small></div>'
        : upgradeBtn('🪄 Пугало', '−1 день роста · ' + CONFIG.FARM_SCARECROW_COST + 'g', "buyFarmUpgrade('scarecrow')", GameState.gold >= CONFIG.FARM_SCARECROW_COST, false);

    var curGnome  = GameState.farmGnomeLevel === 0 ? CONFIG.FARM_GNOME_LEVELS[0] : CONFIG.FARM_GNOME_LEVELS[GameState.farmGnomeLevel - 1];
    var nextGnome = CONFIG.FARM_GNOME_LEVELS[GameState.farmGnomeLevel];
    var maxGnome  = GameState.farmGnomeLevel > 0 && !curGnome.upgradeCost;
    var gnomeLabel = GameState.farmGnomeLevel === 0 ? '🧑‍🌾 Фермер' : '🧑‍🌾 Фермер ур.' + (GameState.farmGnomeLevel + 1);
    var gnomeSub   = GameState.farmGnomeLevel === 0
        ? (nextGnome ? nextGnome.crops + ' раст/день · ' + curGnome.upgradeCost + 'g' : '')
        : (!maxGnome && nextGnome ? nextGnome.crops + ' раст/день · ' + curGnome.upgradeCost + 'g' : '');
    var gnomeAfford = GameState.farmGnomeLevel === 0
        ? GameState.gold >= CONFIG.FARM_GNOME_LEVELS[0].upgradeCost
        : !maxGnome && GameState.gold >= curGnome.upgradeCost;
    var btnGnome = upgradeBtn(gnomeLabel, gnomeSub, "buyFarmUpgrade('gnome')", gnomeAfford, maxGnome);

    modal.innerHTML =
        '<div class="modalContent">' +
            '<div class="upgrades-title">🔨 Улучшения шахты</div>' +
            btnCart + btnSpeed + btnMiner +
            '<div class="upgrades-title">🌾 Улучшения фермы</div>' +
            btnPlot + btnScare + btnGnome +
        '</div>';
    modal.style.display = "block";
}

function buyUpgrade(type) {
    if (type === "cart") {
        var cur = CONFIG.MINE_LEVELS[GameState.mineLevel];
        if (!cur || !cur.upgradeCost || GameState.gold < cur.upgradeCost) return;
        GameState.gold -= cur.upgradeCost;
        GameState.mineLevel++;
        showNotification("🚃 Вагонеток: " + CONFIG.MINE_LEVELS[GameState.mineLevel].carts + " шт");
    } else if (type === "speed") {
        var curS = CONFIG.MINE_SPEED_LEVELS[GameState.mineSpeedLevel];
        if (!curS || !curS.upgradeCost || GameState.gold < curS.upgradeCost) return;
        GameState.gold -= curS.upgradeCost;
        GameState.mineSpeedLevel++;
        showNotification("⚡ Скорость ур. " + (GameState.mineSpeedLevel + 1));
    } else if (type === "miner") {
        var curM = GameState.minerLevel === 0
            ? CONFIG.MINE_MINER_LEVELS[0]
            : CONFIG.MINE_MINER_LEVELS[GameState.minerLevel - 1];
        if (!curM || !curM.upgradeCost || GameState.gold < curM.upgradeCost) return;
        GameState.gold -= curM.upgradeCost;
        GameState.minerLevel++;
        var newOre = CONFIG.MINE_MINER_LEVELS[GameState.minerLevel - 1].ore;
        if (GameState.minerLevel === 1) {
            showNotification("⛏️ Гном нанят! Добывает " + newOre + " руды/10с");
        } else {
            showNotification("⛏️ Гном ур." + GameState.minerLevel + " — " + newOre + " руды/10с");
        }
        stopMiner();
        startMiner();
    }
    GameState.render();
    saveGame();
    showUpgrades();
}

// ================================================================ FARM UPGRADES

function buyFarmUpgrade(type) {
    if (type === "plot") {
        var cur = CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel];
        if (!cur || !cur.upgradeCost || GameState.gold < cur.upgradeCost) return;
        GameState.gold -= cur.upgradeCost;
        GameState.farmPlotLevel++;
        showNotification("🌱 Грядок: " + CONFIG.FARM_PLOT_LEVELS[GameState.farmPlotLevel].slots + " шт");
        innerFarm();
    } else if (type === "scarecrow") {
        if (GameState.farmScarecrow || GameState.gold < CONFIG.FARM_SCARECROW_COST) return;
        GameState.gold -= CONFIG.FARM_SCARECROW_COST;
        GameState.farmScarecrow = true;
        showNotification("🪄 Пугало поставлено! Растения растут быстрее");
        var sc = document.getElementById("farmScarecrow");
        if (sc) sc.style.display = "block";
    } else if (type === "gnome") {
        var curG = GameState.farmGnomeLevel === 0
            ? CONFIG.FARM_GNOME_LEVELS[0]
            : CONFIG.FARM_GNOME_LEVELS[GameState.farmGnomeLevel - 1];
        if (!curG || !curG.upgradeCost || GameState.gold < curG.upgradeCost) return;
        GameState.gold -= curG.upgradeCost;
        GameState.farmGnomeLevel++;
        var cnt = CONFIG.FARM_GNOME_LEVELS[GameState.farmGnomeLevel - 1].crops;
        if (GameState.farmGnomeLevel === 1) {
            showNotification("🧑‍🌾 Фермер нанят! Приносит " + cnt + " раст/день");
        } else {
            showNotification("🧑‍🌾 Фермер ур." + GameState.farmGnomeLevel + " — " + cnt + " раст/день");
        }
        innerFarm();
    }
    GameState.render();
    saveGame();
    showUpgrades();
}

// ================================================================ TELEPORT MODAL

function showTeleports() {
    modal.innerHTML =
        '<div class="modalContent">' +
            '<div class="modalButtons" onclick="tpHome()">Дом</div>' +
            '<div class="modalButtons" onclick="tpMine()">Шахта</div>' +
            '<div class="modalButtons" onclick="tpFarm()">Ферма</div>' +
            '<div class="modalButtons" onclick="tpFishing()">Рыбалка</div>' +
            '<div class="modalButtons" onclick="tpMarket()">Рынок</div>' +
        '</div>';
    modal.style.display = "block";
}

// ================================================================ MODAL CLOSE

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// ================================================================ INIT

loadGame();
GameState.render();
Inventory.render();
if (GameState.minerLevel > 0) startMiner();
innerHome();
