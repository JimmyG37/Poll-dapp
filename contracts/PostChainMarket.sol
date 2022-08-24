// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./PostChainNft.sol";

error PostChainMarket__PriceMustBeAboveZero();
error PostChainMarket__NotApprovedForMarketPlace();
error PostChainMarket__AlreadyListed(address nftAddress, uint256 postId);
error PostChainMarket__NotOwner();
error PostChainMarket__NotListed(address nftAddress, uint256 postId);
error PostChainMarket__PriceNotMet(address nftAddress, uint256 postId, uint256 price);
error PostChainMarket__NoProceeds();
error PostChainMarket__NoRoyalties();
error PostChainMarket__TransferFailed();

contract PostChainMarket is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed postId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed postId,
        uint256 price
    );

    event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 postId);

    mapping(address => mapping(uint256 => Listing)) private s_listings;

    mapping(address => uint256) private s_proceeds;

    mapping(address => uint256) private s_royalties;

    modifier notListed(
        address nftAddress,
        uint256 postId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][postId];
        if (listing.price > 0) {
            revert PostChainMarket__AlreadyListed(nftAddress, postId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 postId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(postId);
        if (spender != owner) {
            revert PostChainMarket__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 postId) {
        Listing memory listing = s_listings[nftAddress][postId];
        if (listing.price <= 0) {
            revert PostChainMarket__NotListed(nftAddress, postId);
        }
        _;
    }

    /*
     * @notice Method for listing your NFT on the marketplace
     * @param nftAddress: Address of the NFT
     * @param postId: The Token ID of the NFT
     * @param price: Sale price of the listed NFT
     */
    function listItem(
        address nftAddress,
        uint256 postId,
        uint256 price
    ) external notListed(nftAddress, postId, msg.sender) isOwner(nftAddress, postId, msg.sender) {
        if (price <= 0) {
            revert PostChainMarket__PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(postId) != address(this)) {
            revert PostChainMarket__NotApprovedForMarketPlace();
        }
        s_listings[nftAddress][postId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, postId, price);
    }

    /*
     * @notice Method for buying listing
     * @param nftAddress: Address of NFT contract
     * @param postId: Token ID of NFT
     */
    function buyItem(address nftAddress, uint256 postId)
        external
        payable
        nonReentrant
        isListed(nftAddress, postId)
    {
        Listing memory listedItem = s_listings[nftAddress][postId];
        if (msg.value < listedItem.price) {
            revert PostChainMarket__PriceNotMet(nftAddress, postId, listedItem.price);
        }

        distributeEarnings(nftAddress, postId, listedItem.seller, msg.value);
        delete (s_listings[nftAddress][postId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, postId);
        emit ItemBought(msg.sender, nftAddress, postId, listedItem.price);
    }

    /*
     * @notice Method to distribute earnings to seller and royalty to NFT creator
     * @param nftAddress: Address of NFT contract
     * @param postId: Token ID of NFT
     * @param sellerAddress: NFT seller address
     * @param earnings: NFT sale amount
     */
    function distributeEarnings(
        address nftAddress,
        uint256 postId,
        address sellerAddress,
        uint256 earnings
    ) private {
        (address postCreator, uint256 creatorShare) = getCreatorShare(
            nftAddress,
            postId,
            sellerAddress,
            earnings
        );

        uint256 sellerShare = earnings - creatorShare;

        if (creatorShare > 0 && address(0) != postCreator) {
            s_royalties[postCreator] += creatorShare;
        }

        s_proceeds[sellerAddress] += sellerShare;
    }

    /*
     * @notice Method to retrieve NFT creator share amount
     * @param nftAddress: Address of NFT contract
     * @param postId: Token ID of NFT
     * @param sellerAddress: NFT seller address
     * @param earnings: NFT sale amount
     */
    function getCreatorShare(
        address nftAddress,
        uint256 postId,
        address sellerAddress,
        uint256 earnings
    ) private view returns (address, uint256) {
        if (ERC165Checker.supportsInterface(nftAddress, type(IERC2981).interfaceId)) {
            (address postCreator, uint256 creatorShare) = PostChainNft(nftAddress).royaltyInfo(
                postId,
                earnings
            );

            if (postCreator == sellerAddress) {
                creatorShare = 0;
            }

            return (postCreator, creatorShare);
        } else {
            return (address(0), 0);
        }
    }

    /*
     * @notice Method for cancelling listing
     * @param nftAddress: Address of NFT contract
     * @param postId: Token ID of NFT
     */
    function cancelItem(address nftAddress, uint256 postId)
        external
        isOwner(nftAddress, postId, msg.sender)
        isListed(nftAddress, postId)
    {
        delete (s_listings[nftAddress][postId]);
        emit ItemCanceled(msg.sender, nftAddress, postId);
    }

    /*
     * @notice Method for updating listing
     * @param nftAddress: Address of NFT contract
     * @param postId: Token ID of NFT
     * @param newPrice: Price of NFT
     */
    function updateListing(
        address nftAddress,
        uint256 postId,
        uint256 newPrice
    ) external isListed(nftAddress, postId) isOwner(nftAddress, postId, msg.sender) {
        s_listings[nftAddress][postId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, postId, newPrice);
    }

    /*
     * @notice Method for withdrawing proceeds from sales
     */
    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert PostChainMarket__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert PostChainMarket__TransferFailed();
        }
    }

    /*
     * @notice Method for withdrawing royalties
     */
    function withdrawRoyalties() external {
        uint256 royalty = s_royalties[msg.sender];
        if (royalty <= 0) {
            revert PostChainMarket__NoRoyalties();
        }
        s_royalties[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: royalty}("");
        if (!success) {
            revert PostChainMarket__TransferFailed();
        }
    }

    // Getter Functions
    function getListing(address nftAddress, uint256 postId) external view returns (Listing memory) {
        return s_listings[nftAddress][postId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }

    function getRoyalties(address nftCreator) external view returns (uint256) {
        return s_royalties[nftCreator];
    }
}
