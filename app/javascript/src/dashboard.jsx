import React, { useState, useEffect } from 'react';
import Layout from './layout';
import Portfolio from './portfolio';
import './dashboard.scss';

const Dashboard = () => {
  const [trackerSummary, setTrackerSummary] = useState({ recentChanges: 'Loading...' });
  const [historySummary, setHistorySummary] = useState({ performance: 'Loading...' });
  const [portfolioSummary, setPortfolioSummary] = useState({ 
    holdings: 'Loading...', 
    totalValue: 0 
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/trackers').then(res => res.json()),
      fetch('/api/positions').then(res => res.json()),
    ])
      .then(([trackerData, positionData]) => {
        setTrackerSummary({
          recentChanges: trackerData.length > 0
            ? trackerData[0].sentiment
            : 'No tracker data'
        });
        setPortfolioSummary({
          holdings: positionData.length > 0
            ? `You hold ${positionData.length} stocks.`
            : 'No positions',
          totalValue: positionData.reduce((total, pos) => total + pos.current_price * pos.quantity, 0)
        });
        setHistorySummary({ performance: 'Calculated performance data here.' });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);
  

  return (
    <Layout>
      <h4 className="text-uppercase text-center my-4">Dashboard</h4>
      <div className="dashboard-container">
        <div className="dashboard-section analyser">
          <h5>Analyser</h5>
          <p>{trackerSummary.recentChanges}</p>
        </div>
        <div className="dashboard-section history">
          <h5>History</h5>
          <p>{historySummary.performance}</p>
        </div>
      </div>
      <div className="dashboard-section portfolio">
        <h5>Portfolio</h5>
        <p>{portfolioSummary.holdings}</p>
        <p><strong>Total Value:</strong> ${portfolioSummary.totalValue}</p>
      </div>
    </Layout>
  );
};


export default Dashboard;
