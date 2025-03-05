import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Layout from './layout';
import './dashboard.scss';

  // These states just simulate summary data fetched from each tab's backend/API.
  // Once the backend has been set up I will be able to fetch the dynamic data instead.
const Dashboard = () => {
  const [trackerSummary, setTrackerSummary] = useState({ recentChanges: 'Loading...' });
  const [historySummary, setHistorySummary] = useState({ performance: 'Loading...' });
  const [portfolioSummary, setPortfolioSummary] = useState({ 
    holdings: 'Loading...', 
    totalValue: 0 
  });

  useEffect(() => {
    setTimeout(() => {
      setTrackerSummary({ recentChanges: 'Your portfolio increased by 2% today.' });
      setHistorySummary({ performance: 'Overall trade profit: $500.' });
      setPortfolioSummary({ holdings: 'You hold 5 stocks.', totalValue: 15000 });
    }, 1000);
  }, []);

  return (
    <Layout>
      <h2 className="text-uppercase text-center">Dashboard</h2>
      <div className="dashboard-container">
        <div className="dashboard-section tracker">
          <h3>Tracker</h3>
          <p>{trackerSummary.recentChanges}</p>
        </div>
        <div className="dashboard-section history">
          <h3>History</h3>
          <p>{historySummary.performance}</p>
        </div>
      </div>
      <div className="dashboard-section portfolio">
        <h3>Portfolio</h3>
        <p>{portfolioSummary.holdings}</p>
        <p><strong>Total Value:</strong> ${portfolioSummary.totalValue}</p>
      </div>
    </Layout>
  );
};


export default Dashboard;
