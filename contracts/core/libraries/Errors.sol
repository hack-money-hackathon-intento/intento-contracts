// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Errors {
	/// =========================
	/// ========= Errors ========
	/// =========================

	error ALREADY_REGISTERED(address _account);
	error INSUFFICIENT_BALANCE();
	error INSUFFICIENT_ALLOWANCE();
	error INVALID_ADDRESS(address _address);
	error INVALID_VALUE(uint256 _value);
	error MISMATCH();
	error NATIVE_TOKEN_NOT_SUPPORTED();
	error NOT_REGISTERED(address _account);
	error TOKEN_NOT_ENABLED(address _account, address _token);
	error TRANSFER_FAILED();
	error ZERO_BYTES();

	function isZeroAddress(address _address) internal pure returns (bool) {
		return _address == address(0);
	}

	function isZeroBytes(bytes memory _bytes) internal pure returns (bool) {
		return _bytes.length == 0;
	}
}
