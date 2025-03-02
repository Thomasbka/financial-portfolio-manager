import React from 'react';

const Layout = ({ children }) => {
  return (
    <React.Fragment>
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Financial Portfolio Manager</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNavbar" aria-controls="topNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="topNavbar">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <span className="nav-link">Username</span>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/logout">Logout</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/settings">
                  <i className="bi bi-gear"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container-fluid">
        <div className="row" style={{ minHeight: 'calc(100vh - 56px)' }}>
          {/* Side Navbar */}
          <div className="col-md-3 bg-light border-end">
            <nav className="nav flex-column p-3">
              <a className="nav-link" href="/">Dashboard</a>
              <a className="nav-link" href="/portfolio">Portfolio</a>
              <a className="nav-link" href="/analyser">Analyser</a>
              <a className="nav-link" href="/tracker">Tracker</a>
              <a className="nav-link" href="/history">History</a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-md-9 p-3">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-3 bg-light">
        <div className="container text-center">
          <span className="text-secondary">
            Built by <a href="https://tbka-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer">Thomas Andersen</a>
          </span>
        </div>
      </footer>
    </React.Fragment>
  );
}

export default Layout;
