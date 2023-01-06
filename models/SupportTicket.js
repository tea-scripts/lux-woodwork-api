const mongoose = require("mongoose");
const { Schema } = mongoose;

const supportTicketSchema = new Schema(
  {
    subject: {
      type: String,
      required: [true, "Please select a subject"],
    },

    message: {
      type: String,
      required: [true, "Please describe your issue"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "closed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
