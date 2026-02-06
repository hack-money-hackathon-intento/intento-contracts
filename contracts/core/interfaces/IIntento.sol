// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IIntento {
	/// =========================
	/// ========= Events ========
	/// =========================

	event FundsRecovered(
		address indexed token,
		address indexed to,
		uint256 amount
	);

	event PaymentExecuted(
		bytes indexed orderId,
		address indexed from,
		address[] tokens,
		uint256[] amounts,
		bytes[] routes,
		bool hasEns
	);

	event Registered(address indexed account, address[] tokens);

	event TokensSet(address indexed account, address[] tokens, bool[] enableds);

	event Unregistered(address indexed account);

	/// =========================
	/// ======= Getters =========
	/// =========================

	function areTokensEnabled(
		address _account,
		address[] calldata _tokens
	) external view returns (bool[] memory enableds);

	function getBalance(address _token) external view returns (uint256);

	function getFeeBps() external view returns (uint256);

	function getFee() external view returns (uint256);

	function isRegistered(address _account) external view returns (bool);

	/// =========================
	/// ======= Setters =========
	/// =========================

	function setTokens(
		address[] calldata _tokens,
		bool[] calldata _enableds
	) external;

	/// ===============================
	/// = External / Public Functions =
	/// ===============================

	function executePayment(
		bytes calldata _orderId,
		address _from,
		address[] calldata _tokens,
		uint256[] calldata _amounts,
		bytes[] calldata _routes,
		bool _hasEns
	) external payable;

	function recoverFunds(address _token, address _to) external;

	function register(
		address[] calldata _tokens,
		bool[] calldata _enableds
	) external;

	function unregister() external;
}
