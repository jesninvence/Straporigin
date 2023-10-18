//global variables
const global = {
    accounts : {}
}


//add a transparent to black navbar
function transBar() {
    const navigation = document.querySelector("#header .navbar");
    window.addEventListener("scroll", scrollTrans);
    function scrollTrans() {
        if (scrollY > 0) {
            navigation.style.background = "black";
        } else {
            navigation.style.background = "transparent";
        }
    }
}

function addSwiper() {
    const swiper = new Swiper('#product-swiped', {
        // Optional parameters
        direction: 'horizontal',
        loop : true,
        slidesPerView: 1,
        spaceBetween: 5,
        freeMode: {
            enabled: true,
            sticky: true,
        },
        autoplay : {
            delay : 2000
        }
      });
}



//setup the page
window.addEventListener("DOMContentLoaded", init);

async function init() {
    const loader = document.querySelector("#loader-container");
    loader.classList.remove("hide");
    //path name
    const path = location.pathname;

    //fetch product
    const fetchProducts = await fetch("./products.json");
    let products = await fetchProducts.json();
    global.products = products;
    global.all_products = products[0].concat(products[1]);

    let accounts = JSON.parse(localStorage.getItem("accounts"));
    global.accounts = accounts || {};

    inputCart();
    addMobileNavbar();
    if (path != "./Strap_CheckoutForm.html" ) 
        inputSearch();
    else displayCheckout();

    setTimeout(() => {
        loader.classList.add("hide");
    },500);
    console.log(path)

    /* switch(path) {
        case "/Strap_shop.html":
            
            break;
        case "/index.html":
        case "" :
            
            break;
        case "/Strap_ItemInfo.html":
            const id = location.search.slice(1).split("=")[1];
            displayInfo(id);
            break;
        case "/Strap_User.html" :
            displayUser();
            break;
    } */
    const actions = [];
    actions.push([
        "/Strap_shop.html",
        function() {
            const page = location.search.slice(1).split("=")[1];
            showProducts(page);
        }
    ]);
    actions.push([
        ["/index.html","Strap/"],
        function() {
            transBar();
            addSwiper();
        }
    ]);
    actions.push([
        "/Strap_ItemInfo.html",
        function() {
            const id = location.search.slice(1).split("=")[1];
            displayInfo(id);
        }
    ]);
    actions.push([
        "/Strap_User.html",
        function() {
            displayUser();
        }
    ]);
    for (let i = 0;i < actions.length;i++) {
        let [page,action] = actions[i];
        if ((Array.isArray(page) && page.some(name => (new RegExp(`(${name})$`)).test(path))) ||
            (new RegExp(page)).test(path)) {
                action();
                break;
        }
    }

}

//show the products in Shop 
async function showProducts(page = 1) {
    let products = global.products; 
    products = products[page-1];
    const product_display = document.getElementById("products_display");
    let result = ``;
    products.forEach((product,i) => {
        result += `
            <div class="col-6 col-md-3">
                <div class="card ${product.soldout && "soldout"} bg-white h-100">
                    <a type="button" href="./Strap_ItemInfo.html?id=${i + (page - 1) * 20}" data-bs-target="#sampleModal1"><img src="${product.image}" width="100%"></a>
                    ${product.soldout ? `<span class="tag"> Sold out </span>` : ""} 
                    <div class="card-body">
                        <h5 ${product.soldout ? `id="soldout"` : ""} class="card-title text-black">${product.name}</h5>
                        <p class="card-price"><i class="fa-solid fa-peso-sign"></i> ${formatNumber(product.price)} </p>
                    </div>
                </div>
            </div>
        `
     })
    product_display.innerHTML = result;
}


