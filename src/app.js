const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const ProductManager = require('./managers/ProductManager');

const app = express();
const PORT = 8080;

// Servidor HTTP y Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routers API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Instancia de ProductManager
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

// Ruta home.handlebars
app.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('home', { products });
});

// Ruta realTimeProducts.handlebars
app.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('realTimeProducts', { products });
});

// WebSocket: lógica de conexión
io.on('connection', (socket) => {
  console.log('🟢 Nuevo cliente conectado');

  socket.on('nuevoProducto', async (product) => {
    await productManager.addProduct(product);
    const productosActualizados = await productManager.getProducts();
    io.emit('actualizarProductos', productosActualizados);
  });

  socket.on('eliminarProducto', async (id) => {
    await productManager.deleteProduct(id);
    const productosActualizados = await productManager.getProducts();
    io.emit('actualizarProductos', productosActualizados);
  });
});

// Escuchar en el puerto
httpServer.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
