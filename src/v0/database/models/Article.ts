import mongoose from "mongoose";

let Arcticle = new mongoose.Schema({
    author: String,
    title: String,
    slug: { type: String, slug: "title", slugPaddingSize: 2, unique: true },
    tags: Array,
    content: String,
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
});

export = mongoose.model("Article", Arcticle);
