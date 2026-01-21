import Layout from "./components/Layout";
import DisplayProducts from "./pages/DisplayProducts1";
import ProductDetail from "./pages/ProductDetail";
import CreateUser from "./pages/CreateUsers1";
import LoginUser from "./pages/LoginUsers1";
import Checkout from "./pages/Checkout";
import { Navigate } from "react-router-dom";

/**
 * Route configuration for React Router.
 * 
 * This array defines all the routes in the application.
 * Each route object can have:
 * - path: The URL path for this route
 * - element: The React component to render
 * - children: Nested routes (rendered inside parent's <Outlet />)
 * - index: If true, this is the default child route (shown at parent's path)
 */
export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
        
      //Default redirect
      {
      index: true,
      element: <Navigate to="/products" replace />,
      },
      
      // Products
      {
        path: "products",
        element: <DisplayProducts />,
      },
      {
        path: "products/:productId",
        element: <ProductDetail />,
      },

      // Checkout
      {
        path: "checkout",
        element: <Checkout />,
      },

      // Auth
      {
        path: "auth/register",
        element: <CreateUser />,
      },
      {
        path: "auth/login",
        element: <LoginUser />,
      },
    ],
  },
];
