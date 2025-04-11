const fs = require('fs').promises;
const path = require('path');

const CARTS_PATH = path.join(__dirname, '../../data/carts.json');

class CartManager {
  // Leer todos los carritos
  async getCarts() {
    try {
      const data = await fs.readFile(CARTS_PATH, 'utf-8');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      // Si el archivo no existe o está vacío, devolver array vacío
      return [];
    }
  }

  // Crear un nuevo carrito
  async createCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: carts.length ? carts[carts.length - 1].id + 1 : 1,
      products: []
    };
    carts.push(newCart);
    await fs.writeFile(CARTS_PATH, JSON.stringify(carts, null, 2));
    return newCart;
  }

  // Obtener carrito por ID
  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(c => c.id === Number(id));
  }

  // Agregar producto a carrito
  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === Number(cartId));
    if (!cart) return null;

    const existingProduct = cart.products.find(p => p.product === Number(productId));

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.products.push({
        product: Number(productId),
        quantity: 1
      });
    }

    await fs.writeFile(CARTS_PATH, JSON.stringify(carts, null, 2));
    return cart;
  }
}

module.exports = CartManager;
