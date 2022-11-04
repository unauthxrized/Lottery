// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ITicket {
    function mint(address _to, uint256 _amount) external;

    function ownerOf(uint256 tokenId) external view returns (address owner);
    
    function totalSupply() external view returns (uint256);
}