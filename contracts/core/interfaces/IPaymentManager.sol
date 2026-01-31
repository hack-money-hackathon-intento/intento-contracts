// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IPaymentManager {
	/// =========================
	/// ========= Events ========
	/// =========================

	event Registered(address indexed account);
	event TokensSet(address indexed account, address[] tokens, bool[] enableds);

	/// =========================
	/// ======= Getters =========
	/// =========================

	function areTokensEnabled(
		address _account,
		address[] calldata _tokens
	) external view returns (bool[] memory enableds);

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

	function register() external;
}