//display the information in Item Info 
async function displayInfo(id = 0) {
    let products = global.all_products;
    let product = products[id];

    //choose sizes
    const sizes = document.querySelectorAll("#sizes button");
    for (let i = 0; i < sizes.length; i++) {
        const element = sizes[i];
        element.addEventListener("click", activate);
    }
    function activate() {
        const activated = document.querySelector("#sizes button.active");
        activated.classList.remove("active");
        this.classList.add("active");
    }

    //quantity control
    const incrementBtn = document.querySelectorAll(".info-quantity .input-control")[1]
    const decrementBtn = document.querySelectorAll(".info-quantity .input-control")[0]
    incrementBtn.addEventListener("click", () => updateQuantity(1));
    decrementBtn.addEventListener("click", () => updateQuantity(-1));
    function updateQuantity(number) {
        const quantity = document.getElementById("quantity");
        quantity.value = Number(quantity.value) + number;
        if (quantity.value <= 1 && number < 0) {
            decrementBtn.disabled = true;
            return;
        } else {
            decrementBtn.disabled = false;
        }
    }

    //display information
    (function() {
        let main = document.getElementById("main-image");
        main.src = product.image

        let thumbnail_container = document.querySelector(".item-info .other-display");

        product.showcase && product.showcase.forEach(src => {
            const div = document.createElement("div");
            div.className = "col-3";
            const img = document.createElement("img");
            img.className = "img-fluid";
            img.src = src;
            img.addEventListener("click",function() {
                main.src = img.src;
            });
            div.appendChild(img);
            thumbnail_container.appendChild(div);
        });
        
        const product_name = document.querySelector(".item-info .infos h1");
        product_name.innerHTML = product.name;
        product.soldout && product_name.classList.add("soldout-name");

        const product_price = document.querySelector(".item-info .infos .card-price");
        product_price.innerHTML = `<i class="fa-solid fa-peso-sign"></i> ` + formatNumber(product.price);

        const large_image = document.querySelector(".product-details .col-12 img");
        large_image.src = product.large_image || "./img/nothing.jpg";

        const related_container = document.getElementById("related_products");
        let result = ``;
        product.related_products && product.related_products.forEach(product_id => {
            let related_product = products[product_id];
            result += `
            <div class="col-6 col-md-3">
                <div class="card ${related_product.soldout && "soldout"} bg-white h-100">
                    <a type="button" href="./Strap_ItemInfo.html?id=${products.indexOf(related_product)}"><img src="./${related_product.image}" width="100%"></a>
                    ${related_product.soldout ? `<span class="tag"> Sold out </span>` : ""}
                    <div class="card-body">
                        <h5 ${related_product.soldout ? `id="soldout"` : ""} class="card-title text-black">${related_product.name}</h5>
                        <p class="card-price"><i class="fa-solid fa-peso-sign"></i> ${related_product.price}</p>
                    </div>
                </div>
            </div>
            `
        });
        related_container.innerHTML = result;
    })();

    //add to cart functionality
    global.cart.add = function() {
        let quantityElement = document.getElementById("quantity");
        let quantity = Number(quantityElement.value);

        if (quantity < 1) {
            quantityElement.value = 1;
            quantity = 1;
        }

        const size = document.querySelector("#sizes button.active").innerHTML;

        if (global.cart.items[id] && global.cart.items[id][size]) 
            global.cart.items[id][size] += quantity;
        else if (global.cart.items[id]) {
            global.cart.items[id][size] = quantity;
        } else {
            global.cart.items[id] = {}
            global.cart.items[id][size] = quantity; 
        } 
        global.cart.total_price += global.all_products[id].price * quantity;
        global.cart.display();
    }
}

