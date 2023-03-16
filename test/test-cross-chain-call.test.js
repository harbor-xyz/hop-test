// Import necessary libraries
const Harbor = require("@harbor-xyz/harbor");
const ethers = require("ethers");
const { providers, Contract, utils } = require("ethers");
const {harborConfig} = require("../utils/testnetConfig.js");
const TESTNET_NAME = "";

// add a message here
const MESSAGE = "harbor workshop at interop in test";


// Define test suite
describe("Test Cross Chain Message passing", () => {
  // Declare variables used in tests
  let harbor;
  let testnet;
  
  const TIMEOUT = 400000;

  // Before all tests, apply harborConfig to a new testnet and authenticate user
  beforeAll(async () => {
    harbor = new Harbor({
      userKey: "qcE21AK1HhALsFewXX7j22",
      projectKey: "ogYoDec4oHxrSXr14Mgv1z",
    });
    await harbor.authenticate();
    testnet = await harbor.apply(harborConfig, TESTNET_NAME);
  }, TIMEOUT);


  // Test to check if testnet is up with the right chains and off chain actors
  it(
    "Check if the testnet is up with the right chains and off chain actors",
    async () => {
        // Validate testnet
        expect(testnet.name).toBe(TESTNET_NAME);
        expect(testnet.id).not.toBeUndefined();

        // Validate chains
        expect(testnet.status).toBe("RUNNING");
        expect(testnet.ethereum.status).toBe("RUNNING");
        expect(testnet.ethereum.id).not.toBeUndefined();
        expect(testnet.ethereum.endpoint).not.toBeUndefined();

        expect(testnet.polygon.status).toBe("RUNNING");
        expect(testnet.polygon.id).not.toBeUndefined();
        expect(testnet.polygon.status).toBe("RUNNING");
        expect(testnet.polygon.status).toBe("RUNNING");
        expect(testnet.polygon.id).not.toBeUndefined();
        expect(testnet.polygon.endpoint).not.toBeUndefined();

        console.log("\n");
        console.log("Testnet Status: ", testnet.status);
        console.log("\n");
        console.log("Name: ", testnet.name);
        console.log("\n");
        console.log("ID: ", testnet.id);
        console.log("\n");
        console.log("Status: ", testnet.status);
        console.log("\n");
        console.log("Ethereum Status: ", testnet.ethereum.status);
        console.log("\n");
        console.log("Polygon Status: ", testnet.polygon.status);
        console.log("\n");    
        console.log("Ethereum Endpoint: ", testnet.ethereum.endpoint);
        console.log("\n");
        console.log("Polygon Endpoint: ", testnet.polygon.endpoint);
        console.log("\n");

        // Validate off chain actors
        console.log(" **** Axelar Relayer ****");
        const offChainActors = await testnet.offChainActors();
        const relayer = offChainActors["relayer"];
        const relayerEndpoint = relayer.endpoint;
        const relayerPorts = await relayer.ports();
        console.log("axelar relayer endpoint : http://" + relayerEndpoint + ":" + relayerPorts);
        expect(relayer).not.toBeUndefined();
        expect(relayerEndpoint).not.toBeUndefined();
        expect(relayerPorts).not.toBeUndefined();

    },
    TIMEOUT
  );


  it(
    "Check if the cross-chain message passing works",
    async () => {
        console.log("Check if the cross-chain message passing works");
        // Access the Ethereum and Polygon objects from the testnet.
        const ethereum = testnet.ethereum;
        const polygon = testnet.polygon;
        expect(ethereum).not.toBeUndefined();
        expect(polygon).not.toBeUndefined();

        // Get the contracts from Ethereum and Polygon.
        let ethereumContracts =  await ethereum.contracts();
        let polygonContracts =  await polygon.contracts();
        expect(ethereumContracts).not.toBeUndefined();
        expect(polygonContracts).not.toBeUndefined();

        // Get the contract addresses for the contracts we want to interact with.
        let ethereumContractAddress = ethereumContracts.MessageSender.address;
        let polygonContractAddress = polygonContracts.MessageReceiver.address;
        expect(ethereumContractAddress).not.toBeUndefined();
        expect(polygonContractAddress).not.toBeUndefined();

        // Create provider instances for Ethereum and Polygon.
        const ethereumProvider = new ethers.providers.JsonRpcProvider(ethereum.endpoint);
        const polygonProvider = new ethers.providers.JsonRpcProvider(polygon.endpoint);

        // Create contract instances for Ethereum and Polygon.
        const ethereumMessageSenderContract = new ethers.Contract(ethereumContractAddress, ethereumContracts.MessageSender.abi, ethereumProvider.getSigner());
        const polygonMessageReceiverContract = new ethers.Contract(polygonContractAddress, polygonContracts.MessageReceiver.abi, polygonProvider.getSigner());
        
        // Log the current value of the contract on Polygon.
        const initialValAtDest = await polygonMessageReceiverContract.value();
    
        // Set the gasLimit to 3e5 (a safe overestimate) and get the gas price.
        const gasLimit = 3e5;
        const gasPrice = 1;

        // Set the remote value on Polygon using the contract instance on Ethereum.
        const tx = await ethereumMessageSenderContract.setRemoteValue(polygon.chain, polygonMessageReceiverContract.address, MESSAGE, {
            value: BigInt(Math.floor(gasLimit * gasPrice)),
        });

        // Wait for the transaction to be confirmed.
        await tx.wait();

        console.log("Passing value from Ethereum " + MESSAGE);

        // Wait until the value on Polygon is updated.
        let counter = 0;
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        while ((await polygonMessageReceiverContract.value()) !== MESSAGE && counter != 12) {
            await sleep(1000);        
            counter++;
        }

        const finalValAtDest = await polygonMessageReceiverContract.value();
        expect(finalValAtDest).toBe(MESSAGE);
        console.log("Passed value on Polygon " + finalValAtDest);

    },
    TIMEOUT
  );

  afterAll(async () => {
    // await harbor.stop(testnetName);
  }, TIMEOUT);
});
