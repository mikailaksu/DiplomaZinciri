const IPFS = require('ipfs-api')
    /* eslint-disable */
import { default as contract } from 'truffle-contract'

// Import libraries we need.
import Web3 from 'web3'

// Import our contract artifacts and turn them into usable abstractions.
import CertifyContractArtifacts from '../../build/contracts/Certify.json'

//CertificationManager library
class CertificationManager {

    /**
     * Create a certification manager.
     * @constructor
     */
    constructor() {
        this.accounts = null;
        this.myAccount = null;
        this.certifyContract = null;
        this.certifyInstance = null;
        this.nodeIPFS = null;
        this.userRole = -1;
        this.web3 = null;
    }

    //add a JSON to IPFS. Using promises
    async _addJsonToIPFS(json) {
        let promise = new Promise((resolve, reject) => {
            var stringifyJSon = JSON.stringify(json);

            this.nodeIPFS.files.add({
                path: 'file.json',
                content: Buffer.from(stringifyJSon)
            }, (err, result) => {
                if (err) {
                    reject("Couldn't publish certification. Error: " + err)
                } else {
                    console.log('\nAdded file:', result[0].path, result[0].hash);
                    var fileMultihash = result[0].hash;
                    resolve(fileMultihash);
                }
            });
        });

        return await promise;
    }

    // retrieve json file from IPFS using the hash. Using promises 
    async _getJSonFromIPFS(ipfsHash) {

        let promise = new Promise((resolve, reject) => {
            this.nodeIPFS.files.cat(ipfsHash, (err, stream) => {
                if (err) {
                    reject(err);
                } else {
                    //var res = stream.toString('utf8'); olmuyo 
                    var json = eval("(" + stream.toString('utf8') + ")"); //res
                    resolve(json);
                }
            })
        });

        return await promise;
    }

    //Associates a IPFS hash to a insitution
    _associateInstitutionInfo(receiver, ipfsHash, callbackSuccess, callbackFailure) {
        var self = this;

        if (!self.web3.isAddress(receiver)) {
            if (callbackFailure) callbackFailure("Invalid Ethereum address.")
            return;
        }

        self.certifyInstance.addInstitution(receiver, ipfsHash, { from: self.myAccount }).then(function(txObj) {
            if (txObj && txObj.receipt && txObj.receipt.status === 0) {
                if (callbackFailure) callbackFailure("Couldn't associate institution info. Returning transaction with status = 0.");
            } else if (callbackSuccess)
                callbackSuccess(txObj, ipfsHash);
        }).catch(function(e) {
            if (callbackFailure) callbackFailure("Couldn't associate institution info. Error: " + e);
        });
    }

    //Associates a IPFS hash to a certification
    _associateCertificationToInstitution(ipfsHash, callbackSuccess, callbackFailure) {
        var self = this;

        self.certifyInstance.createCertification(ipfsHash, { from: self.myAccount }).then(function(txObj) {
            if (txObj && txObj.receipt && txObj.receipt.status === 0) {
                if (callbackFailure) callbackFailure("Couldn't associate certification to institution. Returning transaction with status = 0.");
            } else if (callbackSuccess)
                callbackSuccess(txObj, ipfsHash);
        }).catch(function(e) {
            if (callbackFailure) callbackFailure("Couldn't associate certification to institution. Error: " + e);
        });
    }


