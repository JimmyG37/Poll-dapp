// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Strings.sol";

contract PostChainSvg {
    using Strings for uint256;

    string private i_sunglassesSVG;
    string private i_hatSVG;

    constructor(string memory sunglassesSVG, string memory hatSVG) {
        i_sunglassesSVG = sunglassesSVG;
        i_hatSVG = hatSVG;
    }

    function generateSVG(
        uint256 tokenId,
        address creator,
        string memory post,
        uint256 totalComments
    ) internal view returns (string memory) {
        uint256 postId = tokenId;
        string memory creatorAddress = Strings.toHexString(uint256(uint160(creator)), 20);
        string memory creatorPost = post;
        string memory accessory;
        if (totalComments >= 5) {
            accessory = i_sunglassesSVG;
        }
        if (totalComments >= 10) {
            accessory = i_hatSVG;
        }

        string memory svg = string(
            abi.encodePacked(
                '<svg width="300" height="150" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
                "<defs>",
                '<path id="path1" d="M10,65 H290 M10,80 H270 M15,96 H270 M20,115"></path>'
                "</defs>",
                '<rect width="300" height="150" style="fill:Lavender;stroke-width:1;stroke:black"/>',
                '<circle cx="40" cy="40" fill="yellow" r="25" stroke="black" stroke-width="2"/>',
                accessory,
                '<g class="eyes">',
                '<circle cx="35" cy="37" r="5"/>',
                '<circle cx="49" cy="37" r="5"/>',
                "</g>",
                '<path d="M 32 48 q 10 10 20 0" style="fill:none; stroke: black; stroke-width: 2;" />',
                '<use xlink:href="#path1" x="0" y="50" />',
                '<text transform="translate(0,21)" font-size="15">',
                '<textPath  xlink:href="#path1">',
                creatorPost,
                "</textPath>",
                "</text>",
                '<text x="200" y="32" style="fill:rgb(110, 118, 125)" font-size="14">',
                "postchain:",
                postId.toString(),
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
