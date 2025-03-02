import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router} from "react-router-dom";
import Layout from './layout';

const Tracker = () => (
  <Router>
    <Layout>
      <h1>Tracker page</h1>
    </Layout>
  </Router>
)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Tracker />,
    document.body.appendChild(document.createElement('div')),
  )
})