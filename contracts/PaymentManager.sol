// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// third party
/// openzeppelin
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

// local
/// interfaces
import {IPaymentManager} from "./core/interfaces/IPaymentManager.sol";

contract PaymentManager is
	IPaymentManager,
	Initializable,
	OwnableUpgradeable,
	ReentrancyGuardUpgradeable
{
	/// =========================
	/// ========= Errors ========
	/// =========================

	error ALREADY_REGISTERED(address _account);
	error INVALID_LENGTH(address _account, address[] _tokens, bool[] _enableds);

	/// =========================
	/// === Storage Variables ===
	/// =========================

	mapping(address => bool) public registry;
	mapping(address => mapping(address => bool)) public tokens;

	/// =========================
	/// ====== Constructor ======
	/// =========================

	/// @custom:oz-upgrades-unsafe-allow constructor

	constructor() {
		_disableInitializers();
	}

	/// =========================
	/// ====== Initializer ======
	/// =========================

	// function __PaymentManager_init() internal onlyInitializing {}

	receive() external payable {}

	fallback() external payable {}

	/// =========================
	/// ======= Getters =========
	/// =========================

	function areTokensEnabled(
		address _account,
		address[] calldata _tokens
	) external view returns (bool[] memory enableds) {
		enableds = new bool[](_tokens.length);

		for (uint256 i = 0; i < _tokens.length; ) {
			if (!tokens[_account][_tokens[i]]) {
				enableds[i] = false;
				unchecked {
					++i;
				}
				continue;
			}

			unchecked {
				++i;
			}

			enableds[i] = true;
		}
	}

	function isRegistered(address _account) external view returns (bool) {
		return registry[_account];
	}

	/// =========================
	/// ======= Setters =========
	/// =========================

	function setTokens(
		address[] calldata _tokens,
		bool[] calldata _enableds
	) external {
		if (_tokens.length != _enableds.length)
			revert INVALID_LENGTH(msg.sender, _tokens, _enableds);

		for (uint256 i = 0; i < _tokens.length; ) {
			tokens[msg.sender][_tokens[i]] = _enableds[i];

			unchecked {
				++i;
			}
		}

		emit TokensSet(msg.sender, _tokens, _enableds);
	}

	/// ===============================
	/// = External / Public Functions =
	/// ===============================

	function register() external {
		if (registry[msg.sender]) revert ALREADY_REGISTERED(msg.sender);
		registry[msg.sender] = true;
		emit Registered(msg.sender);
	}
}
