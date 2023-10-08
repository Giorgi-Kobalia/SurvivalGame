// -----------------------------------------------------------------------------------------------------------------------------TELEPORTATIONS------------------------------------



const pg = document.getElementById("playground");

let cl = document.getElementById("cl");

let cr = document.getElementById("cr");

cl.style.animation = "none"

cr.style.animation = "none"

let nav = document.getElementById("navigation")

function enableClick() {

    nav.style.pointerEvents = "all";

}

function disableClick() {

    nav.style.pointerEvents = "none";

}

function addAnimation() {

    cl.style.animation = "go_right 4s linear "
    cr.style.animation = "go_left 4s linear "

}

function removeAnimation() {

    cl.style.animation = "none"
    cr.style.animation = "none"

}





// -------------------------------------------------------------------------------------------------------------------------TELEPORT FUNCTIONS ---------------------


function tpHome() {


    addAnimation();

    setTimeout(innerHome, 2000)

    setTimeout(removeAnimation, 4500)

    disableClick();

    setTimeout(enableClick, 4500)

    modal.style.display = "none";

}

function tpMine() {

    disableClick();

    addAnimation();

    setTimeout(innerMine, 2000)

    setTimeout(removeAnimation, 4500)

    setTimeout(enableClick, 4500)

    modal.style.display = "none";

}

function tpFarm() {

    disableClick();

    addAnimation();

    setTimeout(innerFarm, 2000)

    setTimeout(removeAnimation, 4500)

    setTimeout(enableClick, 4500)

    modal.style.display = "none";

}

function tpFishing() {

    disableClick();

    addAnimation();

    setTimeout(innerFishing, 2000)

    setTimeout(removeAnimation, 4500)

    setTimeout(enableClick, 4500)

    modal.style.display = "none";

}

function tpMarket() {

    disableClick();

    addAnimation();

    setTimeout(innerMarket, 2000)

    setTimeout(removeAnimation, 4500)

    setTimeout(enableClick, 4500)

    modal.style.display = "none";

}


// -------------------------------------------------------------------------------------------------------------------------STATUS CONFIGURATIONS ---------------------





//----------------------------------------HUNGER


let currentCalories = 100;
let hungerBar = document.getElementById("hunger-bar");
let hungeryTitle = document.getElementById("hunger-status");
hungerBar.style.width = currentCalories + "%";




//----------------------------------------ENERGY

let currentEnergy = 100;
let energyBar = document.getElementById("energy-bar");
let energyTitle = document.getElementById("energy-status");
energyBar.style.width = currentEnergy + "%";


//----------------------------------------RECOVERY

function recovery() {

    hungerBar.style.width = currentCalories + "%";
    energyBar.style.width = currentEnergy + "%";

}




// ------------------------------------------------------------------------------------------------------------------------------------ HOME LOCATION ---------------------


function innerHome() {

    pg.style.backgroundImage = "url(./img/home.jpg)";

    pg.innerHTML =
        `            
        <div class="trees"></div>
        <div class="blueprint" onclick="showUpgrades()"></div>
        <div class="pointerHome" onclick="showTeleports ()"></div>
        <div class="fire"></div>
        <div class="boiler" onclick="showRecepts()"></div>
        <div class="skyHome"></div>
        <div class="birdsHome"></div>
       <div class="bed" onclick="goToSleep ()"></div>

       `;

}

// -------------------------------------SLEEPING  CONFIG-------------------   


let days = document.getElementById("days");

let daysCount = 1;


function sleeping() {

    currentEnergy = 100

    recovery();

    daysCount += 1;

    days.innerHTML = daysCount;
}


function goToSleep() {

    disableClick();

    addAnimation();

    setTimeout(sleeping, 2000)

    setTimeout(removeAnimation, 4500)

    setTimeout(enableClick, 4500)

}




// ------------------------------------------------------------------------------------------------------------------------------------ MINE LOCATION ---------------------



