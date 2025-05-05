const fs = require('fs');
const path = require('path');

class CartManager {
  constructor() {
    this.cartFilePath = path.join(__dirname, '../data/carts.json');
    this.carts = [];
    this.loadCarts();
  }

  loadCarts() {
    if (fs.existsSync(this.cartFilePath)) {
      const fileData = fs.readFileSync(this.cartFilePath, 'utf-8');
      this.carts = JSON.parse(fileData);
    }
  }

  saveCarts() {
    fs.writeFileSync(this.cartFilePath, JSON.stringify(this.carts, null, 2), 'utf-8');
  }

  async createCart() {
    const newCart = { id: this.carts.length + 1, products: [] };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    return this.carts.find((cart) => cart.id === id);
  }

  async addProductToCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    if (cart) {
      cart.products.push({ productId, quantity: 1 });
      this.saveCarts();
      return cart;
    }
    return null;
  }
}

module.exports = CartManager;
