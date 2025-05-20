const fs = require('fs');
const path = require('path');

class ProductManager {
  // Corrección 1: El constructor inicializa correctamente this.filePath
  // Si no se proporciona un filePath al crear una instancia, usará la ruta por defecto a products.json.
  constructor(filePath = path.join(__dirname, '../data/products.json')) {
    this.filePath = filePath;
    this.products = [];
    this.loadProducts();
  }

  loadProducts() {
    // Verificar si el archivo existe para evitar errores al intentar leer uno que no existe.
    if (fs.existsSync(this.filePath)) {
      try {
        const fileData = fs.readFileSync(this.filePath, 'utf-8');
        // Intentar parsear el JSON. Si el archivo está vacío o mal formateado, JSON.parse lanzará un error.
        this.products = JSON.parse(fileData);
      } catch (error) {
        // Manejar el error de parseo (ej. archivo vacío o JSON inválido)
        console.error(`Error al leer o parsear el archivo de productos en ${this.filePath}: ${error.message}`);
        this.products = []; // Inicializar products como un array vacío para que la aplicación pueda seguir funcionando.
      }
    }
  }

  saveProducts() {
    // Guarda los productos en el archivo especificado por this.filePath
    // null, 2 es para formatear el JSON con indentación de 2 espacios, haciéndolo más legible.
    fs.writeFileSync(this.filePath, JSON.stringify(this.products, null, 2), 'utf-8');
  }

  async getProducts() {
    return this.products;
  }

  async getProductById(id) {
    // Corrección 7: Conversión de ID de string a número ya se realiza correctamente aquí.
    const numericId = Number(id);
    const product = this.products.find((prod) => prod.id === numericId);
    return product || null; // Devuelve el producto encontrado o null si no existe
  }

  async addProduct(product) {
    // Verificamos si ya existe un producto con el mismo "code" (código único)
    const exists = this.products.some(p => p.code === product.code);
    if (exists) {
      throw new Error(`El producto con código '${product.code}' ya existe.`);
    }

    // Corrección 1 (segundo punto): La generación de IDs ya utiliza Math.max con el spread operator (...) correctamente.
    // Si hay productos, el nuevo ID será el máximo ID existente + 1; de lo contrario, será 1.
    const newId = this.products.length > 0
      ? Math.max(...this.products.map((prod) => prod.id)) + 1
      : 1;

    // Crea un nuevo objeto producto con el ID generado y las propiedades del producto proporcionado.
    const newProduct = { id: newId, ...product };
    this.products.push(newProduct); // Añade el nuevo producto al array
    this.saveProducts(); // Guarda los cambios en el archivo
    return newProduct;
  }

  async updateProduct(id, updatedProduct) {
    // Corrección 7: Conversión de ID de string a número ya se realiza correctamente aquí.
    const numericId = Number(id);
    const productIndex = this.products.findIndex((prod) => prod.id === numericId);

    if (productIndex !== -1) {
      // Si el producto existe, actualiza sus propiedades.
      // Se utiliza el spread operator para fusionar las propiedades existentes con las actualizadas.
      // Se asegura que el ID del producto no cambie durante la actualización.
      this.products[productIndex] = {
        ...this.products[productIndex],
        ...updatedProduct,
        id: numericId
      };
      this.saveProducts(); // Guarda los cambios
      return this.products[productIndex]; // Devuelve el producto actualizado
    }
    return null; // Devuelve null si el producto no fue encontrado
  }

  async deleteProduct(id) {
    // Corrección 7: Conversión de ID de string a número ya se realiza correctamente aquí.
    const numericId = Number(id);
    const productIndex = this.products.findIndex((prod) => prod.id === numericId);

    if (productIndex !== -1) {
      // Si el producto existe, lo elimina del array.
      this.products.splice(productIndex, 1);
      this.saveProducts(); // Guarda los cambios
      return true; // Devuelve true si el producto fue eliminado exitosamente
    }
    return false; // Devuelve false si el producto no fue encontrado
  }
}

module.exports = ProductManager;