const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { protect } = require("../middleware/auth.middleware");
const { createProduct, getMyProducts, getAllProducts, getProductById, deleteProduct, updateProduct } = require("../controllers/product.controller");

router.post("/create", protect, upload.single("image"), createProduct);
router.get("/my", protect, getMyProducts);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", protect, deleteProduct);
router.put("/:id", protect, updateProduct);

module.exports = router;
