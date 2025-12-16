import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import type { Product } from "../models/products";
import { getProduct } from "../api/products";
import "./DisplayProduct.css";

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(productId!);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  if (loading) return <div className="loading">Loading product...</div>;
  if (error)
    return (
      <div className="error-container">
        <p className="error">Error: {error}</p>
        <Link to="/products" className="back-link">
          Back to products
        </Link>
      </div>
    );

  if (!product) return null;

  return (
    <div className="hero-detail">
      <Link to="/products" className="back-link">
        Back to products
      </Link>
      <div className="hero-detail-card">
        <h1>{product.title}</h1>
        <div className="hero-info">
          <div className="info-item">
            <span className="label">ID:</span>
            <span className="value">{product.id}</span>
          </div>
          <div className="info-item">
            <span className="label">Price:</span>
            <span className="value">{(product.price_cents/100).toFixed(2)} {product.currency}</span>
          </div>
          <div className="info-item">
            <span className="label">Stock:</span>
            <span className="value">{product.stock}</span>
          </div>
        </div>
        {product.description && <p className="product-description">{product.description}</p>}
      </div>
    </div>
  );
}
