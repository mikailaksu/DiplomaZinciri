pragma solidity ^0.5.0;

import "./Utils.sol";
import "./SafeMath.sol";

/** @title DCertify: issuing certifications on the blockchain. */
contract Certify {        
    using SafeMath for uint256;

    //Modifiers
    modifier stoppedInEmergency  {require(!isStopped); _;}
    modifier onlyWhenStopped {require(isStopped); _;}
    
    modifier isAdmin() {require(userRoles[msg.sender] == Utils.UserRole.Admin); _;} //check if address is administrator
    modifier isInstitution() {require(userRoles[msg.sender] == Utils.UserRole.Institution); _;} //check if address is institution
    modifier isStudent() {require(userRoles[msg.sender] == Utils.UserRole.Student); _;} //check if address is student
    modifier isRoleInvalid(address _addr) {require(userRoles[_addr] == Utils.UserRole.Invalid); _;} //check if address doesn't have role -> invalid

    modifier certificationNotExists(string memory _ipfsHash) {require(mapCertificationInstitution[_ipfsHash] == address(0x0)); _;}  //check if certification doesn´t exist
    modifier certificationExists(string memory _ipfsHash) {require(mapCertificationInstitution[_ipfsHash] != address(0x0)); _;} //check if certification exists
    
    modifier enoughPay() {require(msg.value >= pricePerCertification); _;} //check if value sent is enough to pay for issuing certification
    
    //Variables
    bool private isStopped; //emergency stop

    mapping (address => Utils.UserRole) private userRoles; // map of addresses and roles
    mapping (address => Utils.Institution) private mapInstitutions; // map of addresseses and institutions
    mapping (address => Utils.Student) private mapStudents; // map of addresses and students
    
    mapping (string => address) private mapCertificationInstitution; // map of IPFS hashes and institutions' addresses

    uint public pricePerCertification; // price to issue certification

    //Events
    event AdminAdded(address _address);
    event InstitutionAdded(address _address, string _ipfshHash);
    event CertificationCreated(address _addressInstitution, string _ipfshHash);
    event CertificationIssued(address _addressInstitution, string _ipfshHash, address _addressStudent);

    /* constructor
    Set the sender as administrator
    Initialize the price of issuing a certification
    Emergency stop disabled
    */
    constructor() public {
        userRoles[msg.sender] = Utils.UserRole.Admin; //creator is first Admin
        pricePerCertification = 1000000000000000; //wei
        isStopped = false;
    }

    /** @dev Stop contract
        */
    function stopContract() public isAdmin {
        isStopped = true;
    }

    /** @dev Resume contract
        */
    function resumeContract() public isAdmin {
        isStopped = false;
    }

    /** @dev Returns the role associate to the sender´s address
        * @return _role The user's role
        */
    function getMyRole() public view returns (uint _role) {
        return uint(userRoles[msg.sender]);
    }

    /** @dev Returns the role associate to the address passed as parameter
        * @param _addr User's address.
        * @return _role The user's
        */
    function getRole(address _addr) public view returns (uint _role) {
        return uint(userRoles[_addr]);
    }

    /** @dev Add a new administrator to the system. Only accesible to administrators. Address not associated to another role.
        * @param _addrNewAdmin New admin's address.
        */
    function addAdmin(address _addrNewAdmin) public isAdmin isRoleInvalid(_addrNewAdmin) stoppedInEmergency{
        userRoles[_addrNewAdmin] = Utils.UserRole.Admin;
        emit AdminAdded(_addrNewAdmin);
    }

    /** @dev Add a new institution to the system. Only accesible to administrators. Address not associated to another role.
        * @param _addrInstitution New institution's address.
        * @param _ipfsHashInfo IPFS hash with institution's info.
        */
    function addInstitution(address _addrInstitution, string memory _ipfsHashInfo) public isAdmin isRoleInvalid(_addrInstitution) stoppedInEmergency {
        Utils.Institution memory _institution = Utils.Institution({ ipfsHashInfo: _ipfsHashInfo, certificationsIpfsHash: new string[](0)});
        mapInstitutions[_addrInstitution] = _institution;
        userRoles[_addrInstitution] = Utils.UserRole.Institution;
        emit InstitutionAdded(_addrInstitution, _ipfsHashInfo);
    }

    /** @dev Create a new institution in the system. Only accesible to institutions. IFSH not associated to another certification.
        * @param _ipfsHash IPFS hash with certification's info.
        */
    function createCertification(string memory _ipfsHash) public isInstitution certificationNotExists (_ipfsHash) stoppedInEmergency {
        mapCertificationInstitution[_ipfsHash] = msg.sender;
        mapInstitutions[msg.sender].certificationsIpfsHash.push(_ipfsHash);
        emit CertificationCreated(msg.sender, _ipfsHash);
    }

    /** @dev Returns the number of certifications created by an institution. Only accesible to institutions
        * @return _count Number of certifications
        */
    function getInstitutionCertificationsCount() public view isInstitution returns (uint _count) {
        return mapInstitutions[msg.sender].certificationsIpfsHash.length;
    }

    /** @dev Returns the a certification created by an institution. Only accesible to institutions
        * @param _index Index of the certification to be retrieved
        * @return _ipfsHash IPFS hash associated to a certification
        */
    function getInstitutionCertification(uint _index) public view isInstitution returns (string memory _ipfsHash) {
        require(mapInstitutions[msg.sender].certificationsIpfsHash.length>_index);
        return (mapInstitutions[msg.sender].certificationsIpfsHash[_index]);
    }

    /** @dev Issue a previously created certification to an address. Only accesible to institutions. Value >= price. Certification exists. Address is student or invalid.
        * @param _addrStudent Address that the certification will be issued to
        * @param _ipfsHash IPFSH hash identifying a certification
        * @param _timeMiliseconds Issue date in miliseconds since 1/1/1970
        * @param _score Scored obtained multiplied by 100 (2 decimals)
        */
    function issueCertificacionToStudent(address _addrStudent, string memory _ipfsHash, uint _timeMiliseconds, uint _score) public payable isInstitution enoughPay certificationExists(_ipfsHash) stoppedInEmergency {
        require(userRoles[_addrStudent] == Utils.UserRole.Student || userRoles[_addrStudent] == Utils.UserRole.Invalid);       
        Utils.Student storage _student = mapStudents[_addrStudent];        
        require(_student.hasCertification[_ipfsHash] == false);
        userRoles[_addrStudent] = Utils.UserRole.Student;       
        _student.hasCertification[_ipfsHash] = true; 
        _student.certificationsReceived.push(Utils.StudentCertification(_ipfsHash, _timeMiliseconds, _score));
        msg.sender.transfer(msg.value.sub(pricePerCertification));
        emit CertificationIssued(msg.sender, _ipfsHash, _addrStudent);
    }

    /** @dev Returns the number of certifications issued to a student. Only accesible to student or everyone if allowed
        * @return _count Number of certifications
        */
    function getStudentCertificationsCount(address _addrStudent) public view returns (uint) {
        require(msg.sender == _addrStudent || mapStudents[_addrStudent].allowPublicView == true);
        return mapStudents[_addrStudent].certificationsReceived.length;
    }

    /** @dev Returns the a certification issued to a student. Only accesible to student or everyone if allowed
        * @param _index Index of the certification to be retrieved
        * @return _ipfsHash IPFS hash associated to a certification
        */
    function getStudentCertification(address _addrStudent, uint _index) public view returns (string memory ipfsHash, uint timeMiliseconds, uint score, string memory ipfsHashInstitutionInfo) {   
        require(userRoles[_addrStudent] == Utils.UserRole.Student);
        require(msg.sender == _addrStudent || mapStudents[_addrStudent].allowPublicView == true);
        require(mapStudents[_addrStudent].certificationsReceived.length>_index);
        Utils.StudentCertification storage _certification = mapStudents[_addrStudent].certificationsReceived[_index];
        return (_certification.ipfsHash, _certification.issueTimeMiliseconds, _certification.score, mapInstitutions[mapCertificationInstitution[_certification.ipfsHash]].ipfsHashInfo);
    }
    

    /** @dev Returns true if students made certifications public for everyone
        * @return _publicView Whether student's certifications are public
        */
    function getStudentCertificationsPublicView() view public isStudent returns (bool _publicView) {
        return mapStudents[msg.sender].allowPublicView;
    }

    /** @dev Allow or deny public access to the list of certifications issued to a student. Only accesible to student.
        * @param _publicView Allow public access to student´s certifications
        */
    function setStudentCertificationsPublicView(bool _publicView) public isStudent stoppedInEmergency {
        mapStudents[msg.sender].allowPublicView = _publicView;
    }

    /** @dev Set the price of issuing a certification. Only accesible to administrators
        * @param _wei New price.
        */
    function updatePricePerCertification(uint _wei) public isAdmin stoppedInEmergency {
        pricePerCertification = _wei;
    }

    /** @dev Withdraw funds in contract to admin address. Only accesible to admins. Check account has enough balance
        * @param _wei Amount to be withdrawed
        */
    function withdraw(uint _wei) public isAdmin stoppedInEmergency {
        require(address(this).balance>=_wei);
        msg.sender.transfer(_wei);
    }
}