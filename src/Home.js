// Home.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Row, Col } from "react-bootstrap";
import { FaArrowRight, FaArrowDown } from "react-icons/fa";

function Home() {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  console.log("User from Redux:", user);

  // Application workflow steps with routes
  const workflowSteps = [
    {
      step: 1,
      name: "Supplier",
      description: "Register your suppliers and their contact information",
      icon: "🏭",
      route: "/Supplier",
    },
    {
      step: 2,
      name: "Item",
      description:
        "Add inventory items with details like SKU, description, and supplier",
      icon: "📦",
      route: "/Item",
    },
    {
      step: 3,
      name: "Print Label",
      description: "Generate and print labels for your items (Optional)",
      icon: "🏷️",
      optional: true,
      route: "/barcodelabel",
    },
    {
      step: 4,
      name: "Location",
      description: "Set up storage locations in your warehouse",
      icon: "🏬",
      route: "/Location",
    },
    {
      step: 5,
      name: "Stock Inward",
      description: "Record incoming inventory from suppliers",
      icon: "📥",
      route: "/StockInward",
    },
    {
      step: 6,
      name: "Storage",
      description: "Assign items to specific storage locations",
      icon: "🗄️",
      route: "/Storage",
    },
    {
      step: 7,
      name: "Create Combo",
      description: "Create combination products from individual items",
      icon: "🔗",
      optional: true,
      route: "/create-combo",
    },
    {
      step: 8,
      name: "Stock",
      description: "View and manage current inventory levels",
      icon: "📊",
      optional: true,
      route: "/Stock",
    },
    {
      step: 9,
      name: "Stock Count",
      description: "Perform inventory counts and reconciliation",
      icon: "🔢",
      optional: true,
      route: "/stockCount",
    },
    {
      step: 10,
      name: "Stock Transfer",
      description: "Move inventory between locations",
      icon: "🔄",
      optional: true,
      route: "/stocktransfer",
    },
    {
      step: 11,
      name: "Item Portal Mapping",
      description: "Map your items to external sales channels",
      icon: "🌐",
      route: "/ItemPortalMapping",
    },
    {
      step: 12,
      name: "BOM",
      description: "Create bill of materials",
      icon: "📋",
      optional: true,
      route: "/Bom",
    },
    {
      step: 13,
      name: "BOM ITEMS",
      description: "Create bill of materials for manufactured items",
      icon: "📋",
      optional: true,
      route: "/bomItem",
    },
    {
      step: 14,
      name: "Order",
      description: "Process customer orders",
      icon: "🛒",
      route: "/importorderform",
    },
    {
      step: 15,
      name: "Picklist",
      description: "Generate lists of items to pick for fulfillment",
      icon: "📝",
      route: "/PickList",
    },
    {
      step: 16,
      name: "Picklist Scan",
      description: "Scan items during picking process",
      icon: "📱",
      optional: true,
      route: "/PicklistScan",
    },
    {
      step: 17,
      name: "Packing List",
      description: "Create packing lists for shipments",
      icon: "📦",
      route: "/PackingList",
    },
    {
      step: 18,
      name: "Packing List Scan",
      description: "Scan items during packing process",
      icon: "🔍",
      optional: true,
      route: "/packScan",
    },
    {
      step: 19,
      name: "Dispatch Scan",
      description: "Scan items during dispatch to ensure accuracy",
      icon: "🚚",
      route: "/DispatchScan",
    },
    {
      step: 20,
      name: "Return",
      description: "Process customer returns",
      icon: "↩️",
      route: "/Returns",
    },
  ];

  // Handle card click
  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="home">
      <div className="container">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="animated-text">
              Welcome to Inventory Genius, {user?.name}!
            </h1>
            <h3 className="animated-text mb-4">
              Stay ahead of demand with precision and control. Manage your
              inventory, master your success.
            </h3>
          </div>
          <div className="welcome-image">
            <img
              src="https://www.godfrey.com/application/files/2416/5817/5706/godfrey-je-blog-mrkt-p1.gif"
              alt="Inventory Management"
            />
          </div>
        </div>

        <div className="workflow-section">
          <h4 className="text-center mb-4">Application Workflow</h4>
          <p className="text-center mb-5">
            Follow this recommended sequence to get the most out of Inventory
            Genius
          </p>

          <div className="workflow-container">
            {workflowSteps.map((step, index) => (
              <React.Fragment key={step.step}>
                <div
                  className={`workflow-card fade-in-card delay-${index % 13} ${
                    step.optional ? "optional-card" : ""
                  }`}
                  onClick={() => handleCardClick(step.route)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Navigate to ${step.name}`}
                >
                  <div className="workflow-card-content">
                    <div className="workflow-icon">{step.icon}</div>
                    <div className="step-number">{step.step}</div>
                    <h5>{step.name}</h5>
                    <p>{step.description}</p>
                    {step.optional && (
                      <span className="optional-badge">Optional</span>
                    )}
                  </div>
                </div>
                {index < workflowSteps.length && (
                  <div
                    className={`workflow-arrow slide-in-arrow delay-${
                      index % 13
                    }`}
                  >
                    {(index + 1) % 4 === 0 ? (
                      <FaArrowDown className="down-arrow" />
                    ) : (
                      <FaArrowRight className="right-arrow" />
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
