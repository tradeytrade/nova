// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Nova (NOVA): a coin you mine from the web
/// @notice Anyone can mine 100 NOVA once every 24 hours,
///         until the maximum supply of 1,000,000 NOVA is reached.
contract Nova is ERC20 {
    // ---------- Fixed rules (nobody can change them) ----------
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18; // 1 million
    uint256 public constant REWARD     = 100 * 10 ** 18;       // 100 per mine
    uint256 public constant COOLDOWN   = 1 days;               // 24 hours

    // ---------- Project data ----------
    address public immutable creator; // whoever deployed the contract
    string  public logoURI;           // link to the coin's logo

    // ---------- Stats ----------
    mapping(address => uint256) public lastMine; // last mine time of each wallet
    uint256 public totalMiners; // distinct wallets that have mined
    uint256 public totalMines;  // total number of mines

    event Mined(address indexed miner, uint256 amount);
    event LogoUpdated(string newLogoURI);

    constructor(string memory _logoURI) ERC20("Nova", "NOVA") {
        creator = msg.sender;
        logoURI = _logoURI;
    }

    /// @notice Mine your daily reward.
    function mine() external {
        uint256 last = lastMine[msg.sender];
        require(last == 0 || block.timestamp >= last + COOLDOWN, "Nova: wait 24h between mines");

        uint256 remaining = MAX_SUPPLY - totalSupply();
        require(remaining > 0, "Nova: max supply reached");

        // If less than 100 is left, mine whatever remains
        uint256 amount = remaining < REWARD ? remaining : REWARD;

        if (last == 0) totalMiners++;
        totalMines++;
        lastMine[msg.sender] = block.timestamp;

        _mint(msg.sender, amount);
        emit Mined(msg.sender, amount);
    }

    /// @notice Timestamp from which `user` can mine again.
    ///         Returns 0 if they have never mined.
    function nextMineTime(address user) external view returns (uint256) {
        uint256 last = lastMine[user];
        return last == 0 ? 0 : last + COOLDOWN;
    }

    /// @notice The creator can update the logo link.
    function setLogoURI(string calldata _logoURI) external {
        require(msg.sender == creator, "Nova: only the creator");
        logoURI = _logoURI;
        emit LogoUpdated(_logoURI);
    }
}
