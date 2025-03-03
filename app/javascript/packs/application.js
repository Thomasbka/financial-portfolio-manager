import Rails from "@rails/ujs"
import * as ActiveStorage from "@rails/activestorage"
import "channels"
Rails.start()
ActiveStorage.start()

import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Dashboard from "@src/dashboard.jsx";
import Analyser from "@src/analyser.jsx";
import History from "@src/history.jsx";
import Portfolio from "@src/portfolio.jsx";
import Tracker from "@src/tracker.jsx";

import "bootstrap"; 
import "bootstrap/dist/css/bootstrap.css";
import "../src/dashboard.scss";
import "../src/analyser.scss";
import "../src/history.scss";
import "../src/portfolio.scss";
import "../src/tracker.scss";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/analyser" component={Analyser} />
        <Route path="/history" component={History} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/tracker" component={Tracker} />
      </Switch>
    </Router>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
