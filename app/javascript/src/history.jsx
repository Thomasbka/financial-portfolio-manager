import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router} from "react-router-dom";
import Layout from './layout';

const History = () => (
  <Router>
    <Layout>
      <h1>History page</h1>
    </Layout>
  </Router>
)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <History />,
    document.body.appendChild(document.createElement('div')),
  )
})