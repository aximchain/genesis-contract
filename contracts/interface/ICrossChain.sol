pragma solidity 0.6.4;

interface ICrossChain {
    /**
     * @dev Send package to Aximchain
     */
    function sendSynPackage(uint8 channelId, bytes calldata msgBytes, uint256 relayFee) external;
}
