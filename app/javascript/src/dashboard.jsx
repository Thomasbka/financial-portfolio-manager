import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './layout';
import './dashboard.scss';

const Dashboard = () => (
  <Layout>
    <h2 className="text-uppercase text-center">Dashboard</h2>
    <div className="dashboard-container">
      <div className="dashboard-section tracker">
        <h3>Tracker</h3>
        <p>Recent portfolio changes...</p>
      </div>
      <div className="dashboard-section history">
        <h3>History</h3>
        <p>Past performance...</p>
      </div>
    </div>
    <div className="dashboard-section portfolio">
        <h3>Portfolio</h3>
        <p>Summary of your holdings...</p>
      </div>
  </Layout>
);

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Dashboard />,
    document.body.appendChild(document.createElement('div'))
  );
});
