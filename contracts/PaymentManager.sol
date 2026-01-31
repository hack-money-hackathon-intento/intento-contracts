// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// third party
/// openzeppelin
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// local
/// interfaces
import {IPaymentManager} from "./core/interfaces/IPaymentManager.sol";
/// libraries
import {Errors} from "./core/libraries/Errors.sol";
import {Native} from "./core/libraries/Native.sol";

contract PaymentManager is
	IPaymentManager,
	Initializable,
	OwnableUpgradeable,
	Native,
	Errors
{
	using SafeERC20 for IERC20;

	/// =========================
	/// === Storage Variables ===
	/// =========================

	mapping(address => bool) private registry;
	mapping(address => mapping(address => bool)) private tokens;

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

	function __PaymentManager_init() internal onlyInitializing {
		__Ownable_init(msg.sender);
	}

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

	function getBalance(address _token) external view returns (uint256) {
		return _getBalance(_token, address(this));
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
		if (_tokens.length != _enableds.length) revert MISMATCH();

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

	function executePayment(
		address _from,
		address[] calldata _tokens,
		uint256[] calldata _amounts,
		bytes[] calldata _routes
	) external onlyOwner {
		// 1. initial validations
		if (isZeroAddress(_from)) revert INVALID_ADDRESS(_from);
		if (_tokens.length != _amounts.length) revert MISMATCH();
		if (_amounts.length != _routes.length) revert MISMATCH();

		for (uint256 i = 0; i < _tokens.length; ) {
			// 2.1 validates
			if (!tokens[_from][_tokens[i]])
				revert TOKEN_NOT_ENABLED(_from, _tokens[i]);

			if (isZeroBytes(_routes[i])) revert ZERO_BYTES();

			// 2.2 decode Li.fi route
			(address to, address approval, uint256 value, bytes memory data) = abi
				.decode(_routes[i], (address, address, uint256, bytes));

			if (isZeroAddress(to)) revert INVALID_ADDRESS(to);
			if (isZeroAddress(approval)) revert INVALID_ADDRESS(approval);
			if (value != 0) revert INVALID_VALUE(value);
			if (isZeroBytes(data)) revert ZERO_BYTES();

			// 2.3 pull each token from user
			_pullFromUser(_from, _tokens[i], _amounts[i]);

			// 2.4 ensure token approval
			_ensureTokenApproval(_tokens[i], approval, _amounts[i]);

			// 2.5 call router
			_callRouter(to, data, value);

			unchecked {
				++i;
			}
		}
	}

	function recoverFunds(address _token, address _to) external onlyOwner {
		uint256 amount = _token == NATIVE
			? address(this).balance
			: IERC20(_token).balanceOf(address(this));

		_transferAmount(_token, _to, amount);
		emit FundsRecovered(_token, _to, amount);
	}

	function register(address[] calldata _tokens) external {
		if (registry[msg.sender]) revert ALREADY_REGISTERED(msg.sender);
		registry[msg.sender] = true;
		_setTokens(_tokens);

		emit Registered(msg.sender, _tokens);
	}

	/// ===============================
	/// = Private / Internal Functions =
	/// ===============================

	function _setTokens(address[] calldata _tokens) private {
		for (uint256 i = 0; i < _tokens.length; ) {
			if (isZeroAddress(_tokens[i])) revert INVALID_ADDRESS(_tokens[i]);
			tokens[msg.sender][_tokens[i]] = true;

			unchecked {
				++i;
			}
		}
	}

	function _pullFromUser(
		address _from,
		address _token,
		uint256 _amount
	) private {
		if (_amount == 0) revert INVALID_VALUE(_amount);

		if (_token == NATIVE) {
			revert NATIVE_TOKEN_NOT_SUPPORTED();
		} else {
			if (IERC20(_token).balanceOf(_from) < _amount)
				revert INSUFFICIENT_BALANCE();
			if (IERC20(_token).allowance(_from, address(this)) < _amount)
				revert INSUFFICIENT_ALLOWANCE();

			IERC20(_token).safeTransferFrom(_from, address(this), _amount);
		}
	}

	function _ensureTokenApproval(
		address _token,
		address _spender,
		uint256 _amount
	) private {
		uint256 allowed = IERC20(_token).allowance(address(this), _spender);
		if (allowed < _amount) {
			IERC20(_token).forceApprove(_spender, 0);
			IERC20(_token).forceApprove(_spender, _amount);
		}
	}

	function _callRouter(
		address _to,
		bytes memory _data,
		uint256 _value
	) private {
		(bool success, bytes memory response) = _to.call{value: _value}(_data);
		if (!success) _bubbleRevert(response);
	}

	function _bubbleRevert(bytes memory response) private pure {
		if (response.length == 0) revert TRANSFER_FAILED();

		assembly {
			revert(add(response, 32), mload(response))
		}
	}

	function _getBalance(
		address _token,
		address _account
	) internal view returns (uint256) {
		if (_token == NATIVE) {
			return payable(_account).balance;
		} else {
			return IERC20(_token).balanceOf(_account);
		}
	}

	function _transferAmount(
		address _token,
		address _to,
		uint256 _amount
	) internal virtual {
		if (_token == NATIVE) {
			(bool success, ) = _to.call{value: _amount}("");
			if (!success) revert TRANSFER_FAILED();
		} else {
			IERC20(_token).safeTransfer(_to, _amount);
		}
	}
}
