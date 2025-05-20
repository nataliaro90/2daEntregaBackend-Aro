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
    const newId = this.carts.length > 0
      ? Math.max(...this.carts.map(c => c.id)) + 1
      : 1;

    const newCart = { id: newId, products: [] };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    const numericId = Number(id);
    return this.carts.find((cart) => cart.id === numericId);
  }

  async addProductToCart(cartId, productId) {
    const cart = await this.getCartById(cartId);
    if (cart) {
      const existingProduct = cart.products.find((p) => p.productId === productId);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ productId, quantity: 1 });
      }
      this.saveCarts();
      return cart;
    }
    return null;
  }
}

module.exports = CartManager;
