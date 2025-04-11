// src/managers/ProductManager.js
const fs = require('fs').promises;
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../../data/products.json');

class ProductManager {
  async getProducts() {
    try {
      const data = await fs.readFile(PRODUCTS_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveProducts(products) {
    await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2));
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(product => product.id === parseInt(id));
  }

  async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
    const products = await this.getProducts();
    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    };
    products.push(newProduct);
    await this.saveProducts(products);
    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex(product => product.id === parseInt(id));
    if (index === -1) return null;

    delete updatedFields.id; // evitar que se sobrescriba el ID
    products[index] = { ...products[index], ...updatedFields };
    await this.saveProducts(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.getProducts();
    const newProducts = products.filter(product => product.id !== parseInt(id));
    if (products.length === newProducts.length) return false;

    await this.saveProducts(newProducts);
    return true;
  }
}

module.exports = ProductManager;
