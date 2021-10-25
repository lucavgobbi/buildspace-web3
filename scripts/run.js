const main = async () => {
  // compile
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  // deploy
  const waveContract = await waveContractFactory.deploy();
  // wait for mining
  await waveContract.deployed();

  const [owner, randomPerson] = await hre.ethers.getSigners();

  console.log("Contract Address:", waveContract.address);
  console.log("Contract owner:", owner.address);

  let waveCount = await waveContract.getTotalWaves();

  let waveTxn = await waveContract.wave();
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaves();

  waveTxn = await waveContract.connect(randomPerson).wave();
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaves();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
