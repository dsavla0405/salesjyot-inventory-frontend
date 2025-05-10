import './App.css';
import Login from "./Login.js";
import Home from "./Home.js";
import Item from "./Item.js";
import ItemPortalMapping from "./ItemPortalMapping";
import ImportOrderForm from "./ImportOrderForm.js";
import PickList from "./PickList.js";
import PackingList from "./PackingList.js";
import StockInward from "./StockInward.js";
import Stock from './Stock.js';
import Supplier from './Supplier.js';
import Returns from './Returns.js';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Bom from './Bom';
import Header from './Header.js';
import Dispatch from './Dispatch.js';
import Storage from './Storage.js';
import StockCount from './StockCount.js';
import DispatchScan from './DispatchScan.js';
import PackScan from './PackScan.js';
import BomItem from './BomItem.js';
import BarcodeLabel from './BarcodeLabel.js';
import PickListScan from './PickListScan.js';
import Location from './Location.js';
import StockTransfer from './StockTransfer.js';
import CreateCombo from './CreateCombo.js';
import ProtectedRoute from './ProtectedRoute.js';
import { useSelector } from "react-redux";
import AccountDetails from "./AccountDetails.js";
function App() {
  const location = useLocation(); // Get the current route location
  const auth1 = useSelector((state) => state.user.isAuthenticated);
  // console.log("auth in app. js ::" + auth1);

  return (
    <div className="App">
      {/* Conditionally render the Header based on the current route */}
      {location.pathname !== "/" && auth1 && <Header />}
      {/* Don't render Header on login page */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/supplier" element={<ProtectedRoute><Supplier /></ProtectedRoute>} />
        <Route path="/bom" element={<ProtectedRoute><Bom /></ProtectedRoute>} />
        <Route path="/item" element={<ProtectedRoute><Item /></ProtectedRoute>} />
        <Route path="/importorderform" element={<ProtectedRoute><ImportOrderForm /></ProtectedRoute>} />
        <Route path="/itemportalmapping" element={<ProtectedRoute><ItemPortalMapping /></ProtectedRoute>} />
        <Route path="/packinglist" element={<ProtectedRoute><PackingList /></ProtectedRoute>} />
        <Route path="/picklist" element={<ProtectedRoute><PickList /></ProtectedRoute>} />
        <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
        <Route path="/stockinward" element={<ProtectedRoute><StockInward /></ProtectedRoute>} />
        <Route path="/dispatch" element={<ProtectedRoute><Dispatch /></ProtectedRoute>} />
        <Route path="/storage" element={<ProtectedRoute><Storage/></ProtectedRoute>} />
        <Route path="/stockCount" element={<ProtectedRoute><StockCount/></ProtectedRoute>} />
        <Route path="/dispatchScan" element={<ProtectedRoute><DispatchScan/></ProtectedRoute>} />
        <Route path="/packScan" element={<ProtectedRoute><PackScan/></ProtectedRoute>} />
        <Route path="/bomItem" element={<ProtectedRoute><BomItem/></ProtectedRoute>} />
        <Route path="/barcodelabel" element={<ProtectedRoute><BarcodeLabel/></ProtectedRoute>} />
        <Route path="/picklistscan" element={<ProtectedRoute><PickListScan/></ProtectedRoute>} />
        <Route path="/location" element={<ProtectedRoute><Location/></ProtectedRoute>} />
        <Route path="/stocktransfer" element={<ProtectedRoute><StockTransfer/></ProtectedRoute>} />
        <Route path="/create-combo" element={<ProtectedRoute><CreateCombo/></ProtectedRoute>} />
        <Route
          path="/AccountDetails"
          element={
            <ProtectedRoute>
              <AccountDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
