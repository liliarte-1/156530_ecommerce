import { useEffect, useState } from "react";
/**
 * Link: Component for navigation without page reload.
 * - Works like <a> but uses client-side routing
 * - The `to` prop specifies the destination path
 */
import { Link } from "react-router-dom";
import type { Product } from "../models/products";
import { getProducts } from "../api/products";
import "./DisplayProduct.css";

export default function DisplayProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect: Hook to perform side effects (API calls, subscriptions, etc.)
   * 
   * Syntax: useEffect(effectFunction, dependencyArray)
   * 
   * - The effect function runs AFTER the component renders
   * - The dependency array [] (empty) means: run only ONCE when component mounts
   * - If we had [someVar], it would re-run whenever someVar changes
   * 
   * Common use cases:
   * - Fetching data from an API
   * - Setting up subscriptions
   * - Updating the document title
   */
  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []); // Empty array = run only on mount (component first appears)

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="home">
      <h1>Product database</h1>
      <p className="subtitle">
        Welcome to the Products database! Click on a product to see their details.
      </p>
      {products.length === 0 ? (
        <p className="no-products">No products found. Add some products to get started!</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            // Link navigates to /heroes/1, /heroes/2, etc. without page reload
            <Link key={product.id} to={`/products/${product.id}`} className="product-card">
              <h2>{product.title}</h2>
              {product.stock && <p className="product-stock">Stock: {product.stock}</p>}
              <span className="view-details">View details →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
