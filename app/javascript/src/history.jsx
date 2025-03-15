import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import Layout from './layout';
import './history.scss';

const HistoryModal = ({ trade, onClose }) => {
  if (!trade) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{trade.ticker} Trade Details</h3>
        <p><strong>Stock:</strong> {trade.ticker}</p>
        <p><strong>Name:</strong> {trade.name}</p>
        <p><strong>Quantity:</strong> {trade.quantity}</p>
        <p><strong>Buy Price:</strong> ${trade.buyPrice}</p>
        <p><strong>Sell Price:</strong> ${trade.sellPrice}</p>
        <p><strong>Date:</strong> {trade.date}</p>
        <p>
          <strong>Profit / Loss:</strong> ${((trade.sellPrice - trade.buyPrice) * trade.quantity).toFixed(2)}
        </p>
        <button className="close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const History = () => {
  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetch('/api/trades')
      .then(res => res.json())
      .then(data => {
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTrades(data);
      })
      .catch(err => console.error('Error fetching trade history:', err));
  }, []);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateTradePL = (trade) => {
    return (trade.sellPrice - trade.buyPrice) * trade.quantity;
  };

  return (
    <Router>
      <Layout>
        <h4 className="text-uppercase text-center my-4">Trading History</h4>
        {isMobile ? (
          <div className="history-mobile">
            {trades.map((trade) => (
              <div 
                key={trade.id} 
                className="history-mobile-row" 
                onClick={() => setSelectedTrade(trade)}
              >
                <span className="mobile-ticker">{trade.ticker}</span>
                <span className={`mobile-pl ${calculateTradePL(trade) >= 0 ? 'profit' : 'loss'}`}>
                  ${calculateTradePL(trade).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Quantity</th>
                  <th>Buy Price</th>
                  <th>Sell Price</th>
                  <th>Date</th>
                  <th>Profit / Loss</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id}>
                    <td onClick={() => setSelectedTrade(trade)} style={{cursor: 'pointer'}}>
                      <strong>{trade.ticker}</strong>
                      <br /><span className="stock-subtext">{trade.name}</span>
                    </td>
                    <td>{trade.quantity}</td>
                    <td>${trade.buyPrice.toFixed(2)}</td>
                    <td>${trade.sellPrice.toFixed(2)}</td>
                    <td>{trade.date}</td>
                    <td>
                      ${((trade.sellPrice - trade.buyPrice) * trade.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedTrade && (
          <HistoryModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
        )}
      </Layout>
    </Router>
  );
};

export default History;
