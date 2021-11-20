import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React from "react";

// Constants
const TWITTER_HANDLE = 'juancito.eth';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://opensea.io/collection/ethernal-initials';
const TOTAL_MINT_COUNT = 776;

const App = () => {
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Ethernal Initials</p>
          <p className="sub-text">
          An initials pair from AA to ZZ, and 00 to 99 that will live for eternity in this realm.
          </p>
          {renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with ❤️ by ${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
