import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    // status: {
    //   type: String,
    //   enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    //   default: "pending",
    // },

    // shippingAddress: {
    //   street: { type: String, required: true },
    //   city: { type: String, required: true },
    //   state: { type: String, required: true },
    //   country: { type: String, required: true },
    //   postalCode: { type: String, required: true },
    // },
    // paymentInfo: {
    //   method: {
    //     type: String,
    //     enum: ["credit_card", "debit_card", "paypal", "bank_transfer"],
    //     required: true,
    //   },
    //   status: {
    //     type: String,
    //     enum: ["pending", "completed", "failed", "refunded"],
    //     default: "pending",
    //   },
    //   transactionId: String,
    // },
    // tax: {
    //   type: Number,
    //   required: false,
    //   min: 0,
    // },
    // shippingCost: {
    //   type: Number,
    //   required: false,
    //   min: 0,
    // },
    // total: {
    //   type: Number,
    //   required: false,
    //   min: 0,
    // },
  },
  {
    timestamps: true,
  }
);

// Calculate total before saving
// orderSchema.pre("save", function (next) {
//   this.total = this.subtotal + this.tax + this.shippingCost;
//   next();
// });

const Order = mongoose.model("Order", orderSchema);

export default Order;
