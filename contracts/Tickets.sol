// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "erc721a/contracts/ERC721A.sol";

contract Tickets is ERC721A {
    constructor() ERC721A("TICKET", 'TCKT') {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}