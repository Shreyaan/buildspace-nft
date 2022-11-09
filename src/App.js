import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { ethers } from "ethers";
import React, { useEffect, useState, useRef } from "react";
import myEpicNft from "./utils/MyEpicNFT.json";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;

// I moved the contract address to the top for easy access.
const CONTRACT_ADDRESS = "0xa7b3779707FFbAd59b0ea5daecE11474404bd6E9";

function OpenSeaLink(props) {
  let link = props.openSeaLinkState
  return (
    <p >
      Hey there! We've minted your NFT and sent it to your wallet. It may be
      blank right now. It can take a max of 10 min to show up on OpenSea.  {' '}
      <a target='_blank' className="defalut" href={`${props.openSeaLinkState}`} >
       Here's the link
      </a>
    </p>
  );
}

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [openSeaLinkState, setOpenSeaLink] = useState(false);
  const [ispromiseDone, setIspromiseDone] = useState(false)
  // const openSeaLink = useRef('')

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");

      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);
      const goerliChainId = "0x5";
      if (chainId !== goerliChainId) {
       
        toast.error("You are not connected to the Goerli Test Network!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setOpenSeaLink(
            `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          // openSeaLink.current=`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        });

        console.log("Setup event listener!");
        console.log(connectedContract);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
          setIspromiseDone(false)
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        let res= await toast.promise(nftTxn.wait(), {
          pending: "Mining your NFT ",
          success: "Mined successfully ✅",
          error: "something went wrong 😭",
        });
        console.log(res);
        setIspromiseDone(true)
        console.log(nftTxn);
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <div>
      <button
        onClick={askContractToMintNft}
        className="cta-button connect-wallet-button"
      >
        Mint NFT
      </button>
      <button
      onClick={()=>window.location.href="https://testnets.opensea.io/collection/squarenft-apjfb2m9ta"}
        href="https://testnets.opensea.io/collection/squarenft-ybvedmcx7s"
        className="cta-button connect-wallet-button"
      >
        Collection link
      </button>
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <ToastContainer />
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
        </div>

      
        <div className="sub-text maxw">
          {ispromiseDone &&
              <OpenSeaLink openSeaLinkState={openSeaLinkState}/>}
        </div>
        <div className="footer-container">
         
          {/* <a
            className="footer-text"
            href='https://testnets.opensea.io/collection/squarenft-ybvedmcx7s'
            target="_blank"
            rel="noreferrer"
          >{`openseas NFT Collection link`}</a> */}
        </div>
      </div>
    </div>
  );
};

export default App;