function innerMine() {

    pg.innerHTML =
        `
    
    <div class="skyMine"></div>
    <div class="mineBack"></div>
    <div class="mineFront"></div>
    <div class="pointerMine" onclick="showTeleports ()"></div>
    <div class="cartPlace" onclick="mining()">
        <div class="carts" id="cart1" ></div>
        <div class="carts" id="cart2" ></div>
        <div class="carts" id="cart3" ></div>
    </div>

    `;
    pg.style.backgroundImage = "url(./img/mine.jpg)";


}





// ------------------------------------------------------------------------------------------------------------------------------------ FARM LOCATION ---------------------




function innerFarm() {

    pg.innerHTML =

        `            
    <div class="windmill"></div>
    <div class="skyFarm"></div>    
    
    <div class="seedbeds">
    <div class="seed" onclick="working ()" ></div>
    <div class="seed" onclick="working ()" ></div>
    <div class="seed" onclick="working ()" ></div>
    <div class="seed" onclick="working ()" ></div>
    <div class="seed" onclick="working ()" ></div>
    <div class="seed" onclick="working ()" ></div>
    <div class="seed" onclick="working ()" ></div>
    <div class="seed" onclick="working ()" ></div>
    </div>
    
    <div class="stickman"></div>
    <div class="pointerFarm" onclick="showTeleports ()"></div>    
    
    `;

    pg.style.backgroundImage = "url(./img/farm.jpg)";

    let seed = document.querySelectorAll(".seed");

    seed.forEach(el => {

        el.addEventListener("click", async function () {
            if (el.getAttribute("data-seed") === "cucumber" || el.getAttribute("data-seed") === "tomato" || el.getAttribute("data-seed") === "wheat") {
                return
            }
            // showSeeds()

            const data = await getPromise();

            el.style.backgroundImage = `url('./img/farmItems/${data}1.png')`

            el.setAttribute("data-seed", data);
        })
    })
}





// ------------------------------------------------------------------------------------------------------------------------------------ SEA LOCATION ---------------------





function innerFishing() {
    pg.innerHTML = `
    
    <div class="fishing" onclick="working ()"></div>
    <div class="pointerHome" onclick="showTeleports ()"></div>
    `;
    pg.style.backgroundImage = "url(./img/fishing.jpg)";
}






// ------------------------------------------------------------------------------------------------------------------------------------ SELLER LOCATION ---------------------



function innerMarket() {
    pg.innerHTML = `
    
    <div class="market"></div>
    <div class="pointerHome" onclick="showTeleports ()"></div>    
    `;
    pg.style.backgroundImage = "url(./img/market.jpg)";
}







// ---------------------------------------------------------------------------------------------------------------------------------MODAL CONFIGURATIONS---------------------



var modal = document.getElementById("modal");


window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


function showTeleports() {

    modal.innerHTML =

        `
    <div class="modalContent" >

        <div class="modalButtons" id="home" onclick="tpHome()">Home</div>
        <div class="modalButtons" id="mining" onclick="tpMine()">Mine</div>
        <div class="modalButtons" id="farming" onclick="tpFarm()">Farm</div>
        <div class="modalButtons" id="fishing" onclick="tpFishing()">Fish</div>
        <div class="modalButtons" id="market" onclick="tpMarket()">Market</div>

    </div>

    `

    modal.style.display = "block"
}

function showRecepts() {

    modal.innerHTML =

        `
    <div class="modalContent" >

        <div class="modalButtons" >BREAD</div>
        <div class="modalButtons" >FRIES</div>
        <div class="modalButtons" >FISH</div>
        <div class="modalButtons" >FISH VG</div>
        <div class="modalButtons" >SOUP</div>

    </div>

    `

    modal.style.display = "block"

}

function showUpgrades() {

    modal.innerHTML =

        `
    <div class="modalContent" >

        <div class="modalButtons" >UpHome</div>
        <div class="modalButtons" >UpMine</div>
        <div class="modalButtons" >UpFarm</div>
        <div class="modalButtons" >UpFish</div>
        <div class="modalButtons" >UpMarket</div>

    </div>

    `

    modal.style.display = "block"

}


