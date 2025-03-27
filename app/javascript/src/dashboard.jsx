import React, { useState, useEffect } from 'react';
import Layout from './layout';
import './dashboard.scss';

function getColorForValue(value) {
  const red = Math.floor((1 - value) * 255);
  const green = Math.floor(value * 255);
  return `rgb(${red}, ${green}, 0)`;
}

function SentimentBar({ label, value }) {
  const percentage = (value * 100).toFixed(0);
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <strong>{label}: {value}</strong>
      <div style={{ width: '200px', backgroundColor: '#eee', height: '10px', marginTop: '0.25rem' }}>
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: getColorForValue(value),
            height: '10px',
          }}
        />
      </div>
    </div>
  );
}

function flattenSentiment(result) {
  if (result && result.sentiment_analysis) {
    if (result.sentiment_analysis.market_sentiment !== undefined) {
      return result;
    }
    if (result.sentiment_analysis.sentiment_analysis) {
      return {
        ticker: result.ticker,
        sentiment_analysis: result.sentiment_analysis.sentiment_analysis,
      };
    }
  }
  return result;
}

const HistoryModal = ({ trade, onClose }) => {
  if (!trade) return null;
  const profitLoss = (trade.sellPrice - trade.buyPrice) * trade.quantity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h5>{trade.ticker} Trade Details</h5>
        <p><strong>Stock:</strong> {trade.ticker}</p>
        <p><strong>Name:</strong> {trade.name}</p>
        <p><strong>Quantity:</strong> {trade.quantity}</p>
        <p>
          <strong>Buy Price:</strong> $
          {parseFloat(trade.buyPrice).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p>
          <strong>Sell Price:</strong> $
          {parseFloat(trade.sellPrice).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p><strong>Date:</strong> {trade.date}</p>
        <p>
          <strong>Profit / Loss:</strong> $
          {profitLoss.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <button className="close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [trackerSummary, setTrackerSummary] = useState({
    label: 'No tracker data',
    sentimentBreakdown: null,
    confidenceScore: null
  });

  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1081);
  const [positions, setPositions] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState({ 
    holdings: 'Loading...', 
    totalValue: 0 
  });
  const [profitSection, setProfitSection] = useState({
    totalRealized: 0,
    totalUnrealized: 0,
    totalOverall: 0
  });

  const [historySummary, setHistorySummary] = useState({ performance: 'Loading...' });

  useEffect(() => {
    Promise.all([
      fetch('/api/trackers').then(res => res.json()),
      fetch('/api/positions').then(res => res.json()),
    ])
    .then(([trackerData, positionData]) => {
      let label = 'No tracker data';
      let sentimentBreakdown = null;
      let confidenceScore = null;

      if (trackerData.length > 0) {
        try {
          const raw = trackerData[0].sentiment;
          if (raw && raw.trim().startsWith('{')) {
            const parsed = JSON.parse(raw);
            const flattened = flattenSentiment(parsed);
            if (flattened && flattened.sentiment_analysis) {
              label = `${flattened.ticker} (${flattened.sentiment_analysis.market_sentiment || 'Unknown'})`;

              const analysisObj = flattened.sentiment_analysis;
              sentimentBreakdown = analysisObj["Sentiment Breakdown"] || null;
              confidenceScore    = analysisObj["Confidence Score"] || null;
            }
          } else {
            console.error("Tracker sentiment is not valid JSON:", trackerData[0].sentiment);
          }
        } catch (err) {
          console.error('Error parsing tracker sentiment in Dashboard:', err);
        }
      }

      setTrackerSummary({ label, sentimentBreakdown, confidenceScore });

      setPositions(positionData);

      let totalVal = 0;
      let totalRealized = 0;
      let totalUnrealized = 0;

      positionData.forEach(pos => {
        const buyNum = parseFloat(pos.buy_price) || 0;
        const currNum = parseFloat(pos.current_price) || 0;
        const realizedPL = parseFloat(pos.realized_pl) || 0;
        const capGains = (currNum - buyNum) * pos.quantity;

        totalVal += (currNum * pos.quantity);
        totalRealized += realizedPL;
        totalUnrealized += capGains;
      });

      setPortfolioSummary({
        holdings: positionData.length > 0
          ? `You hold ${positionData.length} stocks.`
          : 'No positions',
        totalValue: totalVal.toFixed(2)
      });

      setProfitSection({
        totalRealized: totalRealized.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        totalUnrealized: totalUnrealized.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        totalOverall: (totalRealized + totalUnrealized).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      });

      setHistorySummary({ performance: 'Some performance data...' });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

    fetch('/api/trades')
      .then(res => res.json())
      .then(data => {
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTrades(data);
      })
      .catch(err => console.error('Error fetching trade history:', err));

    const handleResize = () => setIsMobile(window.innerWidth < 1081);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateTradePL = (trade) => {
    return (trade.sellPrice - trade.buyPrice) * trade.quantity;
  };

  const { label, sentimentBreakdown, confidenceScore } = trackerSummary;

  return (
    <Layout>
      <h4 className="text-uppercase text-center my-4">Dashboard</h4>
      <div className="dashboard-container">
        <div className="dashboard-section tracker">
          <h5>Tracker</h5>
          <p>{label}</p>
          {sentimentBreakdown && confidenceScore && (
            <div className="tracker-sentiment-section">
              <div className="tracker-sentiment-col">
                <h6>Sentiment Breakdown</h6>
                <SentimentBar
                  label="Positive"
                  value={sentimentBreakdown.positive || 0}
                />
                <SentimentBar
                  label="Neutral"
                  value={sentimentBreakdown.neutral || 0}
                />
                <SentimentBar
                  label="Negative"
                  value={sentimentBreakdown.negative || 0}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h6>Confidence Score</h6>
                <SentimentBar
                  label="Positive"
                  value={confidenceScore.positive || 0}
                />
                <SentimentBar
                  label="Neutral"
                  value={confidenceScore.neutral || 0}
                />
                <SentimentBar
                  label="Negative"
                  value={confidenceScore.negative || 0}
                />
              </div>
            </div>
          )}
        </div>
        <div className="dashboard-section history">
          <h5>Trading History</h5>
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
                    ${calculateTradePL(trade).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
                      <td 
                        onClick={() => setSelectedTrade(trade)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <strong>{trade.ticker}</strong>
                        <br /><span className="stock-subtext">{trade.name}</span>
                      </td>
                      <td>{trade.quantity}</td>
                      <td>${trade.buyPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}</td>
                      <td>${trade.sellPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}</td>
                      <td>{trade.date}</td>
                      <td>${calculateTradePL(trade).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-section portfolio">
        <h5>Portfolio</h5>
        {positions.length > 0 ? (
          isMobile ? (
              <div className="mobile-portfolio-list">
                {positions.map((pos, idx) => {
                  const buyNum = parseFloat(pos.buy_price) || 0;
                  const currNum = parseFloat(pos.current_price) || 0;
                  const capGains = (currNum - buyNum) * pos.quantity;
                  let dividendsArr = [];
                  if (pos.dividend_payments) {
                    try {
                      dividendsArr = JSON.parse(pos.dividend_payments);
                    } catch (err) {
                      console.error('Error parsing dividend_payments:', err);
                    }
                  }
                  const cumulativeDividend = dividendsArr.reduce(
                    (sum, dp) => sum + parseFloat(dp.amount || 0),
                    0
                  );
                  const totalReturn = capGains + cumulativeDividend;

                  return (
                    <div
                      key={pos.id || idx}
                      className="mobile-portfolio-item"
                    >
                      <span className="ticker"><strong>{pos.symbol}</strong></span>
                      <span className="total-return">${totalReturn.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="portfolio-table-container">
                <table className="portfolio-table">
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Buy Price</th>
                      <th>Quantity</th>
                      <th>Current Price</th>
                      <th>Capital Gains</th>
                      <th>Dividends</th>
                      <th>Total Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(pos => {
                      const buyNum = parseFloat(pos.buy_price) || 0;
                      const currNum = parseFloat(pos.current_price) || 0;
                      const capGains = (currNum - buyNum) * pos.quantity;
                      let dividendsArr = [];
                      if (pos.dividend_payments) {
                        try {
                          dividendsArr = JSON.parse(pos.dividend_payments);
                        } catch (err) {
                          console.error('Error parsing dividend_payments:', err);
                        }
                      }
                      const cumulativeDividend = dividendsArr.reduce(
                        (sum, dp) => sum + parseFloat(dp.amount || 0),
                        0
                      );
                      const totalReturn = capGains + cumulativeDividend;

                      return (
                        <tr key={pos.id}>
                          <td>{pos.symbol}</td>
                          <td>${buyNum.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}</td>
                          <td>{pos.quantity}</td>
                          <td>${currNum.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}</td>
                          <td>${capGains.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}</td>
                          <td>${cumulativeDividend.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}</td>
                          <td>${totalReturn.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <p>{portfolioSummary.holdings}</p>
          )} 


        <div className="profit-section" style={{ marginTop: '1rem' }}>
          <p><strong>Unrealized P/L:</strong> ${profitSection.totalUnrealized}</p>
          <p><strong>Realized P/L:</strong> ${profitSection.totalRealized}</p>
          <p><strong>Total Overall P/L:</strong> ${profitSection.totalOverall}</p>
        </div>
      </div>

      {selectedTrade && (
        <HistoryModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}
    </Layout>
  );
};

export default Dashboard;
