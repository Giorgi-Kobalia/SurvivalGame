export const CONFIG = {
    ENERGY_COST_MINING:   10,
    ENERGY_COST_FISHING:  5,
    ENERGY_COST_PLANT:    5,
    COOKING_TIME_MS:      10000,
    FISHING_AUTOFAIL_MS:  6000,
    FISHING_MARKER_SPEED: 2.5,
    FISHING_ZONE_WIDTH:   20,
    FISHING_ZONE_MIN:     10,
    FISHING_ZONE_MAX_START: 65,
    INVENTORY_SLOTS:      18,
    FARM_SLOTS:           8,

    TELEPORT_TRAVEL_MS: 2000,
    TELEPORT_TOTAL_MS:  4500,

    MINE_LEVELS: [
        { carts: 1, oreMin: 1, oreMax: 3, upgradeCost: 50  },
        { carts: 2, oreMin: 2, oreMax: 6, upgradeCost: 100 },
        { carts: 3, oreMin: 3, oreMax: 9, upgradeCost: null },
    ],
    MINE_SPEED_LEVELS: [
        { travelMs: 5000, upgradeCost: 75  },
        { travelMs: 3000, upgradeCost: 125 },
        { travelMs: 1500, upgradeCost: null },
    ],
    MINE_MINER_LEVELS: [
        { ore: 2, upgradeCost: 200 },
        { ore: 4, upgradeCost: 350 },
        { ore: 6, upgradeCost: null },
    ],
    MINE_MINER_CD_SEC: 10,

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

export const CROP_EMOJI = { wheat: '🌾', cucumber: '🥒', tomato: '🍅' };

export const ITEMS = {
    wheat:    { name: "Wheat",    icon: "farmItems/wheat3",    emoji: null, value: 5,  heals: 0  },
    cucumber: { name: "Cucumber", icon: "farmItems/cucumber3", emoji: null, value: 8,  heals: 0  },
    tomato:   { name: "Tomato",   icon: "farmItems/tomato3",   emoji: null, value: 10, heals: 0  },
    ore:      { name: "Ore",      icon: "mineItems/cartFull",  emoji: null, value: 15, heals: 0  },
    fish:     { name: "Fish",     icon: null, emoji: "🐟",     value: 12, heals: 20 },
    salad:    { name: "Salad",      icon: null, emoji: "🥗", value: 0,  heals: 15 },
    fries:    { name: "Fried Fish", icon: null, emoji: "🍣", value: 0,  heals: 25 },
    bread:    { name: "Bread",      icon: null, emoji: "🍞", value: 0,  heals: 30 },
    soup:     { name: "Soup",       icon: null, emoji: "🍲", value: 0,  heals: 40 },
};

// Ordered left-to-right by complexity: simplest/least filling first, most elaborate/filling last.
export const RECIPES = {
    salad: { needs: { cucumber: 1, tomato: 1 },          heals: 15, name: "Salad",      result: "salad" },
    fries: { needs: { fish: 1, wheat: 1 },               heals: 25, name: "Fried Fish", result: "fries" },
    bread: { needs: { wheat: 3 },                        heals: 30, name: "Bread",      result: "bread" },
    soup:  { needs: { fish: 3, cucumber: 1, tomato: 1 }, heals: 40, name: "Soup",       result: "soup"  },
};

export const CROP_GROW_DAYS = { wheat: 2, cucumber: 3, tomato: 3 };
