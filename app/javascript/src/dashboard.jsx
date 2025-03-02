import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './layout';
import './dashboard.scss';

const Dashboard = () => (
  <Layout>
    <h1 className="text-uppercase">Dashboard</h1>
  </Layout>
)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Dashboard />,
    document.body.appendChild(document.createElement('div'))
  );
});

