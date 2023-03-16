module.exports = async ({getNamedAccounts, deployments}) => {
	const {deploy} = deployments;
	const {deployer} = await getNamedAccounts();

	await deploy('MessageReceiver', {
		from: deployer,
    	args: [process.env.AXL_GATEWAY_ADDR, process.env.AXL_GAS_RECEIVER_ADDR],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
}