var Certify = artifacts.require("./Certify.sol");

contract('Certify', function(accounts) {

  var adminAccount = accounts[0];
  var institutionAccount  = accounts[1];
  var studentAccount  = accounts[2];

  var institutionInfoIpfsHash = "123456";
  var certificationInfoIpfsHash = "943827942";

  var pricePerCertification = 0.05; //in ethers

  /* Test 1
  * Check if the admin role was associated to account 0
  */
  it("Test 1. Checking Admin Role.", function() {
    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;

      return certifyInstance.getMyRole.call({from: adminAccount});
    }).then(function(role) {
      assert.equal(role, 1, "Account 0 should be Admin");
    });
  });

  /* Test 2
  * Add a new admin account
  */
 it("Test 2. Adding Admin (by admin)", function() {
    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;
      return certifyInstance.addAdmin(accounts[3], {from: adminAccount});
    }).then(function() {
      return certifyInstance.getRole.call(accounts[3], {from: adminAccount});
    }).then(function(role) {
      assert.equal(role, 1, "Account 3 should be Admin now");
    });
  });

  /* Test 3
  * Adding a new institution
  */
 it("Test 3. Creating a new Institution (by admin)", function() {
    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;
      
      return certifyInstance.addInstitution(institutionAccount, institutionInfoIpfsHash, {from: adminAccount});
    }).then(function() {
      return certifyInstance.getMyRole.call({from: institutionAccount});
    }).then(function(role) {
      assert.equal(role, 2, "Account 1 should be Institution");
    });
  });

  /* Test 4
  * Check if the admin role was associated to account 0
  */
 it("Test 4. Creating a new Certification (by institution).", function() {
    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;
      
      return certifyInstance.createCertification(certificationInfoIpfsHash, {from: institutionAccount});
    }).then(function() {
      return certifyInstance.getInstitutionCertificationsCount.call({from: institutionAccount});
    }).then(function(count) {
      assert.equal(count, 1, "There should be 1 certification for Institution 1");
      return certifyInstance.getInstitutionCertification.call(0,{from: institutionAccount});
    }).then(function(ipfsHashInfo) {
      assert.equal(ipfsHashInfo, certificationInfoIpfsHash, "Certification's ipfsh hash doesn't match.");
    });
  });

  /* Test 5
  * Check if the admin role was associated to account 0
  */
  it("Test 5. Check invalid account", function() {
    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;
      
      return certifyInstance.getMyRole( {from: studentAccount});
    }).then(function(role) {
      assert.equal(role, 0, "Account should have Invalid role");
    });
  });

  /* Test 6
  * Update cost for issuing certification (by admin)
  */
  it("Test 6. Updating price per certification", function() {
    
    var wei =  web3.utils.toWei('0.05','ether');

    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;
      return certifyInstance.updatePricePerCertification(wei, {from: adminAccount});
    }).then(function() {
      
    })
  });

  /* Test 7
  * Issue existing certification to student
  */
  it("Test 7. Issuing Certification to Student (by institution)", function() {  
    var wei =  web3.utils.toWei('0.05','ether');

    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;
      debugger
      return certifyInstance.getMyRole( {from: studentAccount});
    }).then(function(role) {
      const issueDate = new Date(2018, 6, 15);
      assert.equal(role, 0, "Student's role should be Invalid at this point");
      return certifyInstance.issueCertificacionToStudent(studentAccount, certificationInfoIpfsHash, issueDate.getTime(), 6.33*100, {from: institutionAccount, value: wei});
    }).then(function() {
      return web3.eth.getBalance(certifyInstance.address);
    }).then(function(balance){
      return certifyInstance.getMyRole( {from: studentAccount});
    }).then(function(role) {
      assert.equal(role.toNumber(), 3, "Student's role should be valid now.");
      return certifyInstance.getStudentCertificationsCount.call(studentAccount, {from: studentAccount});
    }).then(function(count) {
      assert.equal(count, 1, "Student should have 1 certification.");
      return certifyInstance.getStudentCertification.call(studentAccount, 0, {from: studentAccount});
    }).then(function(certification) {
      assert.equal(certification[0], certificationInfoIpfsHash, "Student's certification doesn't match.");
    });
  });

  
  /* Test 8
  * Withdraw funds from contract (by admin)
  */
  it("Test 8. Withdrawing funds.", function() {
    
    var wei =  web3.utils.toWei('0.05','ether');

    var _initialBalance;
    return Certify.deployed().then(function(instance) {
      certifyInstance = instance;
      return web3.eth.getBalance(adminAccount)
    }).then(function(balance){
      _initialBalance = balance.toNumber();
      return certifyInstance.withdraw(wei, {from: adminAccount});
    }).then(function() {
      return web3.eth.getBalance(adminAccount)
    }).then(function(balance){
      if(balance.toNumber()<= _initialBalance) throw("new balance should be greater"); //not considering gas used in transaction    
    })
  });
});
