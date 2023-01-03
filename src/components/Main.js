import React, { Component } from 'react';

class Main extends Component {
    render() {
        return (
            <div id='content'>
                <h2>Add a product</h2>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    const name = this.productName.value
                    const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'ether')
                    //console.log(price)
                    this.props.createProduct(name, price)
                }} >
                    <div className="form-group mr-sm-2">
                        <input
                            id="productName"
                            type="text"
                            ref={(input) => { this.productName = input }}
                            className="form-control"
                            placeholder="Product Name"
                            required />
                    </div>
                    <div className="form-group mr-sm-2">
                        <input
                            id="productPrice"
                            type="text"
                            ref={(input) => { this.productPrice = input }}
                            className="form-control"
                            placeholder="Product Price"
                            required />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Product</button>
                </form>
                <p>&nbsp;</p>
                <h2>Buy a product</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">Owner</th>
                            <th scope="col">Description</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="productList">
                        {this.props.products.map((product, key) => {
                            return (
                                <tr key={key}>
                                    <th scope="row">{product.id.toString()}</th>
                                    <td>{product.name}</td>
                                    <td>{window.web3.utils.fromWei(product.price.toString(), 'ether')} ETH</td>
                                    <td>{product.owner}</td>
                                    <td><p>The seller has not provided any information about this product yet.</p></td>
                                    <td>
                                        <button className='btn btn-primary'
                                            style={{ backgroundColor: 'green' }}
                                            disabled={product.purchased}
                                            name={product.id}
                                            value={product.price}
                                            onClick={(event) => {
                                                this.props.purchaseProduct(event.target.name, event.target.value)
                                            }}>
                                            Buy
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Main;
