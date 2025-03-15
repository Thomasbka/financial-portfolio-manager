import React, { useState } from 'react';
import Layout from './layout';
import './analyser.scss';

function getColorForValue(value) {
  const red = Math.floor((1 - value) * 255);
  const green = Math.floor(value * 255);
  return `rgb(${red}, ${green}, 0)`;
}

function SentimentBar({ label, value }) {
  const percentage = (value * 100).toFixed(0);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <strong>{label}: {value}</strong>
      <div style={{ width: '200px', backgroundColor: '#eee', height: '10px', marginTop: '0.25rem' }}>
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: getColorForValue(value),
            height: '10px',
          }}
        />
      </div>
    </div>
  );
}

function flattenSentiment(result) {
  if (
    result &&
    result.sentiment_analysis &&
    typeof result.sentiment_analysis === 'object' &&
    result.sentiment_analysis.ticker === result.ticker &&
    result.sentiment_analysis.sentiment_analysis
  ) {
    return {
      ticker: result.ticker,
      sentiment_analysis: result.sentiment_analysis.sentiment_analysis,
    };
  }
  return result;
}

const Analyser = () => {
  const [symbol, setSymbol] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
  };

  const handleAnalyseClick = async () => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch(
        'https://financial-analysis-api-ad00a96ed0c3.herokuapp.com/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: symbol }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const flattenedData = flattenSentiment(data);
      setAnalysisResult(flattenedData);
    } catch (error) {
      console.error('API call failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [trackMessage, setTrackMessage] = useState('');

  const handleTrackClick = () => {
    if (!analysisResult) return;

    const entireAnalysisJSON = JSON.stringify(analysisResult);

    const payload = {
      tracker: {
        symbol: analysisResult.ticker,
        sentiment: entireAnalysisJSON,
        technical: "" 
      }
    };

    fetch('/api/trackers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save analysis');
        return res.json();
      })
      .then(data => {
        console.log('Saved analysis:', data);
        setTrackMessage('The symbol has been saved!');
      })
      .catch(err => console.error(err));
  };


  return (
    <Layout>
      <h4 className="text-uppercase text-center my-4">Analyser</h4>
      <div className="container analyser-container">
        <div className="row">
          <div>
            <h5 className="mb-3">Sentiment Analysis</h5>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Symbol/Ticker"
                value={symbol}
                onChange={handleSymbolChange}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary me-2"
              onClick={handleAnalyseClick}
              disabled={loading}
            >
              {loading ? 'Analysing...' : 'Analyse'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTrackClick}
            >
              Track
            </button>

            {error && (
              <div className="alert alert-danger mt-3">{error}</div>
            )}

            {analysisResult && analysisResult.sentiment_analysis && (
              <div className="analysis-result mt-3">
                <h5>Sentiment Analysis for {analysisResult.ticker}</h5>
                <div>
                  <strong>Market Sentiment:</strong> {analysisResult.sentiment_analysis.market_sentiment}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <h6>Sentiment Breakdown</h6>
                  <SentimentBar
                    label="Positive"
                    value={analysisResult.sentiment_analysis["Sentiment Breakdown"].positive || 0}
                  />
                  <SentimentBar
                    label="Neutral"
                    value={analysisResult.sentiment_analysis["Sentiment Breakdown"].neutral || 0}
                  />
                  <SentimentBar
                    label="Negative"
                    value={analysisResult.sentiment_analysis["Sentiment Breakdown"].negative || 0}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <h6>Key Reasons</h6>
                  <p>{analysisResult.sentiment_analysis["Key Reasons"]}</p>
                </div>
                <div>
                  <h6>Confidence Score</h6>
                  <SentimentBar
                    label="Positive"
                    value={analysisResult.sentiment_analysis["Confidence Score"].positive || 0}
                  />
                  <SentimentBar
                    label="Neutral"
                    value={analysisResult.sentiment_analysis["Confidence Score"].neutral || 0}
                  />
                  <SentimentBar
                    label="Negative"
                    value={analysisResult.sentiment_analysis["Confidence Score"].negative || 0}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analyser;
