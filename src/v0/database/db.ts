import mongoose from "mongoose";
import config from "../../config";
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.set("useFindAndModify", false);

const db = mongoose.connection;

export = db;
