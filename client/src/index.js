import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { ToastContainer } from 'react-toastify';
import { Toaster } from "react-hot-toast";
import rootReducer from './redux/store';
import { configureStore } from '@reduxjs/toolkit';


const store = configureStore({
  reducer: rootReducer,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        <Toaster />
        <ToastContainer />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

