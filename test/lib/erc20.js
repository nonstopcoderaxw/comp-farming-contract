async function approve(token, signer, spender, amount) {
    const abi = [
        "function approve(address spender, uint256 amount)",
    ];
    const contract = await new ethers.Contract(token, abi, signer);
    return await contract.approve(spender, amount);
}

async function delta_balance(token, account, blockNumber0, blockNumber1, signer) {
    const balance0 = await balanceOfWithBlockNumber(blockNumber0, token, account, signer);
    const balance1 = await balanceOfWithBlockNumber(blockNumber1, token, account, signer);

    return balance1 - balance0;
}

async function decimals(token, signer) {
    const abi = [
        "function decimals() public view returns (uint256)",
    ];

    const contract = await new ethers.Contract(token, abi, signer);
    return contract.decimals();
}

async function balanceOf(token, account, signer) {
    const abi = [
        "function balanceOf(address acc) public view returns (uint256)",
    ];
    const contract = await new ethers.Contract(token, abi, signer);
    return await contract.balanceOf(account);
}

async function balanceOfWithBlockNumber(blockNumber, token, account, signer) {
    const abi = [
        "function balanceOf(address acc) public view returns (uint256)",
    ];
    const contract = await new ethers.Contract(token, abi, signer);
    return await contract.balanceOf(account, {
        blockTag: blockNumber
    });
}

module.exports = {
    approve,
    delta_balance,
    balanceOf,
    balanceOfWithBlockNumber,
    decimals
}
