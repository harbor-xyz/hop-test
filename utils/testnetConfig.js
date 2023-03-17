const harborConfig = {
  chains: [
    {
      chain: "ethereum",
      config: {
        artifactsPath: "./packages/messenger/artifacts",
        deploy: {
          scripts: "./packages/messenger/deploy/ethereum",
          include: [
            "./node_modules",
            "./packages/messenger/scripts/constants.ts",
            "./packages/messenger/utils/",
            "./packages/messenger/scripts/config.ts",
          ],
        },
        networks: [
          {
            name: "hardhat",
            chainId: 1337,
          },
        ],
        environment: {
          MNEMONIC:
            "repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat",
          DEPLOYER_PRIVATE_KEY:
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        },
      },
      wallets: [{ tokens: [{ symbol: "USDC", amount: 10000 }] }],
      tag: "v2",
    },
    {
      chain: "optimism",
      config: {
        artifactsPath: "./packages/messenger/artifacts",
        deploy: {
          scripts: "./packages/messenger/deploy/optimism",
          include: [
            "./node_modules",
            "./packages/messenger/scripts/constants.ts",
            "./packages/messenger/utils/",
            "./packages/messenger/scripts/config.ts",
          ],
        },
        networks: [
          {
            name: "hardhat",
            chainId: 1338,
          },
        ],
        depends_on: ["ethereum"],
        environment: {
          MNEMONIC:
            "repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat repeat",
          DEPLOYER_PRIVATE_KEY:
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          ETHEREUM_URL: "http://$ethereum_hburl",
        },
      },
      wallets: [{ tokens: [{ symbol: "OP", amount: 10000 }] }],
      tag: "v2",
    },
  ],
  offChainActors: [
    {
      name: "ipfs",
      image: "ipfs/go-ipfs:v0.4.23",
      ports: [5001],
      tag: "v2",
    },
    {
      image: "public.ecr.aws/k9v9y2b9/hop-bonder:latest",
      name: "bonder",
      ports: [8080],
      depends_on: ["ipfs"],
      environment: {
        BONDER_PRIVATE_KEY:
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        IPFS_HOST: "http://$ipfs_hburl:5001",
        CONFIG:
          '{"network":"mainnet","chains":{"ethereum":{"rpcUrl":"http://$ethereum_hburl","maxGasPrice":50},"optimism":{"rpcUrl":"http://$optimism_hburl","maxGasPrice":50}},"tokens":{"USDC":true},"routes":{"ethereum":{"optimism":true},"optimism":{"ethereum":true}},"db":{"location":"/root/db"},"logging":{"level":"debug"},"watchers":{"bondTransferRoot":true,"bondWithdrawal":true,"commitTransfers":true,"settleBondedWithdrawals":true,"confirmRoots":true,"L1ToL2Relay":true},"commitTransfers":{"minThresholdAmount":{"USDC":{"optimism":{"ethereum":1000}}}},"fees":{"USDC":{"ethereum":14,"optimism":14}}}',
      },
      tag: "v2",
    },
  ],
};

module.exports = {
  harborConfig,
};
