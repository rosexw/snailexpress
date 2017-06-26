function addItem (inventoryId, quantity){
  var cart = getCart();
  var existingCartItem = getCartItemById(cart, inventoryId);
  if (existingCartItem) {
    existingCartItem.quantity ++;
  } else {
    cart.push({
      inventoryId,
      quantity
    });
  }

  Cookies.set('cart', JSON.stringify(cart));
}

function updateItem (inventoryId, quantity) {
  var cart = getCart();
  for (var item of cart) {
    if (item.inventoryId === inventoryId) {
       item.quantity = quantity;
    }
  }
  saveCart(cart);
}

function removeItem (inventoryId) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].inventoryId === inventoryId) {
      cart.splice(i, 1);
      break;
    }
  }
  saveCart(cart);
}

function getCart() {
  var cookie = Cookies.get('cart');
  var cart;
  if (!cookie) {
    cart = [];
  } else {
    cart = JSON.parse(cookie);
  }
  return cart;
}

function getCartItemById(cart, id) {
  return cart.find((cartItem) => cartItem.inventoryId === id)
}

function saveCart(cart) {
  Cookies.set('cart', JSON.stringify(cart));
}

//Shows cart items
function renderCart() {
  var cart = getCart();

  // Cart is empty case
  if (cart.length === 0) {
    $('#cart').children().remove();
    $('#cart').html('<div>Cart is empty.</div>');
    return;
  }

  $('#cart').children().remove();

  $('#cart').html('<div>Loading...</div>');

  var allItems = Promise.all(cart.map((cartItem) => $.get("/api/inventories/" + cartItem.inventoryId)));
  allItems.then((items) => {
    $('#cart').children().remove();

    items.sort((a, b) => a.name > b.name);
    items.forEach((item) => {
      renderItem(item, getCartItemById(cart, item.id).quantity);
    });
    cartUpdated();
  })
}
function renderItem(item, quantity) {
  $('#cart').append(`
    <div class="row cart-item" data-id="${item.id}">
      <img class="thumbnail" src="${item.image}">
      <h5>${item.name}</h5>
      <p>${quantity} package(s)</p>
      <p>Price: $${item.price}</p>
      <p>Total Price: $${item.price*quantity}</p>
      <div>
        <input type="number" id="update-quantity-${item.id}" value="${quantity}" />
        <button class="button change-cart-item-quantity">Change Quantity</button>
      </div>
      <div>
        <button class="button remove-cart-item">Remove</button>
      </div>
    </div>
  `);
}

//updating cart event handlers
function cartUpdated() {
  $('.change-cart-item-quantity').on('click', function(evt){
    evt.preventDefault();
    var $button = $(this);
    var $item = $button.closest('.cart-item');
    var id = $item.data('id');
    var quantity = $(`#update-quantity-${id}`).val();
    updateItem(id, quantity);
    renderCart();
  });
  $('.remove-cart-item').on('click', function(evt){
    evt.preventDefault();
    var $button = $(this);
    var $item = $button.closest('.cart-item');
    var id = $item.data('id');
    removeItem(id);
    renderCart();
  });
}

$(document).ready(() => {
  //page loads
  renderCart();

  //clicking on Add to Cart event handler
  $('#inventory').on('click', '.addToCart', function(evt) {
    evt.preventDefault();
    var $button = $(this);
    var $item = $button.closest('.item');
    var id = $item.data('id');
    var quantity = 1;
    // add item to cart/cookie
    addItem(id, quantity);
    // show item in cart/cookie
    // renderItem(id);
    renderCart();
  })
});
