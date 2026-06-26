# Survival Game

A browser-based survival/management game built with vanilla JavaScript (ES modules), HTML and CSS. The player manages energy and hunger, gathers resources across several locations, crafts food, upgrades production, and sells goods for gold.

This is a work-in-progress project. Feedback and questions are welcome.

## Core systems

- **Energy & Hunger** — most actions (mining, fishing, planting) cost energy and hunger. Stats are shown as bars in the HUD and regenerate after sleeping.
- **Day cycle** — sleeping at home advances the day, fully restores energy, and triggers farm growth/auto-harvest.
- **Inventory** — collected resources (ore, crops, fish) and crafted food are stored in inventory slots; clicking a food item eats it to restore hunger.
- **Crafting** — recipes (e.g. Bread, Soup, Fries) combine raw crops into food with healing value.
- **Gold & Market** — items can be sold for gold, which is spent on upgrades.
- **Upgrades** — a blueprint menu at Home lets the player improve the Mine (more carts, faster travel, an auto-mining gnome) and the Farm (more plots, a scarecrow, an auto-harvesting gnome farmer).
- **Teleportation** — a pointer/portal icon on every screen opens a teleport menu to travel between locations, with a short travel animation between screens.

## Locations

### 🏠 Home
The player's base. From here you can:
- **Sleep** (bed) — advances to the next day and restores energy.
- **Cook** (boiler/furnace) — open the recipes menu to craft food from raw ingredients.
- **Open upgrades** (blueprint) — buy improvements for the Mine and Farm.
- **Teleport** (pointer) — open the travel menu to move to other locations.
The scene also has decorative/ambient elements (trees, birds, fire).

### ⛏️ Mine
A mining shaft with one or more ore carts.
- Clicking the cart area sends the carts into the mine (costs energy); they animate down the track, pause, then return full of ore, which is added to the inventory.
- While a cart run is active, further clicks are blocked and a countdown timer shows the remaining time.
- An optional hired gnome automatically mines a fixed amount of ore on a recurring timer, independent of the player's actions.
- Upgrades increase the number of carts, reduce travel time, and improve the gnome's output.

### 🌾 Farm
A set of plantable plots.
- Each unlocked plot can be seeded with a crop (wheat, cucumber or tomato) from a picker menu; planting costs energy.
- Crops grow over a number of in-game days; clicking a growing plot shows the days remaining, and a fully grown plot can be harvested.
- A scarecrow upgrade reduces growth time by one day; a hired farmer gnome automatically adds free crops to the inventory each time the player sleeps.
- Upgrades unlock more plots and increase the farmer gnome's daily yield.

### 🎣 Fishing dock *(planned redesign)*
The current screen is a placeholder minigame and will be reworked into an automated dock mechanic, similar in spirit to the mine carts:
- The dock will have an **electric fishing net** mounted on a winch.
- Pressing a button lowers the net into the water.
- After a set amount of time the net automatically rises back up, bringing in any fish it caught, without further input from the player.
- The goal is to make fishing a timed/automated loop (like the mine carts) rather than the manual timing minigame it is now.

### 🛒 Market
A trading stall where the player can sell sellable inventory items (crops, ore, fish, etc.) for gold, which is then used at the Home upgrade menu.

## Project structure

- `SurvivalGame/index.html`, `style.css` — markup and styling.
- `SurvivalGame/js/main.js` — entry point, global click-action router, save/load bootstrapping.
- `SurvivalGame/js/state.js`, `inventory.js`, `persistence.js` — game state, inventory, and localStorage save/load.
- `SurvivalGame/js/home.js`, `mine.js`, `farm-screen.js`, `farm-system.js`, `fishing.js`, `market.js` — per-location rendering and logic.
- `SurvivalGame/js/teleport.js` — screen navigation and travel animation.
- `SurvivalGame/js/recipes.js`, `upgrades.js` — crafting and upgrade menus.
- `SurvivalGame/js/config.js` — tunable game constants (costs, item data, recipes, upgrade tiers).
- `SurvivalGame/js/ui.js` — shared DOM helpers (modals, notifications, click locking).
