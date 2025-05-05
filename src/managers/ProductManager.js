const fs = require('fs');
const path = require('path');

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.products = [];
    this.loadProducts();
  }

  loadProducts() {
    if (fs.existsSync(this.filePath)) {
      const fileData = fs.readFileSync(this.filePath, 'utf-8');
      this.products = JSON.parse(fileData);
    }
  }

  saveProducts() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.products, null, 2), 'utf-8');
  }

  async getProducts() {
    return this.products;
  }

  async getProductById(id) {
    const product = this.products.find((prod) => prod.id === id);
    return product || null;
  }

  async addProduct(product) {
    product.id = this.products.length ? Math.max(this.products.map((prod) => prod.id)) + 1 : 1;
    this.products.push(product);
    this.saveProducts();
    return product;
  }

  async updateProduct(id, updatedProduct) {
    const productIndex = this.products.findIndex((prod) => prod.id === id);
    if (productIndex !== -1) {
      this.products[productIndex] = { ...this.products[productIndex], ...updatedProduct };
      this.saveProducts();
      return this.products[productIndex];
    }
    return null;
  }

  async deleteProduct(id) {
    const productIndex = this.products.findIndex((prod) => prod.id === id);
    if (productIndex !== -1) {
      this.products.splice(productIndex, 1);
      this.saveProducts();
      return true;
    }
    return false;
  }
}

module.exports = ProductManager;
