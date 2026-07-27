const mongoose = require("mongoose");
require("dotenv").config();

async function test() {
  try {
    console.log("Connecting...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected Successfully");

    process.exit(0);
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
}

test();