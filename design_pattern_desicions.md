# Design Pattern Decisions

**1. Withdrawal pattern**

I have used the withdrawal pattern instead of sending ether paid for issuing certifications directly to administrators. This pattern was chosen for 2 reasons:
- Save gas by avoiding sending funds with every certification issuance
- Avoid security risks where an admin could produce all issue transactions to be rejected if funds transfer fails

**2. Restricting Access**

There are 3 different roles and each role have their permissions and capabilities:
- Admins:
    - can add other admins
    - can add institutions 
    - can update cost of issuing a certification
- Institutions:
    - can add certifications
    - can issue certifications to students
    - can view their certifications
- Students:
    - can view the list of certifications they have received
    - can decide whether they want to make their certifications public or not

**3. Storing data in IPFS**

Blockchain shouldn't be used to store large amount of data. TO avoid this, the system uses IPFS to store info in json format and store only the hash in the blockchain. Then it uses this IPFS hash to retrieve the files from IPFS.

**4. Emergency Stop** 

I have added an option to disable critical contract functionality in case of an emergency. Critical funcionalities such as: add admin, add institution, issue certification, update issuing price, or withdraw funds.
