import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { OrderRead } from "../models/orders";
import type { OrderItemRead } from "../models/orderItems";

import { getOrder, updateOrderStatus } from "../api/orders";
import { listOrderItems, updateOrderItem, deleteOrderItem } from "../api/orderItems";

import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const orderId = useMemo(() => {
    const raw = localStorage.getItem("active_order_id");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, []);

  const [order, setOrder] = useState<OrderRead | null>(null);
  const [items, setItems] = useState<OrderItemRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workingItemId, setWorkingItemId] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);

  async function refresh() {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [o, its] = await Promise.all([
        getOrder(orderId),
        listOrderItems({ order_id: orderId }),
      ]);
      setOrder(o);
      setItems(its);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const [o, its] = await Promise.all([
          getOrder(orderId),
          listOrderItems({ order_id: orderId }),
        ]);
        if (!cancelled) {
          setOrder(o);
          setItems(its);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const computedTotalCents = useMemo(() => {
    return items.reduce((acc, it) => acc + it.unit_price_cents * it.quantity, 0);
  }, [items]);

  async function handleQtyChange(itemId: number, nextQty: number) {
    if (nextQty < 1) return;

    setWorkingItemId(itemId);
    setError(null);

    try {
      await updateOrderItem(itemId, { quantity: nextQty });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update item");
    } finally {
      setWorkingItemId(null);
    }
  }

  async function handleRemove(itemId: number) {
    setWorkingItemId(itemId);
    setError(null);

    try {
      await deleteOrderItem(itemId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove item");
    } finally {
      setWorkingItemId(null);
    }
  }

  async function handlePlaceOrder() {
    if (!orderId) return;

    setPlacing(true);
    setError(null);

    try {
      await updateOrderStatus(orderId, "paid");
      localStorage.removeItem("active_order_id");
      navigate("/"); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div className="loading">Loading checkout...</div>;

  if (!orderId) {
    return (
      <div className="checkout">
        <h1>Checkout</h1>
        <p className="subtitle">No active order found.</p>
        <Link className="back-link" to="/products">
          Go to products
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout">
        <h1>Checkout</h1>
        <p className="error">Error: {error}</p>
        <div className="checkout-actions">
          <button className="secondary-btn" onClick={refresh}>
            Retry
          </button>
          <Link className="secondary-btn" to="/products">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="checkout">
        <h1>Checkout</h1>
        <p className="error">Order not found.</p>
        <Link className="secondary-btn" to="/products">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <p className="subtitle">
        Order #{order.id} · Status: <strong>{order.status}</strong>
      </p>

      {items.length === 0 ? (
        <p className="no-items">
          Your order is empty. Add products from the{" "}
          <Link to="/products">products page</Link>.
        </p>
      ) : (
        <>
          <div className="items-grid">
            {items.map((it) => {
              const lineTotal = it.unit_price_cents * it.quantity;
              const busy = workingItemId === it.id;

              return (
                <div key={it.id} className="item-card">
                  <div className="item-header">
                    <h2>Product #{it.product_id}</h2>
                    <button
                      className="danger-btn"
                      onClick={() => handleRemove(it.id)}
                      disabled={busy || placing}
                      title="Remove item"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="item-price">
                    Unit: {(it.unit_price_cents / 100).toFixed(2)} {order.currency}
                  </p>

                  <div className="qty-row">
                    <span className="label">Qty</span>
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => handleQtyChange(it.id, it.quantity - 1)}
                        disabled={busy || placing || it.quantity <= 1}
                      >
                        -
                      </button>

                      <input
                        className="qty-input"
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => handleQtyChange(it.id, Number(e.target.value))}
                        disabled={busy || placing}
                      />

                      <button
                        className="qty-btn"
                        onClick={() => handleQtyChange(it.id, it.quantity + 1)}
                        disabled={busy || placing}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <p className="item-total">
                    Line total: {(lineTotal / 100).toFixed(2)} {order.currency}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="summary-card">
            <div className="summary-row">
              <span>Total</span>
              <span className="summary-total">
                {(computedTotalCents / 100).toFixed(2)} {order.currency}
              </span>
            </div>

            <div className="checkout-actions">
              <Link className="secondary-btn" to="/products">
                Continue shopping
              </Link>

              <button
                className="primary-btn"
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
              >
                {placing ? "Placing..." : "Place order"}
              </button>
            </div>

            <p className="summary-note">
              This is a demo checkout: it only updates the order status to <code>paid</code>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
