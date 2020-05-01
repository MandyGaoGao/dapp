App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Auction.json", function(auction) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Auction = TruffleContract(auction);
      // Connect provider to interact with contract
      App.contracts.Auction.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Auction.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.HighestBidIncreased({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },
////////////////////////////////////////////////////////////////////////////
	
  render: function() {
    var auctionInstance;
    var loader = $("#loader");
    var content = $("#content");
    //TODO:
    loader.hide();
    content.show();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Auction.deployed().then(function(instance) {
      auctionInstance = instance;
      return auctionInstance.highestBid();
    }).then(function(highest_bid) {
      $("#highest_bid").html(""+highest_bid);


        auctionInstance.auctionEndTime().then(function(deadline) {
		$("#deadline").html(""+deadline);
	});


      return auctionInstance.ended();
    }).then(function(hasEnded) {
      // Do not allow a user to bid
      if(hasEnded) {
        $('form').hide();
      }
      //loader.hide();
      //content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },
  castBid: function() {
    App.contracts.Auction.deployed().then(function(instance) {
      return instance.bid({ from: App.account });
    }).then(function(result) {
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};







$(function() {
  $(window).load(function() {
    App.init();
  });
});
