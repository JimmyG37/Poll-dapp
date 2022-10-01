// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

import "./PostChainSvg.sol";

error PostChain__NoMint();

interface IPostChain {
    struct Post {
        address creator;
        string post;
        uint256 postId;
        uint256 dateCreated;
        uint256 likeAndCommentDeadline;
        uint256 totalComments;
        uint256 totalLikes;
    }

    function getPost(uint256 postId) external view returns (Post memory);
}

contract PostChainNft is ERC721, ERC2981, PostChainSvg {
    using Strings for uint256;

    address private i_postChainAddress;
    address private immutable i_owner;

    mapping(uint256 => bool) private s_minted;

    event NFTMinted(uint256 indexed tokenId);

    constructor(
        string memory sunglassesSVG,
        string memory hatSVG,
        address postChainAddress
    ) ERC721("PostChain", "PC") PostChainSvg(sunglassesSVG, hatSVG) {
        i_owner = msg.sender;
        i_postChainAddress = postChainAddress;
    }

    function mintNft(uint256 postId) public {
        IPostChain.Post memory post = IPostChain(i_postChainAddress).getPost(postId);
        if (block.timestamp < post.likeAndCommentDeadline) {
            revert PostChain__NoMint();
        }
        if (msg.sender != post.creator) {
            revert PostChain__NoMint();
        }
        _safeMint(msg.sender, postId);
        _setTokenRoyalty(postId, msg.sender, 250); // 2.50% royalty
        s_minted[postId] = true;
        emit NFTMinted(postId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId));
        string memory image = Base64.encode(bytes(generateSVGofTokenById(tokenId)));
        string memory name = string(abi.encodePacked("PostChain #", tokenId.toString()));

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name,
                                '", "description":"An NFT of a post", ',
                                '"image":"',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function generateSVGofTokenById(uint256 tokenId) internal view returns (string memory) {
        IPostChain.Post memory post = IPostChain(i_postChainAddress).getPost(tokenId);
        string memory svg = generateSVG(tokenId, post.creator, post.post, post.totalComments);
        return svg;
    }

    function getMinted(uint256 postId) public view returns (bool) {
        return s_minted[postId];
    }
}
