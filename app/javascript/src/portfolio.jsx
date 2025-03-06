import React, { useState, useEffect } from 'react';
import Layout from './layout';
import './portfolio.scss';

const Modal = ({ show, onClose, investment, onSell }) => {
  if (!show || !investment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{investment.ticker} - {investment.name}</h3>
        <p><strong>Buy Price:</strong> ${investment.buyPrice}</p>
        <p><strong>Quantity:</strong> {investment.quantity}</p>
        <p><strong>Current Price:</strong> ${investment.currentPrice}</p>
        <p><strong>Dividend Yield:</strong> {investment.dividendYield}%</p>
        <p>
          <strong>Total Return:</strong> ${
            (
              (investment.currentPrice - investment.buyPrice) * investment.quantity +
              ((investment.dividendYield / 100) * investment.buyPrice * investment.quantity)
            ).toFixed(2)
          }
        </p>
        <button className="sell-button" onClick={() => { onSell(); onClose(); }}>
          SELL
        </button>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [newInvestment, setNewInvestment] = useState({
    ticker: '',
    quantity: '',
    buyPrice: '',
    buyDate: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  console.log("[DEBUG] ALPHA_VANTAGE_API_KEY:", process.env.ALPHA_VANTAGE_API_KEY);

  useEffect(() => {
    fetch('/api/positions')
      .then(res => res.json())
      .then(data => setInvestments(data))
      .catch(err => console.error("Error fetching positions:", err));
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchSuggestions(query) {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`;

      console.log('[DEBUG] Symbol Search URL:', url);
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error('Suggestion fetch failed');
      
      const data = await resp.json();
      console.log('[DEBUG] Symbol Search Response:', data);

      const bestMatches = data.bestMatches || [];
      if (!bestMatches.length) {
        setSuggestions([]);
        return;
      }

      const mapped = bestMatches.map(match => ({
        ticker: match['1. symbol'],
        name: match['2. name']
      }));
      setSuggestions(mapped);
    } catch (error) {
      console.error("fetchSuggestions error:", error);
      setSuggestions([]);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvestment(prev => ({ ...prev, [name]: value }));
    if (name === 'ticker') {
      fetchSuggestions(value.trim());
    }
  };

  const handleSuggestionClick = (sugg) => {
    setNewInvestment(prev => ({ ...prev, ticker: sugg.ticker }));
    setSuggestions([]);
  };

  async function fetchLiveData(symbol) {
    if (!symbol) return { currentPrice: 0, dividendYield: 0, name: 'Unknown' };

    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
      const globalQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
      const quoteRes = await fetch(globalQuoteUrl);
      const quoteData = await quoteRes.json();
      const price = parseFloat(quoteData['Global Quote']?.['05. price']) || 0;
      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
      const overviewRes = await fetch(overviewUrl);
      const overviewData = await overviewRes.json();
      const divYield = parseFloat(overviewData['DividendYield']) || 0;
      const fullName = overviewData['Name'] || symbol.toUpperCase();

      return {
        currentPrice: price,
        dividendYield: divYield,
        name: fullName,
      };
    } catch (err) {
      console.error("fetchLiveData error:", err);
      return { currentPrice: 0, dividendYield: 0, name: symbol.toUpperCase() };
    }
  }

  const addInvestment = async () => {
    if (!newInvestment.ticker || !newInvestment.quantity || !newInvestment.buyPrice) return;

    const live = await fetchLiveData(newInvestment.ticker);
    const investmentData = {
      ticker: newInvestment.ticker.toUpperCase(),
      buyPrice: parseFloat(newInvestment.buyPrice),
      quantity: parseInt(newInvestment.quantity, 10),
      buyDate: newInvestment.buyDate || '',
      currentPrice: live.currentPrice,
      dividendYield: live.dividendYield,
      name: live.name,
    };

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const token = metaTag ? metaTag.getAttribute('content') : '';

    fetch('/api/positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify({ position: investmentData }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Error adding investment");
        return res.json();
      })
      .then(created => {
        setInvestments(prev => [...prev, created]);
        setNewInvestment({ ticker: '', quantity: '', buyPrice: '', buyDate: '' });
      })
      .catch(err => console.error("Error adding investment:", err));
  };

  const handleSellInvestment = (index) => {
    const inv = investments[index];
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const token = metaTag ? metaTag.getAttribute('content') : '';

    fetch(`/api/positions/${inv.id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': token,
      },
    })
      .then(() => {
        setInvestments(prev => prev.filter((_, i) => i !== index));
      })
      .catch(err => console.error("Error selling investment:", err));
  };

  const calculateTotalReturn = (inv) => {
    const capitalGains = (inv.currentPrice - inv.buyPrice) * inv.quantity;
    const dividendEarnings = (inv.dividendYield / 100) * inv.buyPrice * inv.quantity;
    return capitalGains + dividendEarnings;
  };

  const totalUnrealizedPL = investments.reduce((sum, inv) => sum + calculateTotalReturn(inv), 0);

  const openModal = (inv, idx) => {
    setSelectedInvestment({ ...inv, index: idx });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="portfolio-container">
        <h2 className="text-uppercase text-center portfolio-title">Portfolio</h2>
        {isMobile ? (
          <div className="mobile-portfolio-list">
            {investments.map((inv, idx) => (
              <div
                key={idx}
                className="mobile-portfolio-item"
                onClick={() => openModal(inv, idx)}
              >
                <span className="ticker">
                  <strong>{inv.ticker}</strong>
                </span>
                <span className="total-return">
                  ${calculateTotalReturn(inv).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="portfolio-table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Stocks</th>
                  <th>Buy Price</th>
                  <th>Quantity</th>
                  <th>Current Price</th>
                  <th>Capital Gains</th>
                  <th>Dividend Yield (%)</th>
                  <th>Total Return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, idx) => {
                  const capGains = (
                    (inv.currentPrice - inv.buyPrice) * inv.quantity
                  ).toFixed(2);
                  return (
                    <tr key={idx}>
                      <td>
                        <strong>{inv.ticker}</strong>
                        <br />
                        <span className="stock-subtext">{inv.name}</span>
                      </td>
                      <td>${inv.buyPrice}</td>
                      <td>{inv.quantity}</td>
                      <td>${inv.currentPrice}</td>
                      <td>${capGains}</td>
                      <td>{inv.dividendYield}%</td>
                      <td>${calculateTotalReturn(inv).toFixed(2)}</td>
                      <td>
                        <button
                          className="sell-button"
                          onClick={() => handleSellInvestment(idx)}
                        >
                          SELL
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="profit-section">
              <p>
                <strong>Unrealized P&L:</strong> ${totalUnrealizedPL.toFixed(2)}
              </p>
              <p>
                <strong>Realized P&L:</strong> $0 (Future feature)
              </p>
              <p>
                <strong>Account Balance:</strong> $10,500
              </p>
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
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((sugg, sidx) => (
                  <li key={sidx} onClick={() => handleSuggestionClick(sugg)}>
                    {sugg.ticker} - {sugg.name}
                  </li>
                ))}
              </ul>
            )}

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
            <button className="add-button" onClick={addInvestment}>
              ADD
            </button>
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

export default Portfolio;
