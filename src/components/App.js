import React, { Component } from 'react';
import Web3 from 'web3'
import Famazon from '../abis/Famazon.json'
import Navbar from './Navbar';
import Main from './Main';
import Footer from './Footer';
import Slider from './Slider';
import './styles/App.css';
class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      }
      else if (window.web3) {
        window.web3 = new Web3(window.ethereum)
      }
      else {
        window.alert('Please install MetaMask!')
      }
    })
  }

  async loadBlockchainData() {
    // reference: https://stackoverflow.com/questions/73847311/window-web3-eth-contract-no-longer-works-how-do-i-now-connect-to-a-contract
    const web3 = new Web3(window.ethereum)

    // load accounts
    // reference: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    this.setState({ account: accounts[0] })

    // reload page on account change
    // reference: https://docs.metamask.io/guide/ethereum-provider.html#methods
    var accountInterval = setInterval(() => {
      window.ethereum.on('accountsChanged', (account) => {
        window.location.reload();
      })
    }, 100)

    // load smart contract data
    const networkId = await window.ethereum.networkVersion
    const networkData = Famazon.networks[networkId]
    if (networkData) {
      const famazon = web3.eth.Contract(Famazon.abi, networkData.address)
      console.log(famazon)
      this.setState({ famazon: famazon })
      this.setState({ loading: false })
      const productCount = await this.state.famazon.methods.productCount().call()
      //console.log(productCount)
      this.setState({ productCount: productCount })
      // load the products list
      for (let i = 1; i <= productCount; i++) {
        const product = await this.state.famazon.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false })
      //console.log(this.state.products)
    }
    else {
      window.alert('Contract not deployed to network')
    }
  }

  // create & purchase a product
  // reference: https://ethereum.stackexchange.com/questions/82555/refresh-page-upon-metamask-confirmation-web3js-react
  createProduct(name, price) {
    this.setState({ loading: true })
    this.state.famazon.methods.createProduct(name, price).send({ from: this.state.account })
      .once('confirmation', (receipt) => {
        this.setState({ loading: false })
        window.location.reload()
      })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.famazon.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
      .once('confirmation', (receipt) => {
        this.setState({ loading: false })
        window.location.reload()
      })
  }

  render() {
    return (
      <div className='page-container'>
        <div className='content-wrap'>
          <Navbar account={this.state.account} />
          <Slider />
          <div></div>
          <div className='container-fluid mt-5'>
            <div className='row'>
              <main role="main" className='col-lg-12 d-flex'>
                {this.state.loading
                  ? <div className='loading' >Loading...</div>
                  : <Main createProduct={this.createProduct} products={this.state.products} purchaseProduct={this.purchaseProduct} />}
              </main>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
