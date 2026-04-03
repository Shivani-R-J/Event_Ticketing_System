// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TicketPass
 * @dev Upgraded ChainPass Smart Contract (ERC-721 based)
 * Supports dynamic pricing, specific event ties, and NFT transfers!
 */
contract TicketPass is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _ticketIds;
    Counters.Counter private _eventIds;

    struct EventData {
        string name;
        uint256 price;
        uint256 totalTickets;
        uint256 ticketsSold;
        bool isActive;
    }

    // Mapping from Event ID to Event Data
    mapping(uint256 => EventData) public events;
    
    // Mapping from Ticket ID to Event ID
    mapping(uint256 => uint256) public ticketToEvent;
    
    // Track if a ticket has been used/scanned
    mapping(uint256 => bool) public isTicketUsed;

    event EventCreated(uint256 indexed eventId, string name, uint256 price, uint256 totalTickets);
    event TicketMinted(uint256 indexed ticketId, uint256 indexed eventId, address owner);
    event TicketScanned(uint256 indexed ticketId);

    constructor() ERC721("ChainPass Ticket", "CPTK") Ownable() {} // Or specify address for msg.sender

    /**
     * @dev Create a new event
     */
    function createEvent(string memory _name, uint256 _price, uint256 _totalTickets) public onlyOwner {
        _eventIds.increment();
        uint256 newEventId = _eventIds.current();

        events[newEventId] = EventData({
            name: _name,
            price: _price,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            isActive: true
        });

        emit EventCreated(newEventId, _name, _price, _totalTickets);
    }

    /**
     * @dev Buy a ticket for a specific event
     */
    function buyTicket(uint256 _eventId, string memory tokenURI) public payable {
        EventData storage evt = events[_eventId];
        
        require(evt.isActive, "Event is not active");
        require(msg.value >= evt.price, "Insufficient ether sent");
        require(evt.ticketsSold < evt.totalTickets, "Event is sold out");

        _ticketIds.increment();
        uint256 newTicketId = _ticketIds.current();

        _mint(msg.sender, newTicketId);
        _setTokenURI(newTicketId, tokenURI);

        evt.ticketsSold++;
        ticketToEvent[newTicketId] = _eventId;
        
        emit TicketMinted(newTicketId, _eventId, msg.sender);

        // Refund excess ether
        if (msg.value > evt.price) {
            payable(msg.sender).transfer(msg.value - evt.price);
        }
    }

    /**
     * @dev Organizer can scan and mark ticket as used
     */
    function markUsed(uint256 _ticketId) public onlyOwner {
        require(_exists(_ticketId), "Ticket does not exist");
        require(!isTicketUsed[_ticketId], "Ticket already used");
        
        isTicketUsed[_ticketId] = true;
        emit TicketScanned(_ticketId);
    }

    /**
     * @dev Withdraw funds from contract
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
    
    // Required override for openzeppelin ^4.9.0 if missing
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
