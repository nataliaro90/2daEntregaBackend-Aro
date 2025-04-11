// src/routes/products.router.js
const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET product by ID
router.get('/:pid', async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const product = await productManager.getProductById(id);
    product
      ? res.json(product)
      : res.status(404).json({ error: 'Producto no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST add new product
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, stock, category } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// PUT update product
router.put('/:pid', async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const updated = await productManager.updateProduct(id, req.body);
    updated
      ? res.json(updated)
      : res.status(404).json({ error: 'Producto no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE product
router.delete('/:pid', async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const deleted = await productManager.deleteProduct(id);
    deleted
      ? res.json({ message: 'Producto eliminado' })
      : res.status(404).json({ error: 'Producto no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
