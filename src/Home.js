// Home.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Row, Col } from 'react-bootstrap';
import { FaArrowRight, FaArrowDown } from 'react-icons/fa';

function Home() {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  console.log("User from Redux:", user);

  // Application workflow steps with routes
  const workflowSteps = [
    { step: 1, name: "Supplier", description: "Register your suppliers and their contact information", icon: "🏭", route: "/Supplier" },
    { step: 2, name: "Item", description: "Add inventory items with details like SKU, description, and supplier", icon: "📦", route: "/Item" },
    { step: 3, name: "Print Label", description: "Generate and print labels for your items (Optional)", icon: "🏷️", optional: true, route: "/barcodelabel" },
    { step: 4, name: "Location", description: "Set up storage locations in your warehouse", icon: "🏬", route: "/Location" },
    { step: 5, name: "Stock Inward", description: "Record incoming inventory from suppliers", icon: "📥", route: "/StockInward" },
    { step: 6, name: "Storage", description: "Assign items to specific storage locations", icon: "🗄️", route: "/Storage" },
    { step: 7, name: "Create Combo", description: "Create combination products from individual items", icon: "🔗", optional: true, route: "/create-combo" },
    { s