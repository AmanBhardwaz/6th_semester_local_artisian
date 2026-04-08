const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, subCategory } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl = req.file.path || req.file.secure_url;

    const product = await Product.create({
      title,
      description,
      price,
      image: imageUrl,
      category: category || "",
      subCategory: subCategory || "",
      artisan: req.user.id,
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      artisan: req.user.id
    });

    res.json(products);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("artisan", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("artisan", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only the owner can delete
    if (product.artisan.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.artisan.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const { title, description, price } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};