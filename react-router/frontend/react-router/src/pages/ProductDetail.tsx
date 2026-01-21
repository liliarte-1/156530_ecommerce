import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import type { ProductPublic } from "../models/products1";
import { getProduct } from "../api/products1";

import { createOrder } from "../api/orders";
import { createOrderItem } from "../api/orderItems";

import "./DisplayProducts1.css";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // add-to-order UI state
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  // ✅ order activa (persistida)
  const [orderId, setOrderId] = useState<number | null>(() => {
    const raw = localStorage.getItem("active_order_id");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      const id = Number(productId);
      if (!productId || Number.isNaN(id)) {
        setError("Invalid product id");
        setLoading(false);
        return;
      }

      try {
        const data = await getProduct(id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleAddToOrder() {
    setAddMsg(null);

    if (!product) return;

    // ✅ Auth required (Option A)
    const token = localStorage.getItem("access_token");
    if (!token) {
      setAddMsg("You must be logged in to add items to an order.");
      return;
    }

    // basic validation
    if (qty < 1) {
      setAddMsg("Quantity must be at least 1.");
      return;
    }
    if (qty > product.stock) {
      setAddMsg("Not enough stock for that quantity.");
      return;
    }

    try {
      setAdding(true);

      let currentOrderId = orderId;

      // ✅ if no active order, create one (backend uses token to set user_id)
      if (!currentOrderId) {
        const newOrder = await createOrder({ currency: product.currency ?? "USD" });
        currentOrderId = newOrder.id;

        localStorage.setItem("active_order_id", String(currentOrderId));
        setOrderId(currentOrderId);
      }

      // ✅ add item to order
      await createOrderItem({
        order_id: currentOrderId,
        product_id: product.id,
        quantity: qty,
      });

      setAddMsg("✅ Added to order!");
    } catch (err) {
      setAddMsg(err instanceof Error ? err.message : "Could not add to order");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="loading">Loading product...</div>;

if (error) {
  return (
    <div className="home">
      <h1>Product</h1>
      <p className="error">Error: {error}</p>
      <Link to="/products" className="view-details">
        ← Back to products
      </Link>
    </div>
  );
}

if (!product) return null;

return (
  <div className="home">
    <h1>{product.title}</h1>
    <p className="subtitle">Product details</p>

    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="product-card">
        <p className="product-price">
          Price: {(product.price_cents / 100).toFixed(2)} {product.currency ?? "USD"}
        </p>

        <p className="no-products" style={{ margin: "0 0 1rem 0" }}>
          Stock: {product.stock}
        </p>

        {product.description && (
          <p className="no-products" style={{ margin: "0 0 1.25rem 0" }}>
            {product.description}
          </p>
        )}

        {/* Add to order */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Qty:
            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              disabled={adding}
              style={{
                width: 90,
                padding: "0.45rem 0.6rem",
                borderRadius: 10,
                border: "1px solid #ddd",
                fontSize: "1rem",
                textAlign: "center",
              }}
            />
          </label>

          <button
            type="button"
            onClick={handleAddToOrder}
            disabled={adding || product.stock === 0}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "0.65rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              background: "#667eea",
              color: "white",
            }}
          >
            {adding ? "Adding..." : product.stock === 0 ? "Out of stock" : "Add to order"}
          </button>

          {/* {orderId && <span style={{ opacity: 0.8 }}>Order: #{orderId}</span>} */}

          <Link to="/checkout" className="view-details">
            Go to checkout →
          </Link>
        </div>

        {addMsg && (
          <p className={addMsg.startsWith("✅") ? "subtitle" : "error"} style={{ marginTop: 12 }}>
            {addMsg}
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <Link to="/products" className="view-details">
            ← Back to products
          </Link>
        </div>
      </div>
    </div>
  </div>
);

}
