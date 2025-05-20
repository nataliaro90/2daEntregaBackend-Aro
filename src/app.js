const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars'); // Importa express-handlebars

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const ProductManager = require('./managers/ProductManager'); // Asegúrate de usar el manager corregido

const app = express();
const PORT = 8080;

// Servidor HTTP y Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

// Instancia de ProductManager (la creamos antes para usarla en WebSockets)
// Usamos el constructor corregido que ya tiene un path por defecto,
// pero si quieres ser explícito, puedes dejarlo así:
const productManager = new ProductManager(path.join(__dirname, 'data', 'products.json'));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Corrección 6: Directorios estáticos - Ajustar la ruta a la carpeta 'public' dentro de 'src'
// Asegúrate de crear la carpeta 'src/public' y mover tus archivos estáticos allí.
app.use(express.static(path.join(__dirname, 'public')));


// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({
    // Corrección 4: Configurar correctamente el directorio de layouts y el layout por defecto
    defaultLayout: 'main', // Define 'main.handlebars' como el layout por defecto
    layoutsDir: path.join(__dirname, 'views/layouts') // Especifica la ruta a la carpeta de layouts
}));
app.set('view engine', 'handlebars');
// Asegúrate de que las vistas estén en 'src/views', no en 'src/views/layouts'
// home.handlebars y realTimeProducts.handlebars deben estar directamente en src/views
app.set('views', path.join(__dirname, 'views'));


// Routers API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta home.handlebars
app.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Corrección 2: La vista 'home' ya se espera que esté en 'src/views'
        // y usará el layout 'main' por defecto.
        res.render('home', { products, title: 'Lista de Productos - Inicio' });
    } catch (error) {
        console.error('Error al renderizar home:', error);
        res.status(500).send('Error interno del servidor al cargar productos.');
    }
});

// Ruta realTimeProducts.handlebars
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Corrección 2: La vista 'realTimeProducts' ya se espera que esté en 'src/views'
        // y usará el layout 'main' por defecto.
        res.render('realTimeProducts', { products, title: 'Productos en Tiempo Real' });
    } catch (error) {
        console.error('Error al renderizar realTimeProducts:', error);
        res.status(500).send('Error interno del servidor al cargar productos en tiempo real.');
    }
});

// WebSocket: lógica de conexión
io.on('connection', (socket) => {
    console.log('🟢 Nuevo cliente conectado');

    // Corrección 5 (Continuación): Listener para solicitar productos iniciales
    socket.on('requestInitialProducts', async () => {
        try {
            const products = await productManager.getProducts();
            socket.emit('actualizarProductos', products); // Envía los productos al cliente que los solicitó
        } catch (error) {
            console.error('Error al obtener productos iniciales para WebSocket:', error);
        }
    });

    socket.on('nuevoProducto', async (product) => {
        try {
            await productManager.addProduct(product);
            const productosActualizados = await productManager.getProducts();
            io.emit('actualizarProductos', productosActualizados); // Emitir a TODOS los clientes conectados
        } catch (error) {
            console.error('Error al agregar producto via WebSocket:', error.message);
            // Opcional: Emitir un error al cliente que intentó agregar el producto
            socket.emit('errorAddingProduct', { message: error.message });
        }
    });

    socket.on('eliminarProducto', async (id) => {
        try {
            // Asegúrate de que el ID es un número antes de pasarlo al manager
            const numericId = Number(id); 
            const success = await productManager.deleteProduct(numericId); // Pasa el ID numérico
            if (success) {
                const productosActualizados = await productManager.getProducts();
                io.emit('actualizarProductos', productosActualizados); // Emitir a TODOS los clientes conectados
            } else {
                console.warn(`Intento de eliminar producto con ID ${id} fallido: no encontrado.`);
                socket.emit('errorDeletingProduct', { message: 'Producto no encontrado o no se pudo eliminar.' });
            }
        } catch (error) {
            console.error('Error al eliminar producto via WebSocket:', error);
            socket.emit('errorDeletingProduct', { message: 'Error interno al eliminar producto.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado');
    });
});

// Escuchar en el puerto
httpServer.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});