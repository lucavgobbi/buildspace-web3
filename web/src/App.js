import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const useEthereum = () => {
  const { ethereum } = window;
  if (ethereum) {
    return ethereum;
  }
  console.error("Metamask not found!");
  return null;
};

export default function App() {
  const [currentAccount, setCurrentAccount] = useState();
  const [isMining, setIsMining] = useState(false);
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const ethereum = useEthereum();
  const contractAddress = "0x426c0010e295E1d65Db77bF18cD0ffFB0083b584";

  const connectWallet = async () => {
    if (ethereum) {
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found");
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkIfWalletIsConnected();
  }, [ethereum]);

  const getContract = useCallback(() => {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(contractAddress, abi.abi, signer);
    }
    return null;
  }, [ethereum]);

  useEffect(() => {
    const getWaves = async () => {
      if (ethereum) {
        try {
          const wavePortalContract = getContract();
          const waves = await wavePortalContract.getAllWaves();
          setAllWaves(
            waves.map((m) => {
              return {
                address: m.waver,
                timestamp: new Date(m.timestamp * 1000),
                message: m.message,
              };
            })
          );
        } catch (error) {}
      }
    };

    getWaves();

    const onNewWave = (from, timestamp, message) => {
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    const wavePortalContract = getContract();
    wavePortalContract.on("NewWave", onNewWave);

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, [ethereum, getContract]);

  const wave = async () => {
    if (ethereum) {
      try {
        const wavePortalContract = getContract();

        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
        setIsMining(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        setIsMining(false);
        setMessage("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const isConnected = ethereum && currentAccount;

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Waving hand">
            👋
          </span>{" "}
          Hey there!
        </div>
        <div className="bio">I am Luca and I'm trying to learn web3!</div>
        {!ethereum && (
          <p>Ops... looks like you don't have metamask installed...</p>
        )}
        {currentAccount ? (
          <p>Hello {currentAccount}</p>
        ) : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {isConnected && (
          <>
            {isMining ? (
              <div>
                <span role="img" aria-label="Waving hand">
                  ⛏
                </span>{" "}
                Mining...
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></input>
                <button
                  className="waveButton"
                  disabled={message.length === 0}
                  onClick={wave}
                >
                  Wave at Me for a chance to get 0.0001 ETH
                </button>
              </>
            )}
          </>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
