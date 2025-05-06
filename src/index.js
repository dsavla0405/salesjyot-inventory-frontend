// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';  // Ensure you are importing the default export
import AppWrapper from './AppWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <AppWrapper>
      <App />
    </AppWrapper>
  </Provider>
);
