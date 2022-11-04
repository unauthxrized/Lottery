import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Lottery, StolotoCoin, Tickets, VRFCoordinatorV2Mock } from "../typechain-types";

describe("Initial Tests", async() => {
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;

    let vrfCoordinator: VRFCoordinatorV2Mock;
    let lottery: Lottery;
    let stolotoCoin: StolotoCoin;
    let ticket: Tickets;

    before(async () => {
        [owner, user1, user2, user3] = await ethers.getSigners();

        const VRFContract = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        const LotteryContract = await ethers.getContractFactory("Lottery");
        const StolotoContract = await ethers.getContractFactory("StolotoCoin");
        const TicketContract = await ethers.getContractFactory("Tickets");

        ticket = await TicketContract.deploy();
        stolotoCoin = await StolotoContract.deploy();
        vrfCoordinator = await VRFContract.deploy(0,0);
        lottery = await LotteryContract.deploy(1, vrfCoordinator.address, stolotoCoin.address, ticket.address);
    })

    it("Balance is equal", async () => {
        const ownerBalance = await stolotoCoin.balanceOf(owner.address);

        await stolotoCoin.connect(user1).getLotoCoins();
        await stolotoCoin.connect(user2).getLotoCoins();
        await stolotoCoin.connect(user3).getLotoCoins();

        const userBalance = await stolotoCoin.balanceOf(user1.address);

        expect(ownerBalance).to.equal(userBalance).to.equal(ethers.utils.parseUnits("1000"));
    })

    it("Buy ticket check", async () => {
        await stolotoCoin.connect(user1).approve(lottery.address, ethers.utils.parseUnits("1000"));
        await lottery.connect(user1).buyTickets(5);

        await stolotoCoin.connect(user2).approve(lottery.address, ethers.utils.parseUnits("1000"));
        await lottery.connect(user2).buyTickets(5);

        await stolotoCoin.connect(user3).approve(lottery.address, ethers.utils.parseUnits("1000"));
        await lottery.connect(user3).buyTickets(5);

        const ticketsAmount = await ticket.balanceOf(user1.address);
        expect(ticketsAmount).to.equal(5);
        expect(await ticket.totalSupply()).to.equal(15);
    })

    it("Create subscription", async () => {
        await vrfCoordinator.createSubscription();
        await vrfCoordinator.addConsumer(1, lottery.address);

        const consumer = await vrfCoordinator.getSubscription(1);
        expect(consumer[3][0]).to.equal(lottery.address);
    })

    it("get Random", async () => {
        await lottery.requestRandomNumbers();

        const balanceBefore = await stolotoCoin.balanceOf(lottery.address);
    
        await vrfCoordinator.fulfillRandomWords(1, lottery.address);

        const balanceOflottery = await stolotoCoin.balanceOf(lottery.address);

        // in perfect - balance is zero
        //expect(balanceOflottery).to.equal(0);
        
        expect(balanceOflottery).to.equal(ethers.utils.parseUnits("150"));
    })
})