//include the cart
function inputCart() {
    const shadow = document.getElementById("shadow");
    const cartElement = document.getElementById("Cart");

    if (cartElement) {
        global.showCartElement = function() {
            cartElement.style.transform = "translateX(0)"
            shadow.classList.remove("hide");
            document.body.style.overflow = "hidden"
        }
        
        global.hideCartElement = function() {
            cartElement.style.transform = "translateX(100%)"
            shadow.classList.add("hide");
            document.body.style.overflow = "auto"
        }
    }

    //cart object
    const cart = {};

    cart.items = {};
    cart.total_price = 0;

    cart.updateQuantity = function(item,size,number) {
        this.items[item][size] += number; 
        if (this.items[item][size] < 1) {
            this.items[item][size] = 1;
            number = 1;
            this.total_price = global.all_products[item].price * number;
        } else {
            this.total_price += global.all_products[item].price * number;
        }
        this.display();
    }

    cart.removeItem = function(item,size) {
        this.total_price -= this.items[item][size] * global.all_products[item].price;
        delete this.items[item][size];
        if (!Object.keys(this.items[item]).length) delete this.items[item];
        this.display();
    }

    cart.display = function(disable) {
        const container = document.querySelector("#Cart .items");
        let result = ``;    
        if (!cartElement) return;
        
        if (!Object.keys(this.items).length) {
            document.querySelector("#Cart .not-empty").classList.add("hide");
            document.querySelector("#Cart .empty").classList.remove("hide");
        } else {
            document.querySelector("#Cart .not-empty").classList.remove("hide");
            document.querySelector("#Cart .empty").classList.add("hide");
        }

        for (let item_id in this.items) {
            let product = global.all_products[Number(item_id)];
            for (let size in this.items[item_id]) {
                result += `
                <div class="row">
                    <div class="col-4">
                        <img src="./${product.image}" alt="" width="100%">
                    </div>
                    <div class="col-8 position-relative">
                        <p class="tshirt-name">${product.name}</p>
                        <p class="price-1"><i class="fa-solid fa-peso-sign"></i> ${formatNumber(product.price)}</p>
                        <p class="size">Size: ${size}</p>
                        <div class="input-group quantity mb-3">
                            <button ${this.items[item_id][size] == 1 ? 'disabled = "true"' : ""} class="input-control decrement-button" onclick="global.cart.updateQuantity('${item_id}','${size}',-1,this)"> <i class="fa-solid fa-minus"></i> </button>
                            <div class="quantity-container">
                                <input onchange="this.value = parseInt(this.value) || 1; global.cart.updateQuantity('${item_id}','${size}',parseInt(this.value) - global.cart.items['${item_id}']['${size}'])" type="number" class="target-quantity border-0" value="${parseInt(this.items[item_id][size])}">
                            </div> 
                            <button class="input-control" onclick="global.cart.updateQuantity('${item_id}','${size}',1,this.previousElementSibling.previousElementSibling)"> <i class="fa-solid fa-plus"></i> </button>
                        </div>
                        <button class="trash" onclick="global.cart.removeItem('${item_id}','${size}')"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </div>
                `;
            }
        }
        container.innerHTML = result;

        const total_price = document.querySelector("#Cart .checkout .total-price");
        total_price.innerHTML = `<i class="fa-solid fa-peso-sign"></i> ${formatNumber(this.total_price)}`;
        localStorage.setItem("cart-items",JSON.stringify(this.items));
        localStorage.setItem("cart-total-price",JSON.stringify(this.total_price));
    }  

    global.cart = cart;

    const previous_cart = localStorage.getItem("cart-items");
    global.cart.items = previous_cart ? JSON.parse(previous_cart) : global.cart.items;
    
    const previous_total = localStorage.getItem("cart-total-price");
    global.cart.total_price = previous_total ? Number(previous_total) : global.cart.total_price;

    cart.display();

}