function showSeeds() {

    modal.innerHTML =

        `
    <div class="modalContent" >

        <div class="modalButtons" >Wheat</div>
        <div class="modalButtons" >Cucum</div>
        <div class="modalButtons" >Tomato</div>
        <div class="modalButtons" ></div>
        <div class="modalButtons" ></div>

    </div>

    `

    modal.style.display = "block"

}


// -------------------------------------------------------------------------------------------------------------------------  WORKING CONFIGURATIONS---------------------


function working() {

    if (currentCalories > 0 && currentEnergy > 0) {
        currentCalories -= 2;
        currentEnergy -= 1;
        recovery();
    } else {
        alert("You are Dead")
    }

}


function mining() {

    working()

    cartToLeft()

    setTimeout(cartToRight, 10000)

}




// -------------------------------------------------------------------------------------------------------------------------  ANIMATIONS OF CART ---------------------

function cartToLeft() {

    document.getElementById("cart1").style.animation = "cartToLeft 5s linear";
    document.getElementById("cart2").style.animation = "cartToLeft 5s linear";
    document.getElementById("cart3").style.animation = "cartToLeft 5s linear";

    document.getElementById("cart1").style.backgroundImage = "none";
    document.getElementById("cart2").style.backgroundImage = "none";
    document.getElementById("cart3").style.backgroundImage = "none";

    disableClick();
}

function cartToRight() {

    document.getElementById("cart1").style.animation = "cartToRight 5s linear";
    document.getElementById("cart2").style.animation = "cartToRight 5s linear";
    document.getElementById("cart3").style.animation = "cartToRight 5s linear";

    document.getElementById("cart1").style.backgroundImage = "url(./img/mineItems/cart.png)";
    document.getElementById("cart2").style.backgroundImage = "url(./img/mineItems/cart.png)";
    document.getElementById("cart3").style.backgroundImage = "url(./img/mineItems/cart.png)";

    setTimeout(enableClick, 5000)
}





// -------------------------------------------------------------------------------------------------------------------------  HARVESTING FUNCTIONS ---------------------



const events = new Event('build');

// Listen for the event.
window.addEventListener('build', (e) => { console.log("Build Event occurs") }, false);

// Dispatch the event.



async function getPromise() {
    return new Promise((resolve, reject) => {

        const modalContent = document.createElement("div");
        modalContent.classList.add("modalContent");


        const modalButtonWheat = document.createElement("div");
        modalButtonWheat.classList.add("modalButtons");
        modalButtonWheat.setAttribute("data-type", "wheat");
        modalButtonWheat.innerHTML = "Wheat";

        const modalButtonCucumber = document.createElement("div");
        modalButtonCucumber.classList.add("modalButtons");
        modalButtonCucumber.setAttribute("data-type", "cucumber");
        modalButtonCucumber.innerHTML = "Cucumber";

        const modalButtonTomato = document.createElement("div");
        modalButtonTomato.classList.add("modalButtons");
        modalButtonTomato.setAttribute("data-type", "tomato");
        modalButtonTomato.innerHTML = "Tomato";

        // const modalButtonWheat = document.createElement("div");
        // modalButtonWheat.classList.add("modalButtons");
        // modalButtonWheat.setAttribute("data-type","wheat");

        // const modalButtonWheat = document.createElement("div");
        // modalButtonWheat.classList.add("modalButtons");
        // modalButtonWheat.setAttribute("data-type","wheat");

        const buttonsArray = [modalButtonWheat, modalButtonCucumber, modalButtonTomato]

        modalContent.append(...buttonsArray)

        modal.appendChild(modalContent);


        buttonsArray.forEach(function (button) {
            button.addEventListener("click", function () {

                window.dispatchEvent(events);

                const returnText = this.getAttribute("data-type");
                modal.style.display = "none";
                resolve(returnText)
            })
        })

        modal.style.display = "block"

    })
}