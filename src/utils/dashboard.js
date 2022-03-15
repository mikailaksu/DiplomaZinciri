import React, { Component } from 'react'
import { Link, Route } from 'react-router-dom';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import moment from 'moment';
 
import 'react-datepicker/dist/react-datepicker.css';
// Import the certifications manager
import './certification-manager.js';

const customStylesModal = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      minHeight             : '400px',
      minWidth              : '600px'
    }
};

// binding modal to app
Modal.setAppElement('#root')

//add institution component
class AddInstitution extends React.Component {

    constructor(props) {
        super(props);
        this.manager = this.props.manager;
        this.addInstitution = this.addInstitution.bind(this);
    }

    addInstitution() {
        const _name = document.getElementById("name").value;
        const _address = document.getElementById("address").value;
        const _institutionJSON = {name: _name, address: _address};
        this.manager.addInstitution(_address, _institutionJSON, function(tx, ipfsHash){
            console.log((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            alert((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
        });     
    }

    render() {  
        return (
            <div>
                <h2>Üniversite Ekle</h2>
                <table>
                    <tbody>
                        <tr>
                            <td>ETH Adresi:</td>
                            <td><input id="address"/></td>
                        </tr>
                        <tr>
                            <td>Kurum Ad:</td>
                            <td><input id="name"/></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={() => this.addInstitution()}>Ekle</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

//add admin component
class AddAdmin extends React.Component {

    constructor(props) {
        super(props);
        this.manager = this.props.manager;
        this.addAdmin = this.addAdmin.bind(this);
    }

    addAdmin() {
        const _address = document.getElementById("address").value;
        this.manager.addAdmin(_address, function(tx){
            console.log((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            alert((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
        });         
    }

    render() {  
        return (
            <div>
                <h2>Yönetici Ekle</h2>
                <table>
                    <tbody>
                        <tr>
                            <td>ETH Adresi:</td>
                            <td><input id="address"/></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={() => this.addAdmin()}>Ekle</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

//set price component
class SetPrice extends React.Component {

    constructor(props) {
        super(props);
        this.manager = this.props.manager;
        this.setPrice = this.setPrice.bind(this);
    }

    setPrice() {
        const _ether = Number(document.getElementById("price").value);
        this.manager.setPrice(_ether, 
        function(tx){
            console.log((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            alert((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
        }, function(error) {
            console.error("We couldn't udpate price: " + error);
        });         
    }

    render() {  
        return (
            <div>
                <h2>Birim Fiyat Güncelle</h2>
                <table>
                    <tbody>
                        <tr>
                            <td>Yeni Fiyat (Ether):</td>
                            <td><input id="price"/></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={() => this.setPrice()}>Güncelle</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

//add certification component
class AddCertification extends React.Component {

    constructor(props) {
        super(props);
        this.manager = this.props.manager;
        this.createCertification = this.createCertification.bind(this);
    }

    createCertification() {
        const _name = document.getElementById("name").value;
        const _description = document.getElementById("description").value;
        const _badge = document.getElementById("badge").value;
        const _certificationJSON = {name: _name, description: _description, badge: _badge};
        const _self = this;
        this.manager.createCertification(_certificationJSON, function(tx, ipfsHash){
            console.log((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            alert((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            document.location.href="/";
        });     
    }

    render() {  
        return (
            <div>
                <h2>Diploma Oluştur</h2>
                <table>
                    <tbody>
                        <tr>
                            <td>Program Ad:</td>
                            <td><input id="name"/></td>
                        </tr>
                        <tr>
                            <td>Açıklama:</td>
                            <td><textarea id="description"></textarea></td>
                        </tr>
                        <tr>
                            <td>Diploma Resim URL:</td>
                            <td><input id="badge"/></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={() => this.createCertification()}>Oluştur</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

//Institution's certification info component
class CertificationInfo extends React.Component {

    constructor(props){
        super(props);
        this.info = this.props.info.content;
    }

    render() {          
        return (           
            <table>
                <tbody>
                    <tr>
                        <td style={{verticalAlign: 'top'}}><img src={this.info.badge} alt="Bulunamadı" height="80"/></td>
                        <td style={{verticalAlign: 'top'}}>
                            <div><b>{this.info.name}</b></div>
                            <div><i>{this.info.description}</i></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}

//list institution's created certifications
class InstitutionCertifications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {certifications: [], modalIsOpen: false};
        this.manager = this.props.manager;
        this.container = document.getElementById("certificationsContainer");       
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        
        const _this = this;
        this.manager.getInstitutionCertifications(function(list){
            _this.setState({certifications: list});
        })
    }
    
    openModal(certification) {
        this.setState({modalIsOpen: true, certificationSelected: certification});
    }
    
    afterOpenModal() {
    }
    
    closeModal() {
        this.setState({modalIsOpen: false});
    }

    render() {
        const certComponents = [];
        for(let i=0;i<this.state.certifications.length;i++) {
            certComponents.push(<div key={i} style={{border: '1px solid black', padding: '10px', marginBottom: '5px'}}><CertificationInfo info={this.state.certifications[i]} /><button onClick={() => this.openModal(this.state.certifications[i])}>Öğrenciye Ver!</button></div>);
        }

        return (
            <div>
                <h2>DİPLOMALARIM: </h2>
                <div id="certificationsContainer">
                    {certComponents}
                </div>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStylesModal}>
            
                    <h2 ref={subtitle => this.subtitle = subtitle}>Öğrenci Diploma Oluştur</h2>
                    {
                        this.state.certificationSelected ?
                        <IssueCertification certification={this.state.certificationSelected} manager={this.manager}/> :
                        <div></div>
                    }
                    <br />
                    <button onClick={this.closeModal} style={{float: 'right'}}>Kapat</button>
                </Modal>
            </div>
        )
    }
}

//issue certification to student
class IssueCertification extends React.Component {

    constructor(props) {
        super(props);
        this.issueCertification = this.issueCertification.bind(this);
        this.certification = this.props.certification;
        this.manager = this.props.manager;
        this.handleDateChange = this.handleDateChange.bind(this);
        this.state = {
            issueDate: moment()
        };
    }
   
    handleDateChange(moment) {
      this.setState({
        issueDate: moment
      });
    }

    issueCertification() {
        const _certificationIpfsHash = this.certification.hash;
        const _addrStudent = document.getElementById("studentAddress").value;
        const _date = new Date(this.state.issueDate.toDate());
        const _score = document.getElementById("score").value;
        this.manager.issueCertificacionToStudent (_addrStudent, _certificationIpfsHash, _date, _score, function(tx, ipfsHash){
            console.log((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            alert((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
        });     
    }

    render() {  
        return (            
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>Diploma Programı:</td>
                            <td><span>{this.certification.content.name}</span></td>
                        </tr>
                        <tr>
                            <td>Öğrenci ETH Adresi:</td>
                            <td><input id="studentAddress" placeholder='Ör: , 0xfb703Fe989C99B36945B9CD91Db6b85D012d8057'/></td>
                        </tr>
                        <tr>
                            <td>Mezuniyet Tarihi:</td>
                            <td><DatePicker id="issueDate" selected={this.state.issueDate} onChange={this.handleDateChange}/></td>
                        </tr>
                        <tr>
                            <td>Ortalama:</td>
                            <td><input type="number" id="score" placeholder='Ör: , 3.98'/></td>
                        </tr>
                        <tr>
                            <td colSpan={2}><button onClick={() => this.issueCertification()}>Diploma Oluştur</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

//student's certification info component
class StudentCertificationInfo extends React.Component {

    constructor(props){
        super(props);
        this.certificationInfo = this.props.info.content;
        this.score = this.props.info.score;
        this.issueDate = this.props.info.issueDate;
        this.institution = this.props.info.institution;
    }

    render() {          
        return (
            <div>
                
                <table>
                    <tbody>
                        <tr>
                            <td style={{verticalAlign: 'top', width: '100%'}}>
                                <div><b>Ad:</b>{this.certificationInfo.name}</div>
                                <div><b>Üniversite:</b>{this.institution.name}</div>
                                <div><b>Mezuniyet Tarihi:</b>{this.issueDate.toDateString()}</div>
                                <div><b>Ortalama:</b>{this.score}</div>
                            </td>
                            <td style={{verticalAlign: 'top'}}><img src={this.certificationInfo.badge} alt="Bulunamadı" height="80"/></td>                   
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

//list student's received certifications component
class StudentCertifications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {certifications: []};
        this.manager = this.props.manager;
        this.container = document.getElementById("certificationsContainer");
        const _this = this;
        this.manager.getStudentCertifications(this.manager.myAccount, function(list){
            _this.setState({certifications: list});
        })
        this.manager.getStudentCertificationsPublicView(function(isPublic){
            _this.setState({isPublic: isPublic});
        })

        this.updateVisibility = this.updateVisibility.bind(this);
    }

    updateVisibility() {
        var self = this;
        const _v = document.getElementById("chkIsPublic").checked;
        this.manager.setStudentCertificationsPublicView(_v, 
        function(tx){
            console.log((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            alert((Number(tx.receipt.status)===1?"Başarılı":"Başarısız") + ". Transaction hash: " + tx.receipt.transactionHash);
            self.setState({isPublic: _v});
            
        }, function(error) {
            console.error("Görünürlüğü güncelleştiremedik: " + error);
            self.setState({isPublic: self.state.isPublic});
        });         
    }

    render() {
        const certComponents = [];
        for(let i=0;i<this.state.certifications.length;i++) {
            certComponents.push(<div key={i} style={{border: '1px solid black', padding: '10px', marginBottom: '5px'}}><StudentCertificationInfo key={i} info={this.state.certifications[i]} /></div>)
        }

        let chkPublic = null;
        if(this.state.isPublic) {
            chkPublic = <input type="checkbox" id="chkIsPublic" name="chkIsPublic" checked onChange={() => this.updateVisibility()}/>;
        }
        else {
            chkPublic = <input type="checkbox" id="chkIsPublic" name="chkIsPublic" onChange={() => this.updateVisibility()}/>;
        }
        return (
            <div>
                <h2>DİPLOMALARIM</h2>
                <div id="certificationsContainer">
                    {certComponents}
                </div>
                <div id="certificationsContainer">
                     {chkPublic}<span>Diploma Herkes TarafIndan Görünsün</span>
                </div>
            </div>
        )
    }
}

// admin dashboard component
class AdminDashboard extends React.Component {
    render() {  
        return (
            <div>
                <h1>Yonetici Paneli</h1>
                <h3>Yonetici (ETH Adresi: {this.props.manager.myAccount})</h3>
                <nav className="navbar navbar-light" style={{position:'relative'}}>
                    <ul className="nav navbar-nav">
                        <li><Link to="/">Anasayfa</Link></li>
                        <li><Link to="/addadmin">Yonetici Ekle</Link></li>
                        <li><Link to="/addinstitution">Universite Ekle</Link></li>
                        <li><Link to="/setprice">Birim Fiyat Guncelle</Link></li>

                    </ul>
                </nav>
                <Route path="/addinstitution" render={(props) => <AddInstitution {...props} manager={this.props.manager} />}/>
                <Route path="/addadmin" render={(props) => <AddAdmin {...props} manager={this.props.manager} />}/>
                <Route path="/setprice" render={(props) => <SetPrice {...props} manager={this.props.manager} />}/>
            </div>
        );
    }
}

// institution dashboard component
class InstitutionDashboard extends Component {
    render() { 
        return (
            <div>
                <h1>Anasayfa</h1>
                <h3>Üniversite (ETH Adresi: {this.props.manager.myAccount})</h3>
                <nav className="navbar navbar-light" style={{position:'relative'}}>
                    <ul className="nav navbar-nav">
                        <li><Link to="/">Anasayfa</Link></li>
                        <li><Link to="/addcertification">Diploma Oluştur</Link></li>
                        {/* <li><Link to="/issuecertification">Issue Certification to Student</Link></li> */}
                        {/* <li><Link to="/institutioncertifications">Certifications</Link></li> */}

                    </ul>
                </nav>
                <Route path="/addcertification" render={(props) => <AddCertification {...props} manager={this.props.manager} />}/>
                {/* <Route path="/issuecertification" component={IssueCertification}/> */}
                {/* <Route path="/institutioncertifications" render={(props) => <InstitutionCertifications {...props} manager={this.props.manager} />}/> */}

                <InstitutionCertifications manager={this.props.manager} />
            </div>
        );
    }
}

// student dashboard component
class StudentDashboard extends Component {
    render() {    
        return (
            <div>
                <h1>Anasayfa</h1>
                <h3>Öğrenci (ETH Adresi: {this.props.manager.myAccount})</h3>
                <StudentCertifications manager={this.props.manager}/>
            </div>
        );
    }
}

// invalid role dashboard component
class InvalidDashboard extends Component {
    render() {    
        return (
            <div>
                <h1>Diploma Zincirine Hosgeldiniz</h1>
                <h3>Kayıtlı Bir Kullanici Seçiniz (Metamask)...</h3>
            </div>
        );
    }
}

// dashboard component
class Dashboard extends Component {
    
    render() {  
        if(!this.props.manager)  
            return null;

        const role = Number(this.props.manager.userRole);
        let dashboardComponent = null;

        // show custom dashboard based on role associated to address
        switch(role) {
            case 0: dashboardComponent = <InvalidDashboard />; break;
            case 1: dashboardComponent = <AdminDashboard manager={this.props.manager}/>; break;
            case 2: dashboardComponent = <InstitutionDashboard manager={this.props.manager} />; break;
            case 3: dashboardComponent = <StudentDashboard manager={this.props.manager} />; break;
            default: dashboardComponent = <InvalidDashboard />; break;

        }

        return (
            dashboardComponent
        );
    }
}

export default Dashboard

