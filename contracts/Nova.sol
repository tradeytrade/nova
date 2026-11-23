// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/// @title Nova (NOVA): a coin you mine from the web, once a day
/// @notice How it works:
///  - Every day (00:00 to 24:00 UTC) the contract releases a fixed amount of
///    NOVA: the daily reward. It starts at 50,000 NOVA.
///  - Every wallet can mine once per day. When the day closes, that day's
///    reward is split among everyone who mined it, according to their
///    MINING POWER. There is no race: mining at 00:01 or at 23:59 is the same.
///  - Mining power goes from 1x (no NOVA) to 5x. It grows with the NOVA you
///    mined yourself and still hold, and reaches 5x when you hold two days'
///    worth of the daily reward (100,000 NOVA at the start). It follows a
///    square root, so the first coins help the most.
///    Only coins you mined count: NOVA sent to you by others doesn't raise
///    your power, so one balance can't be passed around to power many wallets.
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

    // Mining power, in hundredths: 100 = 1x, 500 = 5x
    uint256 public constant MIN_POWER       = 100;  // a wallet with no NOVA
    uint256 public constant MAX_POWER       = 500;  // the cap (5x)
    uint256 public constant FULL_POWER_DAYS = 2;    // hold 2 days of reward to reach the cap

    // ---------- Project data ----------
    address public immutable creator;   // whoever deployed the contract (starts with 0 NOVA)
    uint256 public immutable launchDay; // UTC day of deployment, counted from 1 Jan 1970
    string  public logoURI;             // link to the coin's logo

    // ---------- Miners ----------
    struct Miner {
        uint64 lastDay;  // last day (counted from launch) this wallet mined
        uint32 power;    // mining power it had that day (100 = 1x)
        bool   hasMined; // false until the wallet mines for the first time
        bool   paid;     // whether the share of lastDay has been paid
    }
    mapping(address => Miner)   public miners;
    mapping(address => uint256) public minedBy;      // NOVA each wallet has received from mining
    mapping(uint256 => uint256) public minersOnDay;  // day => how many wallets mined it
    mapping(uint256 => uint256) public powerOnDay;   // day => total mining power of that day

    // ---------- Stats ----------
    uint256 public totalMiners; // distinct wallets that have mined
    uint256 public totalMines;  // total number of mines

    event Mined(address indexed miner, uint256 indexed day, uint256 power);
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

        // Power is measured after that payment, so yesterday's share already counts
        uint256 power = miningPower(msg.sender);
        m.lastDay = uint64(day);
        m.power = uint32(power);
        m.paid = false;
        minersOnDay[day]++;
        powerOnDay[day] += power;
        totalMines++;
        emit Mined(msg.sender, day, power);
    }

    /// @notice Collect your share of the last day you mined, without mining again.
    function claim() external {
        Miner storage m = miners[msg.sender];
        require(m.hasMined && !m.paid && m.lastDay < today(), "Nova: nothing to claim");
        _pay(msg.sender, m);
    }

    function _pay(address who, Miner storage m) private {
        m.paid = true;
        uint256 amount = shareOf(m.lastDay, m.power);
        uint256 room = MAX_SUPPLY - totalSupply(); // safety net: never pass the cap
        if (amount > room) amount = room;
        if (amount > 0) {
            minedBy[who] += amount;
            _mint(who, amount);
        }
        emit Claimed(who, m.lastDay, amount);
    }

    // =========================================================
    //  Mining power
    // =========================================================

    /// @notice The power `user` would mine with right now (100 = 1x, 500 = 5x).
    ///         Counts only the NOVA they mined themselves and still hold.
    function miningPower(address user) public view returns (uint256) {
        uint256 held = Math.min(balanceOf(user), minedBy[user]);
        uint256 full = dailyReward(today()) * FULL_POWER_DAYS;
        if (full == 0 || held >= full) return MAX_POWER;
        // sqrt(held / full), scaled by 1e9
        uint256 root = Math.sqrt(held * 1e18 / full);
        return MIN_POWER + (MAX_POWER - MIN_POWER) * root / 1e9;
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

    /// @notice What a miner with `power` gets from `day`
    ///         (an estimate while the day is still open, as more people can join).
    function shareOf(uint256 day, uint256 power) public view returns (uint256) {
        uint256 total = powerOnDay[day];
        return total == 0 ? 0 : dailyReward(day) * power / total;
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
        return shareOf(m.lastDay, m.power);
    }

    /// @notice Everything the website shows about today, in one call.
    function info() external view returns (
        uint256 day,
        uint256 reward,
        uint256 minersToday,
        uint256 powerToday,
        uint256 closesAt,
        uint256 halvingDay,
        uint256 supply,
        uint256 allMiners,
        uint256 allMines
    ) {
        day = today();
        reward = dailyReward(day);
        minersToday = minersOnDay[day];
        powerToday = powerOnDay[day];
        closesAt = nextDayAt();
        halvingDay = nextHalvingDay();
        supply = totalSupply();
        allMiners = totalMiners;
        allMines = totalMines;
    }

    /// @notice Everything the website shows about one wallet, in one call.
    ///         `power` is today's power if the wallet already mined, otherwise
    ///         the power it would mine with now.
    function minerInfo(address user) external view returns (
        bool minedToday,
        uint256 lastDay,
        bool hasMined,
        uint256 claimableNow,
        uint256 shareToday,
        uint256 power,
        uint256 mined
    ) {
        Miner memory m = miners[user];
        minedToday = m.hasMined && m.lastDay == today();
        lastDay = m.lastDay;
        hasMined = m.hasMined;
        claimableNow = claimable(user);
        if (minedToday) {
            shareToday = shareOf(m.lastDay, m.power);
            power = m.power;
        } else {
            power = miningPower(user);
        }
        mined = minedBy[user];
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
