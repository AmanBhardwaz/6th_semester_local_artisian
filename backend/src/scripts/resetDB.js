/**
 * ⚠️  DANGER ZONE — Full Database + Cloudinary Reset
 * Deletes ALL users, products, orders, reviews + Cloudinary images
 * Run: node src/scripts/resetDB.js
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
const path     = require("path");
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const cloudinary = require("../config/cloudinary");
const User       = require("../models/User");
const Product    = require("../models/Product");
const Order      = require("../models/Order");
const Review     = require("../models/Review");

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected\n");

        // ── Step 1: Delete Cloudinary images ──────────────────
        console.log("🗑️  Deleting Cloudinary images (folder: products)...");
        try {
            const result = await cloudinary.api.delete_resources_by_prefix("products/");
            const deleted = Object.keys(result.deleted || {}).length;
            console.log(`   ✅ ${deleted} images deleted from Cloudinary`);

            // Also remove the empty folder
            await cloudinary.api.delete_folder("products").catch(() => {});
        } catch (err) {
            console.warn("   ⚠️  Cloudinary delete skipped (maybe empty):", err.message);
        }

        // ── Step 2: Delete all MongoDB collections ─────────────
        console.log("\n🗑️  Clearing MongoDB collections...");

        const [uCount, pCount, oCount, rCount] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Review.countDocuments(),
        ]);

        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
            Review.deleteMany({}),
        ]);

        console.log(`   ✅ Users   deleted: ${uCount}`);
        console.log(`   ✅ Products deleted: ${pCount}`);
        console.log(`   ✅ Orders  deleted: ${oCount}`);
        console.log(`   ✅ Reviews deleted: ${rCount}`);

        console.log("\n🎉 Database fully reset! Fresh start ready.");
        console.log("👉 Now run makeAdmin.js after creating a new admin user.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Reset failed:", err.message);
        process.exit(1);
    }
};

reset();
