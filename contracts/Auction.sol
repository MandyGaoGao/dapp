pragma solidity 0.5.16;

contract Auction {
    address payable public beneficiary;
    uint public auctionEndTime;
    bool ended;

    address payable public highestBidder;
    uint public highestBid;

    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor(
        uint _biddingTime,
        address payable _beneficiary
    ) public {
        beneficiary = _beneficiary;
        auctionEndTime = now + _biddingTime;
    }

	
    function bid() public payable {
	require(
            now <= auctionEndTime,
           "Auction already ended."
        );
        
        require(
            msg.value > highestBid
        );

        if (highestBid != 0) {
            highestBidder.send(highestBid);
	}
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }
    
    function auctionEnd() public {
        require(now >= auctionEndTime, "Auction not yet ended.");
        require(!ended, "auctionEnd has already been called.");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        beneficiary.transfer(highestBid);
    }
}
