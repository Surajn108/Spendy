const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    IorE: {
        type: String,
        enum: ["income", "expense"],
        required: true,
    },
    category: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})


module.exports = new mongoose.model('TransactionSchema', TransactionSchema)