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
import {IIntento} from "./core/interfaces/IIntento.sol";
/// libraries
import {Errors} from "./core/libraries/Errors.sol";
import {Native} from "./core/libraries/Native.sol";

contract Intento is
	IIntento,
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

	uint256 private constant bps = 10000;
	uint256 private fee;

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

	function initialize(address _owner, uint256 _fee) external initializer {
		__Intento_init(_owner);
		fee = _fee;
	}

	function __Intento_init(address _owner) internal onlyInitializing {
		__Ownable_init(_owner);
		fee = 100; // 1%
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
			enableds[i] = tokens[_account][_tokens[i]];

			unchecked {
				++i;
			}
		}
	}

	function getBalance(address _token) external view returns (uint256) {
		return _getBalance(_token, address(this));
	}

	function getFeeBps() external pure returns (uint256) {
		return bps;
	}

	function getFee() external view returns (uint256) {
		return fee;
	}

	function isRegistered(address _account) external view returns (bool) {
		return registry[_account];
	}

	/// =========================
	/// ======= Setters =========
	/// =========================

	function setFee(uint256 _fee) external onlyOwner {
		if (_fee > bps) revert INVALID_VALUE(_fee);
		fee = _fee;
	}

	function setTokens(
		address[] calldata _tokens,
		bool[] calldata _enableds
	) external {
		if (_tokens.length != _enableds.length) revert MISMATCH();

		for (uint256 i = 0; i < _tokens.length; ) {
			if (isZeroAddress(_tokens[i])) revert INVALID_ADDRESS(_tokens[i]);
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

	function calculateFee(uint256 _amount) external view returns (uint256) {
		return _calculateFee(_amount);
	}

	function executePayment(
		bytes calldata _orderId,
		address _from,
		address[] calldata _tokens,
		uint256[] calldata _amounts,
		bytes[] calldata _routes,
		bool _hasEns,
		bytes32 _polymarketMarketId,
		uint256 _polymarketTokenId
	) external payable onlyOwner {
		// 1. initial validations
		if (isZeroBytes(_orderId)) revert ZERO_BYTES();
		if (!registry[_from]) revert NOT_REGISTERED(_from);
		if (isZeroAddress(_from)) revert INVALID_ADDRESS(_from);
		if (_tokens.length != _amounts.length) revert MISMATCH();
		if (_amounts.length != _routes.length) revert MISMATCH();
		if (_polymarketMarketId == bytes32(0)) revert ZERO_BYTES();
		if (_polymarketTokenId == 0) revert INVALID_VALUE(_polymarketTokenId);

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
			if (isZeroBytes(data)) revert ZERO_BYTES();

			// 2.3 pull each token from user
			_pullFromUser(_from, _tokens[i], _amounts[i]);

			uint256 feeAmount = _calculateFee(_amounts[i]);
			_transferAmount(_tokens[i], owner(), feeAmount);

			// 2.4 if not has ENS, transfer fee to intent owner
			if (!_hasEns) {
				_transferAmount(_tokens[i], owner(), feeAmount);
			}

			// 2.5 ensure token approval
			_ensureTokenApproval(_tokens[i], approval, _amounts[i]);

			// 2.6 call router
			_callRouter(to, data, value);

			unchecked {
				++i;
			}
		}

		emit PaymentExecuted(_orderId, _from, _tokens, _amounts, _routes, _hasEns, _polymarketMarketId, _polymarketTokenId);
	}

	function recoverFunds(address _token, address _to) external onlyOwner {
		uint256 amount = _token == NATIVE
			? address(this).balance
			: IERC20(_token).balanceOf(address(this));

		_transferAmount(_token, _to, amount);
		emit FundsRecovered(_token, _to, amount);
	}

	function register(
		address[] calldata _tokens,
		bool[] calldata _enableds
	) external {
		if (registry[msg.sender]) revert ALREADY_REGISTERED(msg.sender);
		registry[msg.sender] = true;
		_setTokens(_tokens, _enableds);

		emit Registered(msg.sender, _tokens);
	}

	function unregister() external {
		if (!registry[msg.sender]) revert NOT_REGISTERED(msg.sender);
		registry[msg.sender] = false;

		emit Unregistered(msg.sender);
	}

	/// ===============================
	/// = Private / Internal Functions =
	/// ===============================

	function _calculateFee(uint256 _amount) internal view returns (uint256) {
		return (_amount * fee) / bps;
	}

	function _setTokens(
		address[] calldata _tokens,
		bool[] calldata _enableds
	) private {
		for (uint256 i = 0; i < _tokens.length; ) {
			if (!isZeroAddress(_tokens[i])) {
				tokens[msg.sender][_tokens[i]] = _enableds[i];
			}

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
