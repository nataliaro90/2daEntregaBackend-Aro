// src/routes/carts.router.js
const express = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// POST /api/carts/ - Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

// GET /api/carts/:cid - Obtener productos de un carrito
router.get('/:cid', async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cid);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);

    // Verificamos que el producto exista
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedCart = await cartManager.addProductToCart(cid, pid);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

module.exports = router;
