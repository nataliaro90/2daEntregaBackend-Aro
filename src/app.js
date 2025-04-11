const express = require('express');
const app = express();
const PORT = 8080;

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montamos las rutas con prefijo
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
