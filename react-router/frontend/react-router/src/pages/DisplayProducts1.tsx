import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductPublic } from "../models/products1";
import { getProducts } from "../api/products1";
import "./DisplayProducts1.css";

export default function DisplayProducts() {
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="home">
      <h1>Product database</h1>
      <p className="subtitle">
        Welcome to the Products database! Click on a product to see its details.
      </p>

      {products.length === 0 ? (
        <p className="no-products">
          No products found. Add some products to get started!
        </p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="product-card"
            >
              <h2>{product.title}</h2>

              {/* stock can be 0 */}
              <p className="product-stock">Stock: {product.stock}</p>

              <p className="product-price">
                Price: {(product.price_cents / 100).toFixed(2)}{" "}
                {product.currency ?? "USD"}
              </p>

              <span className="view-details">View details →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
