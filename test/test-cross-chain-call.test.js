// Import necessary libraries
const Harbor = require("@harbor-xyz/harbor");
const ethers = require("ethers");
const { parseUnits } = ethers.utils;
const { providers, Contract, utils } = require("ethers");

const TESTNET_NAME = "hop16mar2000";

// add a message here
const MESSAGE = "hop harbor test";
const MESSAGE_FEE = parseUnits("0.000001");

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
      projectKey: "77UrT2H7gpMHfxj2yp14rt",
    });
    const result = await harbor.authenticate();
    console.log(result);
    testnet = await harbor.testnet(TESTNET_NAME);
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

      expect(testnet.optimism.status).toBe("RUNNING");
      expect(testnet.optimism.id).not.toBeUndefined();
      expect(testnet.optimism.endpoint).not.toBeUndefined();

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
      console.log("Ethereum Endpoint: ", testnet.ethereum.endpoint);
      console.log("\n");
      console.log("Optimism Status: ", testnet.optimism.status);
      console.log("\n");
      console.log("Optimism Endpoint: ", testnet.optimism.endpoint);
      console.log("\n");

      // Validate off chain actors
      console.log(" **** Hop Actors ****");
      const offChainActors = await testnet.offChainActors();
      const bonder = offChainActors["bonder"];
      const bonderEndpoint = bonder.endpoint;
      const bonderPorts = await bonder.ports();
      console.log(
        "Hop bonder endpoint : http://" + bonderEndpoint + ":" + bonderPorts
      );
      expect(bonder).not.toBeUndefined();
      expect(bonderEndpoint).not.toBeUndefined();
      expect(bonderPorts).not.toBeUndefined();
    },
    TIMEOUT
  );

  it(
    "Check if the cross-chain message passing works",
    async () => {
      console.log("Should sendMessage and relayMessage");

      const ethereum = testnet.ethereum;
      expect(ethereum).not.toBeUndefined();
      console.log(ethereum);

      const optimism = testnet.optimism;
      expect(optimism).not.toBeUndefined();
      console.log(optimism);

      let ethereumContracts = await ethereum.contracts();
      expect(ethereumContracts).not.toBeUndefined();
      console.log(ethereumContracts);

      let optimismContracts = await optimism.contracts();
      expect(optimismContracts).not.toBeUndefined();
      console.log(optimismContracts);

      let ethereumContractAddress = ethereumContracts.HubMessageBridge.address;
      expect(ethereumContractAddress).not.toBeUndefined();
      console.log(ethereumContractAddress);

      let optimismContractAddress =
        optimismContracts.SpokeMessageBridge.address;
      expect(optimismContractAddress).not.toBeUndefined();
      console.log(optimismContractAddress);

      const ethereumProvider = new ethers.providers.JsonRpcProvider(
        ethereum.endpoint
      );
      const optimismProvider = new ethers.providers.JsonRpcProvider(
        optimism.endpoint
      );

      const ethereumHubMessageBridgeContract = new ethers.Contract(
        ethereumContractAddress,
        ethereumContracts.HubMessageBridge.abi,
        ethereumProvider.getSigner()
      );
      const optimismSpokeMessageBridgeContract = new ethers.Contract(
        optimismContractAddress,
        optimismContracts.SpokeMessageBridge.abi,
        optimismProvider.getSigner()
      );

      console.log("    Send message L2 -> L1");

      const tx = await optimismSpokeMessageBridgeContract.dispatchMessage(
        1337,
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "0x00",
        {
          gasLimit: 100_000,
          value: MESSAGE_FEE,
        }
      );

      const receipt = await tx.wait();

      console.log("messageSent", receipt.transactionHash);

      const messageSentEvent = receipt.events?.find(
        (e) => e.event === "MessageSent"
      );
      if (!messageSentEvent?.args)
        throw new Error("No MessageSent event found");

      // const tx = await ethereumHubMessageBridgeContract.executeMessage(
      //   1337,
      //   ethereumProvider.getSigner().address,
      //   '0x7B258c793CdbC3567B6727a2Ad8Bc7646d74c55C',
      //   MESSAGE,
      //   {
      //     bundleId:
      //       '0x67828efe977de865e3a6315b092ec6b10f5e0e149b7f3d43fbeaee953fa04f62',
      //     treeIndex: 0,
      //     siblings: [
      //       '0x07179261de5ae34af8281b9b73e5ed2aadb3ef14bad7e01a16cf8b643d51ea82',
      //     ],
      //     totalLeaves: 2,
      //   });

      // Wait for the transaction to be confirmed.
      // const receipt = await tx.wait();

      // console.log("Passing value from Ethereum " + MESSAGE);
      // console.log('executeMessage', receipt.transactionHash)
    },
    TIMEOUT
  );

  afterAll(async () => {
    // await harbor.stop(testnetName);
  }, TIMEOUT);
});
