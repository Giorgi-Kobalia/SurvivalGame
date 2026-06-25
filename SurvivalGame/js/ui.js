export const pg    = document.getElementById("playground");
export const cl    = document.getElementById("cl");
export const cr    = document.getElementById("cr");
export const nav   = document.getElementById("navigation");
export const modal = document.getElementById("modal");

cl.style.animation = "none";
cr.style.animation = "none";

export function enableClick()  { nav.style.pointerEvents = "all";  }
export function disableClick() { nav.style.pointerEvents = "none"; }

export function addAnimation() {
    cl.style.animation = "go_right 4s linear";
    cr.style.animation = "go_left 4s linear";
}
export function removeAnimation() {
    cl.style.animation = "none";
    cr.style.animation = "none";
}

export function showModal(html) {
    modal.innerHTML = html;
    modal.style.display = "block";
}

export function hideModal() {
    modal.style.display = "none";
}

export function initModalBackdropClose() {
    window.addEventListener("click", (event) => {
        if (event.target === modal) hideModal();
    });
}

export function showNotification(text) {
    const el = document.getElementById("notification");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove("show"), 2500);
}
