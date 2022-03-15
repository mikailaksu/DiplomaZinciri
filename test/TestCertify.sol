pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Certify.sol";

contract TestCertify {
    Proxy public proxyInstitution;
    Proxy public proxyStudent;
    Proxy public proxyAdmin;
    Certify certify;

    constructor() public {
        certify = new Certify();

        proxyAdmin = new Proxy(certify);
        proxyInstitution = new Proxy(certify);
        proxyStudent = new Proxy(certify);
    }

    function testCheckAdminRole() public{
        Assert.equal(certify.getRole(msg.sender), 0, "Account 0 should be Admin");
    }
    
    function testAddAdmin() public {
        certify.addAdmin(address(proxyAdmin));
        Assert.equal(certify.getRole(address(proxyAdmin)), 1, "ProxyAdmin should be Admin");
    }
}

contract Proxy {
  Certify public certify;

  constructor(Certify _certify) public {
    certify = _certify;
  }
}