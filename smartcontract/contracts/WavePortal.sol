// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    address lastWaveSender;

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function wave() public {
        totalWaves += 1;
        lastWaveSender = msg.sender;
        console.log("%s has waved!", msg.sender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log(
            "We have %d total waves! Last person waiving was %s",
            totalWaves,
            lastWaveSender
        );
        return totalWaves;
    }
}
