import mongoose from "mongoose";

let Comment = new mongoose.Schema({
    author: { type: String, lowercase: true, required: true },
    article: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(),
        required: true,
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
    modified: {
        type: Boolean,
        default: false,
    },
    ID: { type: String, required: true },
    authorID: { type: String, required: true },
});

export = mongoose.model("Comment", Comment);
