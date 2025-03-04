import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Layout from './layout';
import './portfolio.scss';

const Modal = ({ show, onClose, investment, onSell }) => {
  if (!show || !investment) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{investment.ticker} - {investment.name}</h3>
        <p><strong>Buy Price:</strong> ${investment.buyPrice}</p>
        <p><strong>Quantity:</strong> {investment.quantity}</p>
        <p><strong>Current Price:</strong> ${investment.currentPrice}</p>
        <p><strong>Dividend Yield:</strong> {investment.dividendYield}%</p>
        <p><strong>Total Return:</strong> ${(
          (investment.currentPrice - investment.buyPrice) * investment.quantity +
          ((investment.dividendYield / 100) * investment.buyPrice * investment.quantity)
        ).toFixed(2)}</p>
        <button className="sell-button" onClick={() => { onSell(); onClose(); }}>SELL</button>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [investments, setInvestments] = useState([
    { ticker: "NVDA", name: "NVIDIA Corporation", buyPrice: 480, quantity: 5, currentPrice: 500, dividendYield: 0.2 },
    { ticker: "GOOGL", name: "Alphabet Inc. Class A", buyPrice: 135, quantity: 10, currentPrice: 140, dividendYield: 0.8 },
  ]);

  const [newInvestment, setNewInvestment] = useState({
    ticker: "",
    quantity: "",
    buyPrice: "",
    buyDate: "",
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    setNewInvestment({
      ...newInvestment,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalReturn = (investment) => {
    const capitalGains = (investment.currentPrice - investment.buyPrice) * investment.quantity;
    const dividendEarnings = ((investment.dividendYield / 100) * investment.buyPrice) * investment.quantity;
    return capitalGains + dividendEarnings;
  };

  const totalUnrealizedPL = investments.reduce((sum, inv) => sum + calculateTotalReturn(inv), 0);

  // Placeholder for fetching stock data (Polygon.io)
  const fetchStockData = async (symbol) => {
    if (!symbol) return;
    const fakeApiResponse = {
      NVDA: { name: "NVIDIA Corporation", currentPrice: 500, dividendYield: 0.2 },
      GOOGL: { name: "Alphabet Inc. Class A", currentPrice: 140, dividendYield: 0.8 },
    };
    return fakeApiResponse[symbol.toUpperCase()] || { name: "Unknown", currentPrice: 0, dividendYield: 0 };
  };

  const addInvestment = async () => {
    if (!newInvestment.ticker || !newInvestment.quantity || !newInvestment.buyPrice) return;
    const stockData = await fetchStockData(newInvestment.ticker);

    const newEntry = {
      ticker: newInvestment.ticker.toUpperCase(),
      name: stockData.name,
      buyPrice: parseFloat(newInvestment.buyPrice),
      quantity: parseInt(newInvestment.quantity),
      currentPrice: stockData.currentPrice,
      dividendYield: stockData.dividendYield,
    };

    setInvestments([...investments, newEntry]);
    setNewInvestment({ ticker: "", quantity: "", buyPrice: "", buyDate: "" });
  };

  const handleSellInvestment = (index) => {
    setInvestments(investments.filter((_, i) => i !== index));
  };

  const openModal = (investment, index) => {
    setSelectedInvestment({ ...investment, index });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="portfolio-container">
        <h2 className="text-uppercase text-center portfolio-title">Portfolio</h2>
        {isMobile ? (
          <div className="mobile-portfolio-list">
            {investments.map((inv, index) => (
              <div
                key={index}
                className="mobile-portfolio-item"
                onClick={() => openModal(inv, index)}
              >
                <span className="ticker"><strong>{inv.ticker}</strong></span>
                <span className="total-return">${calculateTotalReturn(inv).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="portfolio-table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Stocks:</th>
                  <th>Buy Price:</th>
                  <th>Quantity:</th>
                  <th>Current Price:</th>
                  <th>Capital Gains:</th>
                  <th>Dividend Yield (%):</th>
                  <th>Total Return:</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{inv.ticker}</strong>
                      <br />
                      <span className="stock-subtext">{inv.name}</span>
                    </td>
                    <td>${inv.buyPrice}</td>
                    <td>{inv.quantity}</td>
                    <td>${inv.currentPrice}</td>
                    <td>${((inv.currentPrice - inv.buyPrice) * inv.quantity).toFixed(2)}</td>
                    <td>{inv.dividendYield}%</td>
                    <td>${calculateTotalReturn(inv).toFixed(2)}</td>
                    <td>
                      <button
                        className="sell-button"
                        onClick={() => handleSellInvestment(index)}
                      >
                        SELL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="profit-section">
              <p><strong>Unrealized P&L:</strong> ${totalUnrealizedPL.toFixed(2)}</p>
              <p><strong>Realized P&L:</strong> $0 (Future feature)</p>
              <p><strong>Account Balance:</strong> $10,500</p>
            </div>
          </div>
        )}
        <div className="investment-form">
          <h4 className="form-title">Add Investment:</h4>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Symbol/Ticker"
              name="ticker"
              value={newInvestment.ticker}
              onChange={handleInputChange}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Quantity"
              name="quantity"
              value={newInvestment.quantity}
              onChange={handleInputChange}
            />
            <input
              type="number"
              className="form-control"
              placeholder="Buy Price"
              name="buyPrice"
              value={newInvestment.buyPrice}
              onChange={handleInputChange}
            />
            <input
              type="date"
              className="form-control"
              placeholder="Buy Date"
              name="buyDate"
              value={newInvestment.buyDate}
              onChange={handleInputChange}
            />
            <button className="add-button" onClick={addInvestment}>ADD</button>
          </div>
        </div>
      </div>
      <Modal
        show={showModal}
        investment={selectedInvestment}
        onClose={() => setShowModal(false)}
        onSell={() => {
          if (selectedInvestment) {
            handleSellInvestment(selectedInvestment.index);
          }
        }}
      />
    </Layout>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Portfolio />,
    document.body.appendChild(document.createElement('div'))
  );
});

export default Portfolio;
