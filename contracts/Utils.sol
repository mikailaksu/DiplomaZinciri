pragma solidity ^0.5.0;

/** @title Utils: enums and structs useful for DCertify smart contract. */
library Utils {

    enum UserRole { Invalid, Admin, Institution, Student }
    
    //institution
    struct Institution {
        string ipfsHashInfo; // IPFS hash of file with info
        string[] certificationsIpfsHash; // array of IPFS hashes of certifications created by institution
    }

    //certification issued to student with additional info
    struct StudentCertification {
        string ipfsHash; // IPFS hash of file with info
        uint issueTimeMiliseconds; //issue date in miliseconds since 1/1/1970
        uint score; // score multiplied by 100 (2 decimals)
    }

    //student
    struct Student {
        StudentCertification[] certificationsReceived; // student's certifications
        mapping (string => bool) hasCertification; // map to check if student has certification without iterating array above
        bool allowPublicView; // whether other users can view student's certifications
    }
}