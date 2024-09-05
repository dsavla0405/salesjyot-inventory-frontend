import './App.css';
import Login from "./Login.js"
import Home from "./Home.js"
import Item from "./Item.js"
import ItemPortalMapping from "./ItemPortalMapping"
import ImportOrderForm from "./ImportOrderForm.js"
import PickList from "./PickList.js"
import PackingList from "./PackingList.js"
import StockInward from "./StockInward.js"
import Stock from './Stock.js';
import Supplier from './Supplier.js';
import Returns from './Returns.js'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router and Routes from react-router-dom
import Bom from './Bom';
import Header from './Header.js';
import Dispatch from './Dispatch.js';
import Storage from './Storage.js'
import StockCount from './StockCount.js';
import DispatchScan from './DispatchScan.js';
import PackScan from './PackScan.js';
import BomItem from './BomItem.js';
import BarcodeLabel from './BarcodeLabel.js';
import PickListScan from './PickListScan.js';
import Location from './Location.js';

function App() {
  return (
    <div className="App">
      <Router>
      <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/supplier" element={<Supplier />} />
          <Route path="/bom" element={<Bom />} />
          <Route path="/item" element={<Item />} />
          <Route path="/importorderform" element={<ImportOrderForm />} />
          <Route path="/itemportalmapping" element={<ItemPortalMapping />} />
          <Route path="/packinglist" element={<PackingList />} />
          <Route path="/picklist" element={<PickList />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/stockinward" element={<StockInward />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/storage" element={<Storage/>} />
          <Route path="/stockCount" element={<StockCount/>} />
          <Route path="/dispatchScan" element={<DispatchScan/>} />
          <Route path="/packScan" element={<PackScan/>} />
          <Route path="/bomItem" element={<BomItem/>} />
          <Route path="/barcodelabel" element={<BarcodeLabel/>} />
          <Route path="/picklistscan" element={<PickListScan/>} />
          <Route path="/location" element={<Location/>} />
        </Routes>
    </Router>
    </div>
  );
}

export default App;
