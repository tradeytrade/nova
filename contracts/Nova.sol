// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Nova (NOVA): a coin you mine from the web, once a day
/// @notice How it works:
///  - Every day (00:00 to 24:00 UTC) the contract releases a fixed amount of
///    NOVA: the daily reward. It starts at 50,000 NOVA.
///  - Every wallet can mine once per day. When the day closes, that day's
///    reward is split EQUALLY among everyone who mined it. There is no race:
///    mining at 00:01 or at 23:59 gives the same share.
///  - Your share is paid automatically the next time you mine, or whenever
///    you call claim().
///  - The daily reward halves every 210 days, like Bitcoin's block reward
///    (50 BTC, halving every 210,000 blocks). Added up, the rewards approach
///    21,000,000 NOVA and can never pass it.
///  - Nobody can take the supply in one day: at most one daily reward can
///    ever be created per day, whatever happens.
///  - If nobody mines on a day, that day's coins are never created.
contract Nova is ERC20 {
    // ---------- Fixed rules (nobody can change them) ----------
    uint256 public constant MAX_SUPPLY    = 21_000_000 * 10 ** 18; // hard cap
    uint256 public constant INITIAL_DAILY = 50_000 * 10 ** 18;     // reward of day 0
    uint256 public constant HALVING_DAYS  = 210;                   // reward halves every 210 days
    uint256 public constant DAY           = 1 days;                // days start at 00:00 UTC

    // ---------- Project data ----------
    address public immutable creator;   // whoever deployed the contract (starts with 0 NOVA)
    uint256 public immutable launchDay; // UTC day of deployment, counted from 1 Jan 1970
    string  public logoURI;             // link to the coin's logo

    // ---------- Miners ----------
    struct Miner {
        uint64 lastDay;  // last day (counted from launch) this wallet mined
        bool   hasMined; // false until the wallet mines for the first time
        bool   paid;     // whether the share of lastDay has been paid
    }
    mapping(address => Miner)   public miners;
    mapping(uint256 => uint256) public minersOnDay; // day => how many wallets mined it

    // ---------- Stats ----------
    uint256 public totalMiners; // distinct wallets that have mined
    uint256 public totalMines;  // total number of mines

    event Mined(address indexed miner, uint256 indexed day);
    event Claimed(address indexed miner, uint256 indexed day, uint256 amount);
    event LogoUpdated(string newLogoURI);

    constructor(string memory _logoURI) ERC20("Nova", "NOVA") {
        creator = msg.sender;
        launchDay = block.timestamp / DAY;
        logoURI = _logoURI;
    }

    // =========================================================
    //  Mining
    // =========================================================

    /// @notice Join today's mining. Also pays your share of the last day you mined.
    function mine() external {
        uint256 day = today();
        Miner storage m = miners[msg.sender];
        require(!(m.hasMined && m.lastDay == day), "Nova: already mined today");
        require(dailyReward(day) > 0, "Nova: mining has ended");

        if (!m.hasMined) {
            m.hasMined = true;
            totalMiners++;
        } else if (!m.paid) {
            _pay(msg.sender, m); // the last day you mined has already closed
        }

        m.lastDay = uint64(day);
        m.paid = false;
        minersOnDay[day]++;
        totalMines++;
        emit Mined(msg.sender, day);
    }

    /// @notice Collect your share of the last day you mined, without mining again.
    function claim() external {
        Miner storage m = miners[msg.sender];
        require(m.hasMined && !m.paid && m.lastDay < today(), "Nova: nothing to claim");
        _pay(msg.sender, m);
    }

    function _pay(address who, Miner storage m) private {
        m.paid = true;
        uint256 amount = shareOf(m.lastDay);
        uint256 room = MAX_SUPPLY - totalSupply(); // safety net: never pass the cap
        if (amount > room) amount = room;
        if (amount > 0) _mint(who, amount);
        emit Claimed(who, m.lastDay, amount);
    }

    // =========================================================
    //  Schedule
    // =========================================================

    /// @notice Days since launch. Day 0 is the launch day.
    function today() public view returns (uint256) {
        return block.timestamp / DAY - launchDay;
    }

    /// @notice NOVA released on `day`: 50,000, halved every 210 days.
    function dailyReward(uint256 day) public pure returns (uint256) {
        uint256 halvings = day / HALVING_DAYS;
        if (halvings >= 64) return 0;
        return INITIAL_DAILY >> halvings;
    }

    /// @notice What each miner of `day` gets (an estimate while the day is still open).
    function shareOf(uint256 day) public view returns (uint256) {
        uint256 count = minersOnDay[day];
        return count == 0 ? 0 : dailyReward(day) / count;
    }

    /// @notice Timestamp when the current day closes (next 00:00 UTC).
    function nextDayAt() public view returns (uint256) {
        return (block.timestamp / DAY + 1) * DAY;
    }

    /// @notice The day (counted from launch) when the next halving happens.
    function nextHalvingDay() public view returns (uint256) {
        return (today() / HALVING_DAYS + 1) * HALVING_DAYS;
    }

    // =========================================================
    //  Read-only helpers for the website
    // =========================================================

    /// @notice How much `user` can collect right now.
    function claimable(address user) public view returns (uint256) {
        Miner memory m = miners[user];
        if (!m.hasMined || m.paid || m.lastDay >= today()) return 0;
        return shareOf(m.lastDay);
    }

    /// @notice Everything the website shows about today, in one call.
    function info() external view returns (
        uint256 day,
        uint256 reward,
        uint256 minersToday,
        uint256 closesAt,
        uint256 halvingDay,
        uint256 supply,
        uint256 allMiners,
        uint256 allMines
    ) {
        day = today();
        return (day, dailyReward(day), minersOnDay[day], nextDayAt(), nextHalvingDay(), totalSupply(), totalMiners, totalMines);
    }

    /// @notice Everything the website shows about one wallet, in one call.
    function minerInfo(address user) external view returns (
        bool minedToday,
        uint256 lastDay,
        bool hasMined,
        uint256 claimableNow,
        uint256 shareToday
    ) {
        Miner memory m = miners[user];
        minedToday = m.hasMined && m.lastDay == today();
        return (minedToday, m.lastDay, m.hasMined, claimable(user), minedToday ? shareOf(m.lastDay) : 0);
    }

    // =========================================================
    //  Logo
    // =========================================================

    /// @notice The creator can update the logo link. Nothing else.
    function setLogoURI(string calldata _logoURI) external {
        require(msg.sender == creator, "Nova: only the creator");
        logoURI = _logoURI;
        emit LogoUpdated(_logoURI);
    }
}
