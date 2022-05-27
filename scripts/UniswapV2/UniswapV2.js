
const addresses = {
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    UniswapV2Router02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
}

async function buyERC20ByWithETH(erc20, amountOut, recipient, signer) {
    if(erc20 == addresses.WETH) {
        const contract = await new ethers.Contract(
            erc20,
            [
                "function deposit() payable",
                "function transfer(address to, uint256 amount)"
            ],
            signer
        );
        await contract.deposit({
            value: amountOut
        });
        //transfer
        await contract.transfer(recipient, amountOut);
        return true;
    } else {
        const contract = await new ethers.Contract(
            addresses.UniswapV2Router02,
            [
              "function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)",
              "function swapExactETHForTokens(uint256 amountOutMin, address[] path, address recipient, uint256 deadline) payable"
            ],
            signer
        );
        const path = [ addresses.WETH, erc20 ];
        const amountIn = (await contract.getAmountsIn(amountOut, path))[0];

        const slippage = 0.05;
        const amountOutMin = ethers.BigNumber.from(
            toFullNumberString(amountOut * (1 - slippage))
        );
        const deadline = getUnixTimestamp(getTomorrow());
        await contract.swapExactETHForTokens(amountOutMin, path, recipient, deadline, {
            value: amountIn
        })
    }
}

function getUnixTimestamp(date){
    return Math.floor(date.getTime() / 1000);
}

function getTomorrow(){
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tomorrow;
}

function toFullNumberString(number){
    return number.toLocaleString('fullwide', { useGrouping: false });
}

module.exports ={
    buyERC20ByWithETH
}
