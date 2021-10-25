import React, { useEffect, useState } from "react";
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
  const [currentWaves, setCurrentWaves] = useState(0);
  const ethereum = useEthereum();
  const contractAddress = "0x38053270395d4d74dE0Fb4101db2583C615f5Ca7";

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

  const getContract = () => {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(contractAddress, abi.abi, signer);
    }
    return null;
  };

  const getWaves = async () => {
    if (ethereum) {
      try {
        const wavePortalContract = getContract();
        const count = await wavePortalContract.getTotalWaves();
        setCurrentWaves(count.toNumber());
      } catch (error) {}
    }
  };

  useEffect(() => {
    getWaves();
  }, [isMining]);

  const wave = async () => {
    if (ethereum) {
      try {
        const wavePortalContract = getContract();

        const waveTxn = await wavePortalContract.wave();
        setIsMining(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        setIsMining(false);
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

        {ethereum ? (
          currentAccount ? (
            <p>Hello {currentAccount}</p>
          ) : (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )
        ) : (
          <p>Ops... looks like you don't have metamask installed...</p>
        )}

        {isConnected && (
          <>
            <p>So far we've got {currentWaves} waves!</p>
            {isMining ? (
              <div>
                <span role="img" aria-label="Waving hand">
                  ⛏
                </span>{" "}
                Mining...
              </div>
            ) : (
              <button className="waveButton" onClick={wave}>
                Wave at Me
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