function inputSearch() {
    const searchElement = document.querySelector("#search");
    const shadow = document.querySelector("#shadow");
    global.showSearchElement = function() {
        searchElement.classList.remove("hide");
        shadow.classList.remove("hide");
        document.querySelector("#search .search-input input").focus();
        document.body.style.overflow = "hidden";
    }
    global.hideSearchElement = function() {
        searchElement.classList.add("hide");
        shadow.classList.add("hide");
        document.body.style.overflow = "";
    }

    global.search = function(target) {
        const search_output = document.querySelector("#search .search-output");
        if (target == "") {
            search_output.classList.add("hide");
            return;
        } else search_output.classList.remove("hide");

        const results = global.all_products.filter(product => {
            return (new RegExp(target.toLowerCase())).test(product.name.toLowerCase());
        });
        
        if (results.length == 0) {
            search_output.classList.add("hide");
            return;
        } else search_output.classList.remove("hide");

        const output_container = document.querySelector("#search .search-output");
        let outputs = ``;
        results.forEach(result => {
            const id = global.all_products.indexOf(result);
            outputs += `   
            <a href="/Strap_ItemInfo.html?id=${id}">
                <div class="row">
                    <div class="col-3">
                        <img src="./${result.image}" width="100%" alt="">
                    </div>
                    <div class="col-9   ">
                        <div ${result.soldout ? 'class="soldout-name"' : ""}>${result.name}</div>
                    </div>
                </div>
            </a> 
            `;
        })
        output_container.innerHTML = outputs;
    }
}

function displayCartCheckout() {
    const container = document.querySelector("#orders");
    let results = ``;
    
    let items = global.cart.items;
    for (let item_id in items) {
        let product = global.all_products[Number(item_id)];
        for (let size in items[item_id]) {
            results += `
            <div class="row">
                <div class="col-4 image-container">
                    <img src="./${product.image}" alt="" width="100%">
                    <div class="quantity">${items[item_id][size]}</div>
                </div>
                <div class="col-8 position-relative item-description">
                    <p class="tshirt-name">${product.name}</p>
                    <p class="price-1"><i class="fa-solid fa-peso-sign"></i> ${formatNumber(product.price)}</p>
                    <p class="size">Size: ${size}</p>
                    <p class="total-price">₱${formatNumber(product.price * items[item_id][size])}</p>
                </div>
            </div>
            `;
        }
    }

    container.innerHTML = results;

    const amount = document.querySelector(".total-ship .amount");
    amount.innerHTML = `₱${formatNumber(global.cart.total_price)}`;

    const shipping_fee = document.querySelector(".total-ship .shipping_fee");
    shipping_fee.innerHTML = "₱130.00";

    const total = document.querySelector(".total-ship .total");
    total.innerHTML = `₱${formatNumber(global.cart.total_price + 130)}`;
}

