const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const fs = require('fs');
const csvParser = require('csv-parser');
const { parse } = require('json2csv');

app.use(express.json());
app.use(cors());
const PRODUCTS_CSV = './data/products.csv';

// Get all products
const readProductsFromCSV = () => {
  return new Promise((resolve, reject) => {
    const products = [];
    fs.createReadStream(PRODUCTS_CSV)
      .pipe(csvParser())
      .on('data', (row) => products.push(row))
      .on('end', () => resolve(products))
      .on('error', (error) => reject(error));
  });
};

// Helper function to write products to CSV
const writeProductsToCSV = (products) => {
  const csv = parse(products, { fields: Object.keys(products[0]) });
  fs.writeFileSync(PRODUCTS_CSV, csv);
};

// 1. GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await readProductsFromCSV();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error reading products' });
  }
});


app.get('/api/product/:id', async (req, res) => {
  try {
    const products = await readProductsFromCSV();
    const product = products.find((p) => p.id === req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error reading products' });
  }
});

// Add a new product
app.post('/api/product', async (req, res) => {
  const { name, type, price } = req.body;
  if (!name || !type || !price) {
    return res.status(400).json({ error: 'All fields (name, type, price) are required' });
  }

  const id = Math.floor(10000 + Math.random() * 90000).toString(); // Generate a random 5-digit ID

  try {
    const products = await readProductsFromCSV();
    if (products.find((p) => p.id === id)) {
      return res.status(400).json({ error: 'Product with this ID already exists' });
    }
    products.push({ id, name, type, price });
    writeProductsToCSV(products);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding product' });
  }
});

app.delete('/api/product/:id', async (req, res) => {
  try {
    const products = await readProductsFromCSV();
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products.splice(index, 1);
    writeProductsToCSV(products);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});


app.get('/api/products-types', async (req, res) => {
  try {
    const products = await readProductsFromCSV();
    const types = [...new Set(products.map((p) => p.type))];
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ error: 'Error reading product types' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
