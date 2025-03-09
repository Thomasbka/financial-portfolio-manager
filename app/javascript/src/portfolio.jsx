import React, { useState, useEffect } from 'react';
import Layout from './layout';
import './portfolio.scss';

const DetailModal = ({ show, onClose, investment }) => {
  if (!show || !investment) return null;

  const cumulativeDividend = investment.dividendPayments && investment.dividendPayments.length > 0
    ? investment.dividendPayments.reduce((sum, dp) => sum + parseFloat(dp.amount || 0), 0)
    : 0;

  const totalReturn = (
    (investment.currentPrice - investment.buyPrice) * investment.quantity +
    cumulativeDividend
  ).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{investment.ticker} - {investment.name}</h3>
        <p><strong>Buy Price:</strong> ${investment.buyPrice}</p>
        <p><strong>Quantity:</strong> {investment.quantity}</p>
        <p><strong>Current Price:</strong> ${investment.currentPrice}</p>
        <p>
          <strong>Cumulative Dividend:</strong> ${cumulativeDividend.toFixed(2)}
        </p>
        <p><strong>Total Return:</strong> ${totalReturn}</p>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const EditModal = ({ show, onClose, investment, onUpdateTrade, onAddDividend }) => {
  if (!show || !investment) return null;

  const [activeTab, setActiveTab] = useState('trade'); // 'trade' or 'dividend'
  const [tradeData, setTradeData] = useState({ newQuantity: '', newBuyPrice: '' });
  const [dividendData, setDividendData] = useState({ amount: '', paymentDate: '' });

  useEffect(() => {
    if (show) {
      setActiveTab('trade');
      setTradeData({ newQuantity: '', newBuyPrice: '' });
      setDividendData({ amount: '', paymentDate: '' });
    }
  }, [show]);

  const handleTradeSubmit = () => {
    if (onUpdateTrade) {
      onUpdateTrade(investment.id, {
        newQuantity: parseInt(tradeData.newQuantity, 10),
        newBuyPrice: parseFloat(tradeData.newBuyPrice)
      });
    }
    onClose();
  };

  const handleDividendSubmit = () => {
    if (onAddDividend) {
      onAddDividend(investment.id, {
        amount: parseFloat(dividendData.amount),
        paymentDate: dividendData.paymentDate
      });
    }
    onClose();
  };

  const cumulativeDividend = investment.dividendPayments && investment.dividendPayments.length > 0
    ? investment.dividendPayments.reduce((sum, dp) => sum + parseFloat(dp.amount || 0), 0)
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={e => e.stopPropagation()}>
        <h3>Edit {investment.ticker} - {investment.name}</h3>
        <div className="modal-tabs">
          <button
            className={activeTab === 'trade' ? 'active' : ''}
            onClick={() => setActiveTab('trade')}
          >
            Trade
          </button>
          <button
            className={activeTab === 'dividend' ? 'active' : ''}
            onClick={() => setActiveTab('dividend')}
          >
            Dividend
          </button>
        </div>
        {activeTab === 'trade' && (
          <div className="trade-form">
            <p>Update Trade:</p>
            <input
              type="number"
              placeholder="New Total Quantity"
              value={tradeData.newQuantity}
              onChange={e => setTradeData({ ...tradeData, newQuantity: e.target.value })}
            />
            <input
              type="number"
              placeholder="New Average Buy Price"
              value={tradeData.newBuyPrice}
              onChange={e => setTradeData({ ...tradeData, newBuyPrice: e.target.value })}
            />
            <button onClick={handleTradeSubmit}>Update Trade</button>
          </div>
        )}
        {activeTab === 'dividend' && (
          <div className="dividend-form">
            <p>Add Dividend Payment:</p>
            <input
              type="number"
              placeholder="Dividend Amount (Total)"
              value={dividendData.amount}
              onChange={e => setDividendData({ ...dividendData, amount: e.target.value })}
            />
            <input
              type="date"
              placeholder="Payment Date"
              value={dividendData.paymentDate}
              onChange={e => setDividendData({ ...dividendData, paymentDate: e.target.value })}
            />
            <button onClick={handleDividendSubmit}>Add Dividend</button>
            <div className="dividend-history">
              <h4>Dividend History:</h4>
              {investment.dividendPayments && investment.dividendPayments.length > 0 ? (
                <ul>
                  {investment.dividendPayments.map((dp, index) => (
                    <li key={index}>
                      ${parseFloat(dp.amount).toFixed(2)} on {dp.paymentDate}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No dividend payments recorded.</p>
              )}
              <p>
                <strong>Cumulative Dividend:</strong> ${cumulativeDividend.toFixed(2)}
              </p>
            </div>
          </div>
        )}
        <button className="close-button" onClick={onClose}>Cancel</button>
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  console.log('[DEBUG] ALPHA_VANTAGE_API_KEY:', process.env.ALPHA_VANTAGE_API_KEY);

  useEffect(() => {
    fetch('/api/positions')
      .then(res => res.json())
      .then(serverPositions => {
        const normalized = serverPositions.map(pos => ({
          id: pos.id,
          ticker: pos.symbol,
          buyPrice: parseFloat(pos.buy_price) || 0,
          quantity: parseInt(pos.quantity, 10) || 0,
          currentPrice: parseFloat(pos.current_price) || 0,
          name: pos.name || '',
          dividend: parseFloat(pos.dividend_yield) || 0,
          buyDate: pos.buy_date || '',
          dividendPayments: pos.dividend_payments ? JSON.parse(pos.dividend_payments) : []
        }));
        setInvestments(normalized);
      })
      .catch(err => console.error('Error fetching positions:', err));
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
      if (data.Note || data.Information) {
        console.warn('Alpha Vantage rate-limited or no data for that search.', data);
        setSuggestions([]);
        return;
      }
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
      console.error('fetchSuggestions error:', error);
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
    if (!symbol) return { currentPrice: 0, dividend: 0, name: 'Unknown' };
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
      const globalQuoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
      console.log('[DEBUG] GLOBAL_QUOTE URL:', globalQuoteUrl);
      const quoteRes = await fetch(globalQuoteUrl);
      const quoteData = await quoteRes.json();
      console.log('[DEBUG] GLOBAL_QUOTE response for', symbol, ':', quoteData);
      if (quoteData.Note || quoteData.Information) {
        console.warn('Alpha Vantage rate-limit/no-data for symbol:', symbol, quoteData);
        return { currentPrice: 0, dividend: 0, name: symbol.toUpperCase() };
      }
      const price = parseFloat(quoteData['Global Quote']?.['05. price']) || 0;

      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
      console.log('[DEBUG] OVERVIEW URL:', overviewUrl);
      const overviewRes = await fetch(overviewUrl);
      const overviewData = await overviewRes.json();
      console.log('[DEBUG] OVERVIEW response for', symbol, ':', overviewData);
      if (overviewData.Note || overviewData.Information) {
        console.warn('Alpha Vantage rate-limit/no-data (overview) for symbol:', symbol, overviewData);
        return { currentPrice: price, dividend: 0, name: symbol.toUpperCase() };
      }
      const fullName = overviewData['Name'] || symbol.toUpperCase();
      return {
        currentPrice: price,
        dividend: 0,
        name: fullName,
      };
    } catch (err) {
      console.error('fetchLiveData error:', err);
      return { currentPrice: 0, dividend: 0, name: symbol.toUpperCase() };
    }
  }

  const addInvestment = async () => {
    if (!newInvestment.ticker || !newInvestment.quantity || !newInvestment.buyPrice) return;
    const live = await fetchLiveData(newInvestment.ticker);
    const localObj = {
      ticker: newInvestment.ticker.toUpperCase(),
      buyPrice: parseFloat(newInvestment.buyPrice),
      quantity: parseInt(newInvestment.quantity, 10),
      buyDate: newInvestment.buyDate || '',
      currentPrice: live.currentPrice,
      dividend: 0,
      name: live.name,
      dividendPayments: []
    };
    const payloadForServer = {
      symbol: localObj.ticker,
      buy_price: localObj.buyPrice,
      quantity: localObj.quantity,
      current_price: localObj.currentPrice,
      name: localObj.name,
      dividend_yield: localObj.dividend,
      buy_date: localObj.buyDate,
      dividend_payments: JSON.stringify(localObj.dividendPayments)
    };
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const token = metaTag ? metaTag.getAttribute('content') : '';
    fetch('/api/positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify({ position: payloadForServer }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error adding investment');
        return res.json();
      })
      .then(createdPos => {
        const normalized = {
          id: createdPos.id,
          ticker: createdPos.symbol,
          buyPrice: parseFloat(createdPos.buy_price) || 0,
          quantity: parseInt(createdPos.quantity, 10) || 0,
          currentPrice: parseFloat(createdPos.current_price) || 0,
          name: createdPos.name || '',
          dividend: parseFloat(createdPos.dividend_yield) || 0,
          buyDate: createdPos.buy_date || '',
          dividendPayments: createdPos.dividend_payments ? JSON.parse(createdPos.dividend_payments) : []
        };
        setInvestments(prev => [...prev, normalized]);
        setNewInvestment({ ticker: '', quantity: '', buyPrice: '', buyDate: '' });
      })
      .catch(err => console.error('Error adding investment:', err));
  };

  const updateTrade = (positionId, updatedData) => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const token = metaTag ? metaTag.getAttribute('content') : '';
    fetch(`/api/positions/${positionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify({
        position: {
          quantity: updatedData.newQuantity,
          buy_price: updatedData.newBuyPrice,
        },
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error updating trade');
        return res.json();
      })
      .then(updatedPos => {
        const normalized = {
          id: updatedPos.id,
          ticker: updatedPos.symbol,
          buyPrice: parseFloat(updatedPos.buy_price) || 0,
          quantity: parseInt(updatedPos.quantity, 10) || 0,
          currentPrice: parseFloat(updatedPos.current_price) || 0,
          name: updatedPos.name || '',
          dividend: parseFloat(updatedPos.dividend_yield) || 0,
          buyDate: updatedPos.buy_date || '',
          dividendPayments: updatedPos.dividend_payments ? JSON.parse(updatedPos.dividend_payments) : []
        };
        setInvestments(prev =>
          prev.map(inv => (inv.id === normalized.id ? normalized : inv))
        );
      })
      .catch(err => console.error('Error updating trade:', err));
  };

  const addDividend = (positionId, dividendInfo) => {
    const investment = investments.find(inv => inv.id === positionId);
    if (!investment) return;
    const updatedDividends = investment.dividendPayments
      ? [...investment.dividendPayments, dividendInfo]
      : [dividendInfo];

    const cumulativeDividend = updatedDividends.reduce((sum, dp) => sum + parseFloat(dp.amount || 0), 0);
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const token = metaTag ? metaTag.getAttribute('content') : '';
    fetch(`/api/positions/${positionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify({
        position: {
          dividend_payments: JSON.stringify(updatedDividends),
          dividend_yield: cumulativeDividend
        },
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error updating dividend');
        return res.json();
      })
      .then(updatedPos => {
        const normalized = {
          id: updatedPos.id,
          ticker: updatedPos.symbol,
          buyPrice: parseFloat(updatedPos.buy_price) || 0,
          quantity: parseInt(updatedPos.quantity, 10) || 0,
          currentPrice: parseFloat(updatedPos.current_price) || 0,
          name: updatedPos.name || '',
          dividend: parseFloat(updatedPos.dividend_yield) || 0,
          buyDate: updatedPos.buy_date || '',
          dividendPayments: updatedPos.dividend_payments ? JSON.parse(updatedPos.dividend_payments) : []
        };
        setInvestments(prev =>
          prev.map(inv => (inv.id === normalized.id ? normalized : inv))
        );
      })
      .catch(err => console.error('Error updating dividend:', err));
  };

  const handleSellInvestment = (index) => {
    const inv = investments[index];
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    const token = metaTag ? metaTag.getAttribute('content') : '';
    fetch(`/api/positions/${inv.id}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': token },
    })
      .then(() => {
        setInvestments(prev => prev.filter((_, i) => i !== index));
      })
      .catch(err => console.error('Error selling investment:', err));
  };

  const calculateTotalReturn = (inv) => {
    const capitalGains = (inv.currentPrice - inv.buyPrice) * inv.quantity;
    const cumulativeDividend = inv.dividendPayments
      ? inv.dividendPayments.reduce((sum, dp) => sum + parseFloat(dp.amount || 0), 0)
      : 0;
    return capitalGains + cumulativeDividend;
  };

  const totalUnrealizedPL = investments.reduce((sum, inv) => sum + calculateTotalReturn(inv), 0);

  const openDetailModal = (inv, idx) => {
    setSelectedInvestment({ ...inv, index: idx });
    setShowDetailModal(true);
  };

  const openEditModal = (inv, idx) => {
    setSelectedInvestment({ ...inv, index: idx });
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="portfolio-container">
        <h2 className="text-uppercase text-center portfolio-title">PORTFOLIO</h2>
        {isMobile ? (
          <div className="mobile-portfolio-list">
            {investments.map((inv, idx) => (
              <div
                key={inv.id || idx}
                className="mobile-portfolio-item"
                onClick={() => openEditModal(inv, idx)}
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
                  <th>Stocks</th>
                  <th>Buy Price</th>
                  <th>Quantity</th>
                  <th>Current Price</th>
                  <th>Capital Gains</th>
                  <th>Dividend</th>
                  <th>Total Return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, idx) => {
                  const capGains = ((inv.currentPrice - inv.buyPrice) * inv.quantity).toFixed(2);
                  const cumulativeDividend = inv.dividendPayments
                    ? inv.dividendPayments.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
                    : 0;
                  return (
                    <tr key={inv.id || idx}>
                      <td>
                        <strong>{inv.ticker}</strong>
                        <br />
                        <span className="stock-subtext">{inv.name}</span>
                      </td>
                      <td>${inv.buyPrice}</td>
                      <td>{inv.quantity}</td>
                      <td>${inv.currentPrice}</td>
                      <td>${capGains}</td>
                      <td>${cumulativeDividend.toFixed(2)}</td>
                      <td>${calculateTotalReturn(inv).toFixed(2)}</td>
                      <td>
                        <button className="sell-button" onClick={() => openEditModal(inv, idx)}>
                          EDIT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
  
            <div className="profit-section">
              <p><strong>Unrealized P&L:</strong> ${totalUnrealizedPL.toFixed(2)}</p>
              <p><strong>Realized P&L:</strong> $0 (Future feature)</p>
              <p><strong>Account Balance:</strong> $</p>
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
  
      <DetailModal
        show={showDetailModal}
        investment={selectedInvestment}
        onClose={() => setShowDetailModal(false)}
      />
  
      <EditModal
        show={showEditModal}
        investment={selectedInvestment}
        onClose={() => setShowEditModal(false)}
        onUpdateTrade={updateTrade}
        onAddDividend={addDividend}
      />
    </Layout>
  );
};
  
export default Portfolio;