function displayCheckout() {
    const checkoutForm = document.getElementById("checkout_form");
    const shippingDetails = document.getElementById("shipping_details");
    const paymentDetails = document.getElementById("payment_details");

    const information_indicator = document.querySelector(".pagination .information-indicator");
    const shipping_indicator = document.querySelector(".pagination .shipping-indicator");
    const payment_indicator = document.querySelector(".pagination .payment-indicator");

    global.gotoShipping = function(event) {
        event.preventDefault();

        const email = document.querySelector("#checkout_form .email_input");
        const email_display = document.querySelector("#shipping_details .email_display");
        email_display.innerHTML = email.value;

        const first_name = document.querySelector("#checkout_form input[placeholder='First name']").value;
        const last_name = document.querySelector("#checkout_form input[placeholder='Last name']").value;
        const address = document.querySelector("#checkout_form input[placeholder='Address']").value;
        const barangay = document.querySelector("#checkout_form input[placeholder='Barangay']").value;
        const postal_code = document.querySelector("#checkout_form input[placeholder='Postal code']").value;
        const city = document.querySelector("#checkout_form input[placeholder='City']").value;

        const address_display = document.querySelector("#shipping_details .ship_to_display");
        address_display.innerHTML = `${first_name} ${last_name} ${address} ${barangay} ${postal_code} ${city}`;

        checkoutForm.classList.add("hide");
        paymentDetails.classList.add("hide");
        shippingDetails.classList.remove("hide");

        activeIndicator(shipping_indicator,function() {
            information_indicator.classList.add("allowed-goto");
            shipping_indicator.classList.remove("allowed-goto");
        });
    }
    global.gotoPayment = function(event) {
        event.preventDefault();

        const first_name = document.querySelector("#checkout_form input[placeholder='First name']").value;
        const last_name = document.querySelector("#checkout_form input[placeholder='Last name']").value;
        const address = document.querySelector("#checkout_form input[placeholder='Address']").value;
        const barangay = document.querySelector("#checkout_form input[placeholder='Barangay']").value;
        const postal_code = document.querySelector("#checkout_form input[placeholder='Postal code']").value;
        const city = document.querySelector("#checkout_form input[placeholder='City']").value;

        const address_display = document.querySelector("#payment_details .ship_to_display");
        address_display.innerHTML = `${first_name} ${last_name} ${address} ${barangay} ${postal_code} ${city}`;

        const email = document.querySelector("#checkout_form .email_input");
        const email_display = document.querySelector("#payment_details .email_display");
        email_display.innerHTML = email.value;

        checkoutForm.classList.add("hide");
        paymentDetails.classList.remove("hide");
        shippingDetails.classList.add("hide");

        activeIndicator(payment_indicator,function() {
            shipping_indicator.classList.add("allowed-goto");
        });
    }
    global.gotoCheckoutForm = function(event) {
        event.preventDefault();
        checkoutForm.classList.remove("hide");
        paymentDetails.classList.add("hide");
        shippingDetails.classList.add("hide");

        activeIndicator(information_indicator,function() {
            information_indicator.classList.remove("allowed-goto");
            shipping_indicator.classList.remove("allowed-goto");
        });
    }

    global.placeOrder = function() {
        const first_name = document.querySelector("#checkout_form input[placeholder='First name']").value;
        const order_number = generateRandomChars(7,"ww-nnnn");
        const today_date = new Date();
        const items_shipped_container = document.querySelector("#order-placed .items");

        let items_shipped = ``;
        for (let item_id in global.cart.items) {
            const product = global.all_products[item_id];
            for (let size in global.cart.items[item_id]) {
                items_shipped += `
                <div class="row">
                    <div class="col-4">
                        <img src="./${product.image}" alt="" width="100%">
                    </div>
                    <div class="col-8 position-relative">
                        <br>
                        <p class="tshirt-name">${product.name}</p>
                        <p class="price-1">${product.price}</p>
                        <p>Quantity: ${global.cart.items[item_id][size]}</p>
                        <p class="size">${size}</p>
                    </div>
                </div>
                `;
            }   
        }
        items_shipped_container.innerHTML = items_shipped;
        
        document.querySelector("#order-placed .today-date").innerHTML = `${numberToMonth(today_date.getMonth())} ${today_date.getDate()}, ${today_date.getFullYear()}`  ; 
        document.querySelector("#order-placed .firstName").innerHTML = first_name;
        document.querySelector("#order-placed .order_number").innerHTML = order_number;
    }

    function activeIndicator(indicator,callback) {
        const active = document.querySelector(".pagination .active");
        active.classList.remove("active");
        indicator.classList.add("active");
        callback();
    }

    displayCartCheckout();
}

function addMobileNavbar() {
    const mobile_navbar = document.getElementById("mobile-navbar");
    global.showMobileNavbar = function() {
        mobile_navbar.style.transform = "translateX(0)";
        document.body.style.overflow = "hidden";
    }

    global.hideMobileNavbar = function() {
        mobile_navbar.style.transform = "translateX(-100%)";
        document.body.style.overflow = "auto";
    }
}

function create_account() {
    const first_name = document.querySelector("#user-form input[placeholder='First name']").value;
    const last_name = document.querySelector("#user-form input[placeholder='Last name']").value;
    const email = document.querySelector("#user-form input[placeholder='Email']").value;
    const password = document.querySelector("#user-form input[placeholder='Password']").value;

    global.accounts[email] = {
        first_name,
        last_name,
        email,
        password
    }

    localStorage.setItem("accounts",JSON.stringify(global.accounts));
    location.assign("./Strap_Login.html");
}

function sign_in_account() {
    const accounts = JSON.parse(localStorage.getItem("accounts"));
    const email = document.querySelector("#user-form input[placeholder='Email']").value;

    let user = accounts[email];
    if (!user) {
        alert("Email Not Found!");
        return;
    }

    localStorage.setItem("logged-user",JSON.stringify(user));
    location.assign("./Strap_User.html");
}


