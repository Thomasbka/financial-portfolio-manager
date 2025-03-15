import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useParams, useHistory } from 'react-router-dom';
import Layout from './layout';
import './tracker.scss';

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
  if (result && result.sentiment_analysis) {
    if (result.sentiment_analysis.market_sentiment !== undefined) {
      return result;
    }
    if (result.sentiment_analysis.sentiment_analysis) {
      return {
        ticker: result.ticker,
        sentiment_analysis: result.sentiment_analysis.sentiment_analysis,
      };
    }
  }
  return result;
}

const SymbolAnalysis = ({ trackers, onUpdate }) => {
  const { symbol } = useParams();
  const history = useHistory();
  
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const found = trackers.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
    setTracker(found);
  }, [symbol, trackers]);

  if (!tracker) {
    return <p>No analysis found for {symbol}.</p>;
  }

  let fullAnalysis = null;
  try {
    if (tracker.sentiment && tracker.sentiment.trim().startsWith('{')) {
      fullAnalysis = JSON.parse(tracker.sentiment);
      fullAnalysis = flattenSentiment(fullAnalysis);
    } else {
      console.error("Tracker sentiment is not valid JSON:", tracker.sentiment);
    }
  } catch (err) {
    console.error('Error parsing analysis JSON:', err);
  }
  
  if (!fullAnalysis || !fullAnalysis.sentiment_analysis) {
    return <p>No detailed analysis stored for {symbol}.</p>;
  }  

  const analysisObj = fullAnalysis.sentiment_analysis;

  const handleUpdateAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://financial-analysis-api-ad00a96ed0c3.herokuapp.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: symbol }),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      console.log('API Response:', data);

      const newAnalysisJSON = JSON.stringify(data);

      const patchResp = await fetch(`/api/trackers/${tracker.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({
          tracker: {
            symbol: tracker.symbol,
            sentiment: newAnalysisJSON,
            technical: tracker.technical || ""
          }
        })
      });
      if (!patchResp.ok) throw new Error('Failed to update analysis');

      const updatedTracker = await patchResp.json();
      setTracker(updatedTracker);
      onUpdate(updatedTracker);
    } catch (err) {
      console.error('Error updating analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the analysis for ${symbol}?`)) {
      fetch(`/api/trackers/${tracker.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete tracker');
          return res.text();
        })
        .then(() => {
          onUpdate({ deleteId: tracker.id });
          history.push('/tracker');
        })
        .catch(err => console.error('Error deleting tracker:', err));
    }
  };

  return (
    <div>
      <h5>Daily Analysis for {symbol}</h5>
      {loading && <p>Updating analysis...</p>}
      {error && <p className="error">{error}</p>}

      <div>
        <strong>Market Sentiment:</strong> {analysisObj.market_sentiment}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h6>Sentiment Breakdown</h6>
        <SentimentBar
          label="Positive"
          value={analysisObj["Sentiment Breakdown"]?.positive || 0}
        />
        <SentimentBar
          label="Neutral"
          value={analysisObj["Sentiment Breakdown"]?.neutral || 0}
        />
        <SentimentBar
          label="Negative"
          value={analysisObj["Sentiment Breakdown"]?.negative || 0}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h6>Key Reasons</h6>
        <p>{analysisObj["Key Reasons"]}</p>
      </div>
      <div>
        <h6>Confidence Score</h6>
        <SentimentBar
          label="Positive"
          value={analysisObj["Confidence Score"]?.positive || 0}
        />
        <SentimentBar
          label="Neutral"
          value={analysisObj["Confidence Score"]?.neutral || 0}
        />
        <SentimentBar
          label="Negative"
          value={analysisObj["Confidence Score"]?.negative || 0}
        />
      </div>

      <button className="btn btn-warning me-2 mt-3" onClick={handleUpdateAnalysis}>
        Update Analysis
      </button>
      <button className="btn btn-danger mt-3" onClick={handleDelete}>
        Delete Analysis
      </button>
    </div>
  );
};

const Tracker = () => {
  const [trackers, setTrackers] = useState([]);

  useEffect(() => {
    fetch('/api/trackers')
      .then(res => res.json())
      .then(data => {
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTrackers(data);
      })
      .catch(err => console.error('Error fetching trackers:', err));
  }, []);

  const handleTrackerUpdate = (updated) => {
    if (updated.deleteId) {
      setTrackers(prev => prev.filter(t => t.id !== updated.deleteId));
    } else {
      setTrackers(prev =>
        prev.map(t => (t.id === updated.id ? updated : t))
      );
    }
  };

  return (
    <Layout>
      <h4 className="text-uppercase text-center my-4">Saved Analysis</h4>
      <div className="tracker-nav">
        {trackers.map(t => {
          let label = '(No Data)';
          try {
            const parsed = flattenSentiment(JSON.parse(t.sentiment));
            const analysisObj = parsed.sentiment_analysis;
            label = `(${analysisObj?.market_sentiment || 'Unknown'})`;
          } catch (err) {
            console.error('Error parsing nav JSON:', err);
          }
          return (
            <Link key={t.id} to={`/tracker/${t.symbol}`} className="tracker-tab">
              {t.symbol} {label}
            </Link>
          );
        })}
      </div>
      <Switch>
        <Route path="/tracker/:symbol">
          <SymbolAnalysis trackers={trackers} onUpdate={handleTrackerUpdate} />
        </Route>
        <Route path="/tracker">
          <div className="tracker-default">
            <p>Select a symbol to view its saved analysis.</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
};

const AppRouter = () => (
  <Router>
    <Tracker />
  </Router>
);

export default AppRouter;
