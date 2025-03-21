import React, { useState, useEffect } from 'react';
import Layout from './layout';
import './portfolio.scss';

const DetailModal = ({ show, onClose, investment }) => {
  if (!show || !investment) return null;

  const cumulativeDividend = (investment.dividendPayments || []).reduce(
    (sum, dp) => sum + parseFloat(dp.amount || 0),
    0
  );

  const totalReturn = (
    (investment.currentPrice - investment.buyPrice) * investment.quantity +
    cumulativeDividend
  ).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{investment.ticker} - {investment.name}</h3>
        <p><strong>Buy Price:</strong> ${parseFloat(investment.buyPrice).toFixed(2)}</p>
        <p><strong>Quantity:</strong> {investment.quantity}</p>
        <p><strong>Current Price:</strong> ${investment.currentPrice}</p>
        <p><strong>Cumulative Dividend:</strong> ${cumulativeDividend.toFixed(2)}</p>
        <p><strong>Total Return:</strong> ${totalReturn}</p>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const EditModal = ({
  show,
  onClose,
  investment,
  onUpdateTrade,
  onSellTrade,
  onAddDividend,
  onDelete
}) => {
  if (!show || !investment) return null;

  const [activeTab, setActiveTab] = useState('trade');
  const [tradeMode, setTradeMode] = useState('update');
  const [buyData, setBuyData] = useState({ additionalQuantity: '' });
  const [sellData, setSellData] = useState({ sellQuantity: '' });
  const [dividendData, setDividendData] = useState({ amount: '', paymentDate: '' });

  useEffect(() => {
    if (show) {
      setActiveTab('trade');
      setTradeMode('update');
      setBuyData({ additionalQuantity: '' });
      setSellData({ sellQuantity: '' });
      setDividendData({ amount: '', paymentDate: '' });
    }
  }, [show]);

  const handleBuySubmit = () => {
    if (!onUpdateTrade) return;
    const additionalQty = parseInt(buyData.additionalQuantity, 10);
    if (isNaN(additionalQty) || additionalQty <= 0) return;
    onUpdateTrade(investment.id, {
      newQuantity: additionalQty,
    });
    onClose();
  };

  const handleSellSubmit = () => {
    if (!onSellTrade) return;
    const sellQty = parseInt(sellData.sellQuantity, 10);
    if (isNaN(sellQty) || sellQty <= 0 || sellQty > investment.quantity) {
      alert("Invalid sell quantity.");
      return;
    }
    onSellTrade(investment.id, { sellQuantity: sellQty });
    onClose();
  };

  const handleDividendSubmit = () => {
    if (!onAddDividend) return;
    const amount = parseFloat(dividendData.amount);
    if (isNaN(amount) || amount <= 0 || !dividendData.paymentDate) return;
    onAddDividend(investment.id, {
      amount,
      paymentDate: dividendData.paymentDate
    });
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (window.confirm("Are you sure you want to delete this position?")) {
      onDelete(investment.id);
      onClose();
    }
  };

  const cumulativeDividend = (investment.dividendPayments || []).reduce(
    (sum, dp) => sum + parseFloat(dp.amount || 0),
    0
  );

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
            <div className="trade-mode-selector">
              <label>
                <input
                  type="radio"
                  name="tradeMode"
                  value="update"
                  checked={tradeMode === 'update'}
                  onChange={() => setTradeMode('update')}
                />
                Buy More
              </label>
              <label>
                <input
                  type="radio"
                  name="tradeMode"
                  value="sell"
                  checked={tradeMode === 'sell'}
                  onChange={() => setTradeMode('sell')}
                />
                Sell Shares
              </label>
            </div>

            {tradeMode === 'update' && (
              <>
                <p>Buy Additional Shares:</p>
                <input
                  type="number"
                  placeholder="Additional Quantity"
                  value={buyData.additionalQuantity}
                  onChange={e => setBuyData({ additionalQuantity: e.target.value })}
                />
                <p>Buy Price automatically set to current price: ${investment.currentPrice}</p>
                <button onClick={handleBuySubmit}>Buy More</button>
              </>
            )}

            {tradeMode === 'sell' && (
              <>
                <p>Sell Shares:</p>
                <input
                  type="number"
                  placeholder="Quantity to Sell"
                  value={sellData.sellQuantity}
                  onChange={e => setSellData({ sellQuantity: e.target.value })}
                />
                <p>Sell Price automatically set to current price: ${investment.currentPrice}</p>
                <button onClick={handleSellSubmit}>Sell Shares</button>
              </>
            )}

            <button
              className="delete-button"
              onClick={handleDelete}
              style={{ marginTop: '1em', backgroundColor: '#dc3545' }}
            >
              Delete Position
            </button>
          </div>
        )}

        {activeTab === 'dividend' && (
          <div className="dividend-form">
            <p>Add Dividend Payment (Total):</p>
            <input
              type="number"
              placeholder="Dividend Amount"
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
                  {investment.dividendPayments.map((dp, idx) => (
                    <li key={idx}>
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

const AddInvestmentModal = ({ show, onClose, onAddInvestment }) => {
  const [formData, setFormData] = useState({
    ticker: '',
    quantity: '',
    buyPrice: '',
    buyDate: '',
  });

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (show) {
      setFormData({
        ticker: '',
        quantity: '',
        buyPrice: '',
        buyDate: '',
      });
      setSuggestions([]);
    }
  }, [show]);

  async function fetchSuggestions(query) {
    console.log("fetchSuggestions called with:", query);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
      const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`;
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error('Suggestion fetch failed');
      const data = await resp.json();
      if (data.Note || data.Information) {
        console.warn('Alpha Vantage rate-limited or no data.', data);
        setSuggestions([]);
        return;
      }
      const bestMatches = data.bestMatches || [];
      const mapped = bestMatches.map(m => ({
        ticker: m['1. symbol'],
        name: m['2. name']
      }));
      setSuggestions(mapped);
    } catch (error) {
      console.error('fetchSuggestions error:', error);
      setSuggestions([]);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'ticker') {
      fetchSuggestions(value.trim());
    }
  };

  const handleSuggestionClick = (sugg) => {
    setFormData(prev => ({ ...prev, ticker: sugg.ticker }));
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!formData.ticker || !formData.quantity || !formData.buyPrice) {
      alert("Please fill in ticker, quantity, and buy price.");
      return;
    }
    onAddInvestment(formData);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-investment-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add Investment</h3>
        <div className="modal-form-group" style={{ position: 'relative' }}>
          <label>Symbol/Ticker</label>
          <input
            type="text"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((sugg, idx) => (
                <li key={idx} onClick={() => handleSuggestionClick(sugg)}>
                  {sugg.ticker} - {sugg.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="modal-form-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
          />
        </div>
        <div className="modal-form-group">
          <label>Buy Price</label>
          <input
            type="number"
            name="buyPrice"
            value={formData.buyPrice}
            onChange={handleChange}
          />
        </div>
        <div className="modal-form-group">
          <label>Buy Date</label>
          <input
            type="date"
            name="buyDate"
            value={formData.buyDate}
            onChange={handleChange}
          />
        </div>
        <button onClick={handleSubmit}>Add</button>
        <button className="close-button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const initialBalance = 0;

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
          dividendPayments: pos.dividend_payments ? JSON.parse(pos.dividend_payments) : [],
          realizedPL: parseFloat(pos.realized_pl) || 0
        }));
        setInvestments(normalized);
      })
      .catch(err => console.error('Error fetching positions:', err));

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalRealizedPL = investments.reduce(
    (sum, inv) => sum + (inv.realizedPL || 0),
    0
  );

  function calculateCapitalGains(inv) {
    return (inv.currentPrice - inv.buyPrice) * inv.quantity;
  }

  function calculateTotalReturn(inv) {
    const capitalGains = calculateCapitalGains(inv);
    const cumulativeDividend = (inv.dividendPayments || []).reduce(
      (sum, dp) => sum + parseFloat(dp.amount || 0),
      0
    );
    return capitalGains + cumulativeDividend;
  }

  const totalUnrealizedPL = investments.reduce(
    (sum, inv) => sum + calculateCapitalGains(inv),
    0
  );

  const accountBalance = initialBalance + totalRealizedPL + totalUnrealizedPL;

  async function fetchLiveData(symbol) {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }
      const data = await response.json();
      const quote = data["Global Quote"];
      if (!quote) {
        throw new Error("No quote data found");
      }
      const currentPrice = parseFloat(quote["05. price"]);
      return {
        currentPrice,
        dividend: 0,
        name: symbol.toUpperCase()
      };
    } catch (error) {
      console.error("Error fetching live data:", error);
      return {
        currentPrice: 0,
        dividend: 0,
        name: symbol.toUpperCase()
      };
    }
  }

  async function onAddInvestment(formData) {
    if (!formData.ticker || !formData.quantity || !formData.buyPrice) return;

    const live = await fetchLiveData(formData.ticker);
    const localObj = {
      ticker: formData.ticker.toUpperCase(),
      buyPrice: parseFloat(formData.buyPrice),
      quantity: parseInt(formData.quantity, 10),
      buyDate: formData.buyDate || '',
      currentPrice: live.currentPrice,
      dividend: 0,
      name: live.name,
      dividendPayments: [],
      realizedPL: 0
    };
    const payloadForServer = {
      symbol: localObj.ticker,
      buy_price: localObj.buyPrice,
      quantity: localObj.quantity,
      current_price: localObj.currentPrice,
      name: localObj.name,
      dividend_yield: localObj.dividend,
      buy_date: localObj.buyDate,
      dividend_payments: JSON.stringify(localObj.dividendPayments),
      realized_pl: 0
    };
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch('/api/positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf,
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
          dividendPayments: createdPos.dividend_payments ? JSON.parse(createdPos.dividend_payments) : [],
          realizedPL: parseFloat(createdPos.realized_pl) || 0
        };
        setInvestments(prev => [...prev, normalized]);
      })
      .catch(err => console.error('Error adding investment:', err));
  }

  async function refreshPrices() {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const updatedPositions = await Promise.all(
      investments.map(async (inv) => {
        try {
          const liveData = await fetchLiveData(inv.ticker);
          await fetch(`/api/positions/${inv.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrf,
            },
            body: JSON.stringify({
              position: {
                current_price: liveData.currentPrice
              }
            }),
          });
          return { ...inv, currentPrice: liveData.currentPrice };
        } catch (error) {
          console.error('Error refreshing price for', inv.ticker, error);
          return inv;
        }
      })
    );
    setInvestments(updatedPositions);
  }

  function updateTrade(positionId, { newQuantity, newBuyPrice }) {
    const inv = investments.find(i => i.id === positionId);
    if (!inv) return;

    const oldQty = inv.quantity;
    const oldBuyPrice = inv.buyPrice;
    const currentPrice = inv.currentPrice;
    const totalQty = oldQty + newQuantity;
    const avgBuyPrice = ((oldQty * oldBuyPrice) + (newQuantity * currentPrice)) / totalQty;

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch(`/api/positions/${positionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf,
      },
      body: JSON.stringify({
        position: {
          quantity: totalQty,
          buy_price: avgBuyPrice
        }
      }),
    })
      .then(r => r.json())
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
          dividendPayments: updatedPos.dividend_payments ? JSON.parse(updatedPos.dividend_payments) : [],
          realizedPL: parseFloat(updatedPos.realized_pl) || 0
        };
        setInvestments(prev =>
          prev.map(i => (i.id === normalized.id ? normalized : i))
        );
      })
      .catch(err => console.error('Error updating trade:', err));
  }

  function sellTrade(positionId, { sellQuantity }) {
    const inv = investments.find(i => i.id === positionId);
    if (!inv) return;

    const profit = (inv.currentPrice - inv.buyPrice) * sellQuantity;
    const newQty = inv.quantity - sellQuantity;
    const newRealized = (inv.realizedPL || 0) + profit;

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch(`/api/positions/${positionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf,
      },
      body: JSON.stringify({
        position: {
          quantity: newQty,
          realized_pl: newRealized
        },
        sellQuantity: sellQuantity
      }),
    })
      .then(r => r.json())
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
          dividendPayments: updatedPos.dividend_payments ? JSON.parse(updatedPos.dividend_payments) : [],
          realizedPL: parseFloat(updatedPos.realized_pl) || 0
        };
        setInvestments(prev =>
          prev.map(i => (i.id === normalized.id ? normalized : i))
        );
      })
      .catch(err => console.error('Error selling shares:', err));
  }

  function deletePosition(positionId) {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch(`/api/positions/${positionId}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrf },
    })
      .then(() => {
        setInvestments(prev => prev.filter(i => i.id !== positionId));
      })
      .catch(err => console.error('Error deleting position:', err));
  }

  function addDividend(positionId, dividendInfo) {
    const inv = investments.find(i => i.id === positionId);
    if (!inv) return;

    const updatedDividendPayments = inv.dividendPayments
      ? [...inv.dividendPayments, dividendInfo]
      : [dividendInfo];

    const dividendAmount = parseFloat(dividendInfo.amount);
    const newRealizedPL = (inv.realizedPL || 0) + dividendAmount;

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch(`/api/positions/${positionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf
      },
      body: JSON.stringify({
        position: {
          dividend_payments: JSON.stringify(updatedDividendPayments),
          realized_pl: newRealizedPL
        }
      }),
    })
      .then(r => r.json())
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
          dividendPayments: updatedPos.dividend_payments ? JSON.parse(updatedPos.dividend_payments) : [],
          realizedPL: parseFloat(updatedPos.realized_pl) || 0
        };
        setInvestments(prev =>
          prev.map(i => (i.id === normalized.id ? normalized : i))
        );
      })
      .catch(err => console.error('Error updating dividend:', err));
  }

  function openDetailModal(inv, idx) {
    setSelectedInvestment({ ...inv, index: idx });
    setShowDetailModal(true);
  }

  function openEditModal(inv, idx) {
    setSelectedInvestment({ ...inv, index: idx });
    setShowEditModal(true);
  }

  return (
    <Layout>
      <h4 className="text-uppercase text-center portfolio-title my-4">portfolio</h4>
      <div className="refresh-container">
        <button className="refresh-button" onClick={refreshPrices}>Refresh Prices</button>
      </div>
      <div className="portfolio-container">
        {isMobile ? (
          <div className="mobile-portfolio-list">
            {investments.map((inv, idx) => (
              <div
                key={inv.id || idx}
                className="mobile-portfolio-item"
                onClick={() => openEditModal(inv, idx)}
              >
                <span className="ticker"><strong>{inv.ticker}</strong></span>
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
                  <th>Dividend</th>
                  <th>Total Return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, idx) => {
                  const capGains = ((inv.currentPrice - inv.buyPrice) * inv.quantity).toFixed(2);
                  const cumulativeDividend = (inv.dividendPayments || []).reduce(
                    (sum, d) => sum + parseFloat(d.amount || 0),
                    0
                  );
                  return (
                    <tr key={inv.id || idx}>
                      <td>
                        <strong>{inv.ticker}</strong><br />
                        {/* <span className="stock-subtext">{inv.name}</span> */}
                      </td>
                      <td>${inv.buyPrice.toFixed(2)}</td>
                      <td>{inv.quantity}</td>
                      <td>${inv.currentPrice}</td>
                      <td>${capGains}</td>
                      <td>${cumulativeDividend.toFixed(2)}</td>
                      <td>${calculateTotalReturn(inv).toFixed(2)}</td>
                      <td>
                        <button
                          className="sell-button"
                          onClick={() => openEditModal(inv, idx)}
                        >
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
              <p><strong>Realized P&L:</strong> ${totalRealizedPL.toFixed(2)}</p>
              <p><strong>Account Balance:</strong> ${accountBalance.toFixed(2)}</p>
            </div>
          </div>
        )}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            className="add-button"
            onClick={() => setShowAddModal(true)}
          >
            Add Investment
          </button>
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
        onSellTrade={sellTrade}
        onAddDividend={addDividend}
        onDelete={deletePosition}
      />
      <AddInvestmentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddInvestment={onAddInvestment}
      />
    </Layout>
  );
};

export default Portfolio;
