import React, { Component } from 'react'
import Dashboard from './utils/dashboard'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      manager: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    var _certificationManager = window.CertificationManager;
    var _provider = null;//new Web3.providers.HttpProvider("http://localhost:8545");
    //var _provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/0x593867282D435A64Fc3437cD43c80e92624b1a07");
    var _config = {provider: _provider};

    var _self = this;
    _certificationManager.init(_config, function(){
      _self.setState({manager: _certificationManager});
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">DIPLOMA ZINCIRI</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <Dashboard  manager={this.state.manager}/>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