function displayUser() {
    const user = JSON.parse(localStorage.getItem("logged-user"));
    const ordered_items = user.ordered_items;
    const ordered_items_display = document.querySelector("#ordered-items");

    if (ordered_items && Object.keys(ordered_items).length == 0) {
        document.querySelector("#not-ordered").classList.remove("hide");
    } else {
        ordered_items_display.classList.remove("hide");
        document.querySelector("#not-ordered").classList.add("hide");

        let result = ``;
        for (let item_id in ordered_items) {
            const product = global.all_products[item_id];
            for (let size in ordered_items[item_id]) {
                result += `
                <div class="row">
                    <div class="col-4">
                        <img src="./${product.image}" alt="" width="100%">
                    </div>
                    <div class="col-8 position-relative">
                        <br>
                        <p class="tshirt-name">${product.name}</p>
                        <p class="price-1">₱${formatNumber(product.price)}</p>
                        <p>Quantity: ${ordered_items[item_id][size]}</p>
                        <p class="size">${size}</p>
                    </div>
                </div>
                `;
            }   
        }
        ordered_items_display.innerHTML = result;
        
    }

    console.log(ordered_items)

    document.querySelector("#user-details .first_name").innerHTML = user.first_name;
    document.querySelector("#user-details .last_name").innerHTML = user.last_name;
}

function logOutUser() {
    localStorage.removeItem("logged-user");
    location.assign("./Strap_Login.html");
}

//hide cart when not interacting with it
window.addEventListener("click",function(event) {
    const cart = document.getElementById("Cart");
    if (cart && !cart.classList.contains("hide")) {
        const shadow = document.getElementById("shadow");
        if (event.target == shadow) {
            global.hideCartElement();
            global.hideSearchElement();
        } 
    }
});

function updatePaymentOption(value) {
    let cod_checkbox = document.querySelector('#payment_details .cod-checkbox'); 
    const credit_card_info = document.querySelector(".credit-card-info");
    if (value != 'none') {
        cod_checkbox.classList.add('hide');
        credit_card_info.classList.remove("hide")
    }
    else {
        cod_checkbox.classList.remove('hide');
        credit_card_info.classList.add("hide");
    }
}

function donePayment() {
    const user = JSON.parse(localStorage.getItem("logged-user"));
    user.ordered_items = global.cart.items;
    global.cart.items = {};
    localStorage.removeItem("cart-items");
    global.accounts[user.email] = user;
    localStorage.setItem("accounts",JSON.stringify(global.accounts));
    localStorage.setItem("logged-user",JSON.stringify(user));
    location.assign("./index.html");
}

function gotoAccount() {
    const user = localStorage.getItem("logged-user");
    if (!user) location.assign("./Strap_Login.html");
    else location.assign("./Strap_User.html");
}
/*
    *********************************************************
    *********************** U T I L S ***********************
    *********************************************************
*/

function updateQuantity(quantityElement,number,decrementBtn) {
    const quantity = quantityElement;
    if (quantity.value <= 1 && number < 0) {
        decrementBtn.disabled = true;
        return;
    } else {
        decrementBtn.disabled = false;
    }
    quantity.value = Number(quantity.value) + number;
    if (quantity.value <= 0) quantity.value = 1;
}

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",") + ".00";
}

function generateRandomChars(length,syntax) {
    let chars = "";
    syntax = syntax.split("");
    for (let i = 0;i < length;i++) {
        if (syntax[i] == "w") {
            let uppercase = Math.random() * 1 > 0.5 ? 65 : 97;
            let word = String.fromCharCode(uppercase + Math.floor(Math.random() * 26));
            chars += word;
        } else if (syntax[i] == "n") {
            let number = Math.floor(Math.random() * 10);
            chars += number;
        } else chars += "-";
    }
    return chars;
}

function numberToMonth(number) {
    let MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return MONTHS[number];
}