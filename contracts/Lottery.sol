// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ITicket.sol";

import "hardhat/console.sol";

contract Lottery is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private immutable _VRFCOORDINATOR;
    IERC20 private immutable _STOLOTOCOIN;
    ITicket private immutable _TICKET;

    bytes32 private constant _KEYHASH = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

    uint64 private immutable _SUBID;
    uint32 private immutable _CALLBACK_GAS_LIMIT = 500000;

    uint256 private constant _COST = 10 * 10 ** 18;
    uint256 public requestId;

    constructor(uint64 _subId, address _vrf, address _stolotocoin, address _tickets) VRFConsumerBaseV2(_vrf) {
        _VRFCOORDINATOR = VRFCoordinatorV2Interface(_vrf);
        _STOLOTOCOIN = IERC20(_stolotocoin);
        _TICKET = ITicket(_tickets);
        _SUBID = _subId;
    }

    function buyTickets(uint256 _quantity) external {
        _STOLOTOCOIN.transferFrom(msg.sender, address(this), _COST * _quantity);
        _TICKET.mint(msg.sender, _quantity);
        console.log("minter: %s", msg.sender);
    }

    function requestRandomNumbers() external {
        requestId = _VRFCOORDINATOR.requestRandomWords(_KEYHASH, _SUBID, 3, _CALLBACK_GAS_LIMIT, 5);
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        requestId = _requestId;
        uint256 winAmount = _STOLOTOCOIN.balanceOf(address(this)) / 5;
        uint256 round;
        uint256 supply = _TICKET.totalSupply();

        console.log("array l: %s", _randomWords.length);

        while (round < _randomWords.length) {
            uint256 random = _randomWords[round] % supply;
            address ownerOf = _TICKET.ownerOf(random);
            console.log("owner is %s", ownerOf);
            _STOLOTOCOIN.transfer(ownerOf, winAmount);
            round++;
        }
    }
}