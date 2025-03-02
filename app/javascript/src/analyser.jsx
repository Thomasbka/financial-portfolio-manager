import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router} from "react-router-dom";
import Layout from './layout';

const Analyser = () => (
  <Router>
    <Layout>
      <h1>Analyser page</h1>
    </Layout>
  </Router>
)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Analyser />,
    document.body.appendChild(document.createElement('div')),
  )
})