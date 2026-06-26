import { CONFIG, ITEMS } from './config.js';
import { showNotification } from './ui.js';
import { saveGame } from './persistence.js';

export const Inventory = {
    slots: new Array(CONFIG.INVENTORY_SLOTS).fill(null),

    addItem(id, count = 1) {
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
        showNotification("Inventory full!");
        return false;
    },

    removeItem(id, count = 1) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] && this.slots[i].id === id) {
                if (this.slots[i].count < count) return false;
                this.slots[i].count -= count;
                if (this.slots[i].count === 0) {
                    this.slots.splice(i, 1);
                    this.slots.push(null);
                }
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
                if (item.heals) tipParts.push("+" + item.heals + " hunger");
                if (item.value) tipParts.push("Price: " + item.value + "g");
                el.title = tipParts.join("\n");
                if (wasEmpty) {
                    el.classList.add("item-pop");
                    setTimeout(() => el.classList.remove("item-pop"), 350);
                }
            } else {
                el.classList.remove("has-item");
                el.style.backgroundImage = "none";
                el.innerHTML = "";
                el.title = "";
            }
        });
    },
};
