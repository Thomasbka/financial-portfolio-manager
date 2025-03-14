import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link, useParams } from 'react-router-dom';
import Layout from './layout';
import './tracker.scss';

const SymbolAnalysis = () => {
  const { symbol } = useParams();

  return (
    <div className="symbol-analysis">
      <h3>Daily Analysis for {symbol}</h3>
      <p>Placeholder for analysis data for {symbol}.</p>
      <button className="sell-button">SELL</button>
    </div>
  );
};

const Tracker = () => {
  const [trackedSymbols, setTrackedSymbols] = useState(['NVDA', 'AAPL', 'GOOGL']);

  return (
    <Layout>
      <h2 className="text-uppercase text-center">Tracker</h2>
      <div className="tracker-nav">
        {trackedSymbols.map((sym, index) => (
          <Link key={index} to={`/tracker/${sym}`} className="tracker-tab" title={`View ${sym} analysis`}>
            {sym}
          </Link>
        ))}
      </div>
      <Switch>
        <Route path="/tracker/:symbol" component={SymbolAnalysis} />
        <Route path="/tracker">
          <div className="tracker-default">
            <p>Select a tracked symbol to view its daily analysis.</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
};


export default Tracker;
