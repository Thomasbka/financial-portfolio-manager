import React, { useState, useEffect } from 'react';
import './layout.scss';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setIsNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-wrapper">
      <nav className="navbar navbar-expand-lg navbar-light px-2 bg-light bg-gradient border-bottom">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <a className="navbar-brand me-auto" href="#">
            Financial Portfolio Manager
          </a>
          {isMobile && (
            <div className="d-flex icon-nav">
              <a className="nav-link p-1 mx-1" href="/" title="Dashboard">
                <i className="bi bi-house-door"></i>
              </a>
              <a className="nav-link p-1 mx-1" href="/portfolio" title="Portfolio">
                <i className="bi bi-briefcase"></i>
              </a>
              <a className="nav-link p-1 mx-1" href="/analyser" title="Analyser">
                <i className="bi bi-graph-up"></i>
              </a>
              <a className="nav-link p-1 mx-1" href="/tracker" title="Tracker">
                <i className="bi bi-clock-history"></i>
              </a>
              <a className="nav-link p-1 mx-1" href="/history" title="History">
                <i className="bi bi-journal"></i>
              </a>
            </div>
          )}
          <button
            className="navbar-toggler ms-2"
            type="button"
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-controls="topNavbar"
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="topNavbar">
            <ul className="navbar-nav ms-auto text-end">
              <li className="nav-item">
                <span className="nav-link user-info">Username</span>
              </li>
              <li className="nav-item">
                <a className="nav-link user-info" href="/logout">
                  Logout
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link user-info" href="/settings">
                  <i className="bi bi-gear"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="main-area">
        {!isMobile && (
          <aside className="sidebar">
            <nav className="nav flex-column p-2">
              <a className="nav-link text-white" href="/">
                Dashboard
              </a>
              <a className="nav-link text-white" href="/portfolio">
                Portfolio
              </a>
              <a className="nav-link text-white" href="/analyser">
                Analyser
              </a>
              <a className="nav-link text-white" href="/tracker">
                Tracker
              </a>
              <a className="nav-link text-white" href="/history">
                History
              </a>
            </nav>
          </aside>
        )}
        <main className="content-area p-3">{children}</main>
      </div>
      <footer className="footer bg-dark text-white text-center pt-2">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Financial Portfolio Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