    /**
     * Initializes the CertificationManager library
     * @param {object} config - The config settings object to initialize the manager. Parameters: web3's provider.
     * @param {function} callbackSuccess - The callback function.
     */
    init(config, callbackSuccess) {
        var self = this;
        var web3 = window.web3

        if (config == null || config === undefined ||
            config.provider == null || config.provider === undefined) {
            if (typeof web3 !== 'undefined') {
                console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 ether, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
                    // Use Mist/MetaMask's provider
                web3 = new Web3(web3.currentProvider);
            } else {
                console.warn("No web3 detected.");
                // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
                web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
            }
        } else {
            window.web3 = new Web3(config.provider);
        }

        // certifyContract is our usable abstraction, which we'll use through the code below.
        self.certifyContract = contract(CertifyContractArtifacts);

        self.certifyContract.setProvider(web3.currentProvider);

        self.web3 = web3;
        //wait for accounts
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            var _self = self;
            //interval to check if selected account changes and need to update frontend
            setInterval(function() {
                if (_self.accounts.length !== _self.web3.eth.accounts.length ||
                    (_self.web3.eth.accounts.length > 0 && _self.web3.eth.accounts[0] !== _self.myAccount)) {
                    document.location.href = "/";
                }
            }, 300);

            //no accounts found
            if (accs.length === 0) {
                self.userRole = -1;
                self.accounts = [];
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            self.accounts = accs; //all accounts
            self.myAccount = accs[0]; //my account

            //initizalize IPFS
            self.nodeIPFS = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
            //get my role to draw dashboard
            self.certifyContract.deployed().then((instance) => {
                self.certifyInstance = instance;
                return self.certifyInstance.getMyRole({ from: self.myAccount })
            }).then((result) => {
                var role = result.toNumber();
                self.userRole = role;
                if (callbackSuccess) callbackSuccess();
            })
        });
    }

    /**
     * Add a new admin to the system.
     * @param {string} receiverAddress - The address of the admin.
     * @param {function} callbackSuccess - The callback function to be executed when the admin is registered successfully.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    addAdmin(receiverAddress, callbackSuccess, callbackFailure) {
        var self = this;

        if (!self.web3.isAddress(receiverAddress)) {
            if (callbackFailure) callbackFailure("Invalid Ethereum address.")
            return;
        }

        self.certifyInstance.addAdmin(receiverAddress, { from: self.myAccount }).then(function(txObj) {
            if (txObj && txObj.receipt && txObj.receipt.status === 0) {
                if (callbackFailure) callbackFailure("Couldn't add admin. Returning transaction with status = 0.");
            } else if (callbackSuccess)
                callbackSuccess(txObj);
        }).catch(function(e) {
            if (callbackFailure) callbackFailure("Couldn't add admin. Error: " + e);
        });
    }

    /**
     * Publish a new institution in IPFS and associate the hash to the institution address.
     * @param {string} receiverAddress - The address of the institution.
     * @param {object} json - The json representing the institution's info.
     * @param {function} callbackSuccess - The callback function to be executed when the insitution is registered successfully.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    addInstitution(receiverAddress, json, callbackSuccess, callbackFailure) {
        var self = this;

        if (!self.web3.isAddress(receiverAddress)) {
            if (callbackFailure) callbackFailure("Invalid Ethereum address.")
            return;
        }

        self._addJsonToIPFS(json).then((ipfsHash) => {
            self._associateInstitutionInfo(receiverAddress, ipfsHash, callbackSuccess, callbackFailure);
        });
    }

    /**
     * Publish a new certification in IPFS and associate the hash to the address.
     * @param {object} json - The json representing the certification.
     * @param {function} callbackSuccess - The callback function to be executed when the certification is registered successfully.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    createCertification(json, callbackSuccess, callbackFailure) {
        var self = this;

        self._addJsonToIPFS(json).then((ipfsHash) => {
            self._associateCertificationToInstitution(ipfsHash, callbackSuccess, callbackFailure)
        })
    }

    /**
     * Returns a the list of certifications created by an Institution
     * @param {function} callbackSuccess - The callback function to be executed when the list of certifications is retrieved successfully.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    getInstitutionCertifications(callbackSuccess, callbackFailure) {
        var self = this;

        var _list = [];
        var _totalCertifications;

        var _fnGetCertification = function(index) {
            if (_totalCertifications > _list.length) {
                self.certifyInstance.getInstitutionCertification(index, { from: self.myAccount }).then(function(ipfsHash) {
                    self._getJSonFromIPFS(ipfsHash)
                        .then(function(json) {
                            _list.push({ hash: ipfsHash, content: json });
                            _fnGetCertification(index + 1);
                        })
                        .catch(function(e) {
                            if (callbackFailure) callbackFailure("Couldn't get certification " + index + ". Error: " + e);
                        });
                });
            } else {
                if (callbackSuccess) callbackSuccess(_list);
            }
        }

        self.certifyInstance.getInstitutionCertificationsCount({ from: self.myAccount }).then(function(count) {
            _totalCertifications = count.toNumber();
            _fnGetCertification(0);
        }).catch(function(e) {
            if (callbackFailure) callbackFailure("Couldn't get number of certifications. Error: " + e);
        });
    }

    /**
     * Issue a certification to a student´s address and associate the hash to the address.
     * @param {string} receiverAddress - Student's address.
     * @param {string} ipfsHash - Certification's IPFS hash.
     * @param {Date} date - Issue date.
     * @param {number} score - Score with 2 decimals.
     * @param {function} callbackSuccess - The callback function to be executed when the certification is registered successfully.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    issueCertificacionToStudent(receiverAddress, ipfsHash, date, score, callbackSuccess, callbackFailure) {
        var self = this;

        self.certifyInstance.pricePerCertification({ from: self.myAccount }).then(function(weis) {
            self.certifyInstance.issueCertificacionToStudent(receiverAddress, ipfsHash, date.getTime(), score * 100, { from: self.myAccount, value: weis.toNumber() }).then(function(txObj) {
                if (txObj && txObj.receipt && txObj.receipt.status === 0) {
                    if (callbackFailure) callbackFailure("Öğrenciye sertifika verilemedi. Durum ile iade işlemi = 0.");
                } else if (callbackSuccess)
                    callbackSuccess(txObj, ipfsHash);
            }).catch(function(e) {
                if (callbackFailure) callbackFailure("Öğrenciye sertifika verilemedi. Hata: " + e);
            }).catch(function(e) {
                if (callbackFailure) callbackFailure("Sertifika başına fiyat alınamadı. Hata: " + e);
            });
        });
    }

    /**
     * Returns a the list of certifications issued to a Student
     * @param {function} callbackSuccess - The callback function to be executed when the list of certifications is retrieved successfully.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    getStudentCertifications(studentAddress, callbackSuccess, callbackFailure) {
        var self = this;

        var _list = [];
        var _totalCertifications;
        var _fnGetCertification = function(index) {
            if (_totalCertifications > _list.length) {
                self.certifyInstance.getStudentCertification(studentAddress, index, { from: self.myAccount }).then(function(result) {
                    self._getJSonFromIPFS(result[0])
                        .then(function(jsonCertification) {
                            self._getJSonFromIPFS(result[3])
                                .then(function(jsonInstitution) {
                                    _list.push({ hash: result[0], content: jsonCertification, issueDate: new Date(result[1].toNumber()), score: (result[2].toNumber() / 100.0), institution: jsonInstitution });
                                    _fnGetCertification(index + 1);
                                })
                                .catch(function(e) {
                                    if (callbackFailure) callbackFailure("Sertifika alınamadı " + index + ". Hata: " + e);
                                });
                        })
                        .catch(function(e) {
                            if (callbackFailure) callbackFailure("Sertifika alınamadı " + index + ". Hata: " + e);
                        });
                });
            } else {
                if (callbackSuccess) callbackSuccess(_list);
            }
        }

        self.certifyInstance.getStudentCertificationsCount(studentAddress, { from: self.myAccount }).then(function(count) {
            _totalCertifications = count.toNumber();
            _fnGetCertification(0);
        }).catch(function(e) {
            if (callbackFailure) callbackFailure("Sertifika sayısı alınamadı. Hata: " + e);
        });
    }

    /**
     * Withdraw funds from the contract to admin account
     * @param {number} eth - Ethers to be withdraw.
     * @param {function} callbackSuccess - The callback function to be executed when successfully withdrawed.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    withdraw(ether, callbackSuccess, callbackFailure) {
        var self = this;

        var wei = self.web3.toWei(ether, 'ether');

        self.certifyContract.deployed().then(function(contractself) {
            contractself.withdraw(wei, { from: self.myAccount }).then(function(txObj) {
                if (txObj && txObj.receipt && txObj.receipt.status === 0) {
                    if (callbackFailure) callbackFailure("Couldn't withdraw funds. Returning transaction with status = 0.");
                } else if (callbackSuccess)
                    callbackSuccess(txObj);
            }).catch(function(e) {
                if (callbackFailure) callbackFailure(e);
            });
        });
    }

    /**
     * Set the price in ether to be charged to institutions when registering a new certification
     * @param {number} ether - The amount in ether to be chared when registering a new certification.
     * @param {function} callbackSuccess - The callback function to be executed when successfully updated.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    setPrice(ether, callbackSuccess, callbackFailure) {
        var self = this;

        var wei = self.web3.toWei(ether, 'ether');

        self.certifyContract.deployed().then(function(contractself) {
            contractself.updatePricePerCertification(wei, { from: self.myAccount }).then(function(txObj) {
                if (txObj && txObj.receipt && txObj.receipt.status === 0) {
                    if (callbackFailure) callbackFailure("Couldn't set price. Returning transaction with status = 0.");
                } else if (callbackSuccess)
                    callbackSuccess(txObj);
            }).catch(function(e) {
                if (callbackFailure) callbackFailure(e);
            });
        });
    }


    /**
     * Set the visibility of the student's certications
     * @param {number} isPublic - Whether student's certifications will be public.
     * @param {function} callbackSuccess - The callback function to be executed when successfully updated.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    setStudentCertificationsPublicView(isPublic, callbackSuccess, callbackFailure) {
        var self = this;

        self.certifyContract.deployed().then(function(contractself) {
            contractself.setStudentCertificationsPublicView(isPublic, { from: self.myAccount }).then(function(txObj) {
                if (txObj && txObj.receipt && txObj.receipt.status === 0) {
                    if (callbackFailure) callbackFailure("Couldn't set visibility. Returning transaction with status = 0.");
                } else if (callbackSuccess)
                    callbackSuccess(txObj);
            }).catch(function(e) {
                if (callbackFailure) callbackFailure(e);
            });
        });
    }


    /**
     * Returns whether the student's certifications are public
     * @param {function} callbackSuccess - The callback function to be executed when the visibility is retrieved.
     * @param {function} callbackFailure - The callback function to be executed when an error occured.
     */
    getStudentCertificationsPublicView(callbackSuccess, callbackFailure) {
        var self = this;

        self.certifyInstance.getStudentCertificationsPublicView({ from: self.myAccount })
            .then(function(isPublic) {
                if (callbackSuccess) callbackSuccess(isPublic);
            }).catch(function(e) {
                if (callbackFailure) callbackFailure("Couldn't get visibility. Error: " + e);
            });
    }
}

window.CertificationManager = new CertificationManager();