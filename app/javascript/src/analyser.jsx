import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router} from "react-router-dom";
import Layout from './layout';

const Analyser = () => (
  <Router>
    <Layout>
      <h2 className="text-uppercase text-center">Analyser</h2>
    </Layout>
  </Router>
)

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Analyser />,
    document.body.appendChild(document.createElement('div')),
  )
})