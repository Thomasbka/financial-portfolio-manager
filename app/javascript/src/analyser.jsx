import React, { useState } from 'react';
import Layout from './layout';
import './analyser.scss';

const Analyser = () => {
  const [symbol, setSymbol] = useState('');

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
  };

  const handleAnalyseClick = () => {
    console.log('Analyzing symbol:', symbol);
  };

  const handleTrackClick = () => {
    console.log('Tracking symbol:', symbol);
  };

  return (
    <Layout>
      <h2 className="text-uppercase text-center mb-4">Analyser</h2>

      <div className="container analyser-container">
        <div className="row">
          <div className="col-md-6">
            <h4 className="mb-3">Sentiment Analysis</h4>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                id="ticker"
                name="ticker"
                placeholder="Enter Symbol/Ticker"
                value={symbol}
                onChange={handleSymbolChange}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary me-2"
              onClick={handleAnalyseClick}
            >
              Analyse
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTrackClick}
            >
              Track
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analyser;