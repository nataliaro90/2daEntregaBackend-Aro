const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager();

// Obtener todos los productos
router.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
  const id = parseInt(req.params.pid);
  const product = await productManager.getProductById(id);
  product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const newProduct = await productManager.addProduct({
    title, description, code, price, status, stock, category, thumbnails
  });

  res.status(201).json(newProduct);
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
  const id = parseInt(req.params.pid);
  const updated = await productManager.updateProduct(id, req.body);
  updated ? res.json(updated) : res.status(404).json({ error: 'Producto no encontrado' });
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
  const id = parseInt(req.params.pid);
  const success = await productManager.deleteProduct(id);
  success ? res.json({ message: 'Producto eliminado' }) : res.status(404).json({ error: 'Producto no encontrado' });
});

module.exports = router;

