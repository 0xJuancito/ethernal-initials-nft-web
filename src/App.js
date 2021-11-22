import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import React, { useEffect, useState, useRef } from "react";
import EthernalInitials from './utils/EthernalInitials.json';

// Constants
const TWITTER_HANDLE = 'juancito.eth';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://opensea.io/collection/ethernal-initials';
// const TOTAL_MINT_COUNT = 776;

// Test
// const CONTRACT_ADDRESS = "0x2773cFf16869794A1de0E6BD6B9afB88A9b22F1D";
// const POLYGON_SCAN_LINK = "https://mumbai.polygonscan.com/tx"
// const OPENSEA_ITEM_LINK = "https://testnets.opensea.io/assets/mumbai"
// const CHAIN_ID = 80001

// Prod
const CONTRACT_ADDRESS = "0xc40056f690fc45B2f542441194F8bFb8275afFbF";
const POLYGON_SCAN_LINK = "https://polygonscan.com/tx"
const OPENSEA_ITEM_LINK = "https://opensea.io/assets/matic"
const CHAIN_ID = 137

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const inputRef = useRef();
  const buttonRef = useRef();
  const imgRef = useRef();
  const pRef = useRef();

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, EthernalInitials.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewInitialsNFTMinted", async (from, tokenId) => {
          console.log(from, tokenId.toNumber())

          const tokenURI = await connectedContract.tokenURI(tokenId.toNumber())
          const tokenURIBase64 = tokenURI.split(',')[1]
          const parsedTokenURI = JSON.parse(Buffer.from(tokenURIBase64, 'base64').toString())
          console.log(parsedTokenURI.image)
          imgRef.current.src = parsedTokenURI.image
          // alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: ${OPENSEA_ITEM_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const validateInitials = (initials) => {
    const errorMessage = 'Please select an initials pair from AA-ZZ or 00-99.'
    const parsedInitials = initials.toUpperCase()
    
    if (parsedInitials.length !== 2) {
      alert(errorMessage)
      return false
    }

    // 00-99
    const isFirstCharNumber = parsedInitials.codePointAt(0) >= 48 && parsedInitials.codePointAt(0) <= 57
    const isSecondCharNumber = parsedInitials.codePointAt(1) >= 48 && parsedInitials.codePointAt(1) <= 57
    if (isFirstCharNumber && isSecondCharNumber) {
      return true
    }

    // AA-ZZ
    const isFirstCharLetter = parsedInitials.codePointAt(0) >= 65 && parsedInitials.codePointAt(0) <= 90
    const isSecondCharLetter = parsedInitials.codePointAt(1) >= 65 && parsedInitials.codePointAt(1) <= 90
    if (isFirstCharLetter && isSecondCharLetter) {
      return true
    }

    alert(errorMessage)
    return false
  }

  const getTokenIdFromInitials = (initials) => {
    const parsedInitials = initials.toUpperCase()
    const firstCharCode = parsedInitials.codePointAt(0)
    const secondCharCode = parsedInitials.codePointAt(1)

    // 00-99
    if (firstCharCode <= 57) {
      return (firstCharCode - 48) * 10 + (secondCharCode - 48)
    }
    // AA-ZZ
    return 100 + (firstCharCode - 65) * 26 + (secondCharCode - 65)
  }

  const askContractToMintNft = async () => {
    buttonRef.current.disabled = true

    const initials = inputRef.current.value
    const isValid = validateInitials(initials)

    if (!isValid) {
      buttonRef.current.disabled = false
      buttonRef.current.innerText = 'Mint NFT'
      return
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        const network = ethers.providers.getNetwork(
          parseInt(ethereum.networkVersion, 10)
        );
        if (network.chainId !== CHAIN_ID) {
          alert('Please switch to the network to Polygon/Matic')
          buttonRef.current.disabled = false
          buttonRef.current.innerText = 'Mint NFT'
          return
        }

        buttonRef.current.innerText = 'Minting. Confirm transaction in MetaMask...'
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, EthernalInitials.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        const tokenId = getTokenIdFromInitials(initials)
        let nftTxn = await connectedContract.mintNFT(tokenId);

        console.log("Minting...please wait.")
        buttonRef.current.innerText = "Minting. Don't refresh the browser. Please wait..."
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(`Mined, see transaction: ${POLYGON_SCAN_LINK}/${nftTxn.hash}`);
        pRef.current.innerHTML = `We've minted your NFT and sent it to your wallet. It can take some minutes to show up on <a className="cta-a" target="_blank" href="${OPENSEA_ITEM_LINK}/${CONTRACT_ADDRESS}/${tokenId}">OpenSea</a>. Meanwhile, you can take a look at the rest of the <a target="_blank" href="${OPENSEA_LINK}">collection</a>, or check the transaction on <a className="cta-a" target="_blank" href="${POLYGON_SCAN_LINK}/${nftTxn.hash}">PolygonScan</a>. `
        buttonRef.current.innerText = 'Your NFT has been Minted!'
        return
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      if (error?.data?.code === 3) {
        alert('This token has already been minted. Please try with another one')
      } else {
        alert('There was an error and the NFT could not be minted')
      }
      console.log(error)
    }
    buttonRef.current.disabled = false
    buttonRef.current.innerText = 'Mint NFT'
  }


  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;
  
      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }
  
      const accounts = await ethereum.request({ method: 'eth_accounts' });
  
      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
          
          // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setupEventListener()
      } else {
          console.log("No authorized account found")
      }
    }
    checkIfWalletIsConnected();
  }, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to MetaMask
    </button>
  );

  const renderMintUI = () => (
    <div>
      <div className="cta-input-container">
        <label className="cta-label" htmlFor="initials">Choose Initials:</label>
        <input className="cta-input" type="text" id="initials" name="initials" maxLength="2" ref={inputRef} />
      </div>
      <button onClick={askContractToMintNft} className="cta-button connect-wallet-button" ref={buttonRef}>
        Mint NFT
      </button>
      <p className="cta-p" ref={pRef}></p>
      <img className="cta-img" ref={imgRef} alt="" />
    </div>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Ethernal Initials</p>
          <p className="sub-text">
          An initials pair from AA to ZZ, and 00 to 99 that will live for eternity in this realm.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
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
