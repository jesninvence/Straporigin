// let cart = [];

// if(localStorage.getItem("savedCart")){
//     cart = JSON.parse(localStorage.getItem("savedCart"));
// }


// function addCart(name, price, image){
//     cart.push({productName: name, productPrice: price, productImage: image});
//     // alert(cart);
//     localStorage.setItem("savedCart", JSON.stringify(cart));
//     alert("Item succesfully added to cart");
// }

// function showCart(){
//     let getSavedCart = JSON.parse(localStorage.getItem("savedCart"));
//     let showCartItems = "";
//     getSavedCart.forEach(
//         function(items){
//             showCartItems = showCartItems + `
//             <div class="cartcol1">
//                 <p id="desc">${items.productName}</p>
//                 <img src='${items.productImage}' style="width: 10%;">
//                 <p id="price">${items.productPrice} Pesos</p>
//             </div>
//             `;
//             // `Product Name: ${items.productName} || Product Price: ${items.productPrice}`
//         }
//     )
//     document.getElementById("items").innerHTML = showCartItems;
// }

// showCart();

// function removeCart(){
//     document.getElementById("items").innerHTML = "";
//     localStorage.removeItem("savedCart");
// }