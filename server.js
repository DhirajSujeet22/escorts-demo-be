require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

// Schema for SEO data
const seoSchema = new mongoose.Schema({
  title: String,
  description: String,
  keywords: String,
  author: String,
  robots: String,
  ogImage: String,
});

const Seo = mongoose.model("Seo", seoSchema);

// Schema for Product data
const productSchema = new mongoose.Schema({
  title: { type: String },
  metaTitle: { type: String },
  contact: { type: String },
  image: { type: String },
  metaImage: { type: String },
  time: { type: String },
});

const Product = mongoose.model("Product", productSchema);

app.get("/", (req, res) => {
  res.json({ message: "working" });
});

// Get SEO data
app.get("/api/seo", async (req, res) => {
  const seoData = await Seo.findOne(); // Fetching the latest SEO settings
  res.json({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    author: seoData.author,
    ogImage: seoData.ogImage,
    robots: seoData.robots,
  });
});

// Update SEO data
app.post("/api/seo", async (req, res) => {
  const { title, description, keywords } = req.body;
  await Seo.updateOne({}, { ...req.body }, { upsert: true });
  res.json({ message: "SEO Updated" });
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Create a new product
app.post("/api/products", async (req, res) => {
  try {
    const { title, contact, image, time } = req.body;
    const newProduct = new Product({ ...req.body });
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update a product by ID
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contact, image, time } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete a product by ID
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.listen(process.env.PORT, () => console.log("Server started on port 4000"));
