import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({
      _id: { $in: req.user.cartItems },
    });

    // add quantity to each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.product.id === product._id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });
    res.status(200).json({ cartItems });
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user;
    const existingCartItem = user.cartItems.find(
      (item) => item.id === productId
    );
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      user.cartItems.push({ product: productId, quantity });
    }
    await user.save();
    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    await user.save();
    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (error) {
    console.log("Error in removeFromCart controller", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const cartItem = user.cartItems.find((item) => item.id === productId);
    if (cartItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res
          .status(200)
          .json({ message: "Product removed from cart successfully" });
      }
      cartItem.quantity = quantity;
      await user.save();
      return res
        .status(200)
        .json({ message: "Quantity updated successfully", cartItem });
    } else
      return res.status(404).json({ message: "Product not found in cart" });
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
