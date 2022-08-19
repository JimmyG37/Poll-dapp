// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

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

contract PostChainNft is ERC721, ERC2981 {
    using Strings for uint256;

    address private i_postChainAddress;
    address private immutable i_owner;
    string private i_smileSVG;
    string private i_glassesSVG;
    string private i_sunglassesSVG;

    event NFTMinted(uint256 tokenId);

    constructor(
        string memory smileSVG,
        string memory glassesSVG,
        string memory sunglassesSVG,
        address postChainAddress
    ) ERC721("PostChain", "PC") {
        i_owner = msg.sender;
        i_smileSVG = smileSVG;
        i_glassesSVG = glassesSVG;
        i_sunglassesSVG = sunglassesSVG;
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
        _setTokenRoyalty(postId, msg.sender, 250);
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
                                '""image":"',
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
        string memory creatorAddress = Strings.toHexString(uint256(uint160(post.creator)), 20);
        string memory profilePicture = i_smileSVG;
        if (post.totalComments >= 5) {
            profilePicture = i_glassesSVG;
        }
        if (post.totalComments >= 10) {
            profilePicture = i_sunglassesSVG;
        }

        string memory svg = string(
            abi.encodePacked(
                '<svg width="400" height="150" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                "<defs>",
                '<path id="path1" d="M10,65 H290 M10,80 H270 M15,96 H270 M20,115"></path>'
                "</defs>",
                '<rect width="300" height="200" style="fill:Lavender;stroke-width:4;stroke:rgb(229, 231, 235);" />',
                profilePicture,
                '<use xlink:href="#path1" x="0" y="50" />',
                '<text transform="translate(0,10)" font-size="15">',
                '<textPath  xlink:href="#path1">',
                post.post,
                "</textPath>",
                "</text>",
                '<text x="220" y="32" style="fill:rgb(110, 118, 125)" font-size="14">',
                "postchain:",
                tokenId.toString(),
                "</text>",
                '<text x="5" y="140" style="fill:rgb(110, 118, 125)" font-size="12">',
                "@",
                creatorAddress,
                "</text>",
                "</svg>"
            )
        );

        return svg;
    }
}
