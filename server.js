const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const products = require('./data/products');


app.use(express.json());
app.use(cors());

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get a product by ID
app.get('/api/product/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Add a new product
app.post('/api/product', (req, res) => {
  const newProduct = req.body;
  if (!newProduct.type || !newProduct.name || !newProduct.price) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  newProduct.id = Math.floor(Math.random() * 90000) + 10000;

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update a product by ID
app.put('/api/product/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    const updatedProduct = { ...products[productIndex], ...req.body };
    products[productIndex] = updatedProduct;
    res.json(updatedProduct);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Delete a product by ID
app.delete('/api/product/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    res.status(204).json({ message: 'Product deleted successfully!' });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.get('/api/productTypes', (req, res) => {
  const productTypes = [...new Set(products.map(product => product.type))]; // Extract unique product types
  res.json(productTypes);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
