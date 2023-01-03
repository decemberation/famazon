const { assert, should } = require("chai")

const Famazon = artifacts.require('./Famazon.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Famazon', ([deployer, seller, buyer]) => {
    let famazon

    before(async () => {
        famazon = await Famazon.deployed()
    })

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            const address = await famazon.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async() => {
            const name = await famazon.name()
            assert.equal(name, 'Phones')
        })
    })

    describe('products', async() => {
        let result, productCount

        before(async () => {
            result = await famazon.createProduct('iPhone 14 Pro', web3.utils.toWei('1', 'Ether'), {from: seller})
            productCount = await famazon.productCount()
        })

        it('creates products', async() => {
            // success
            assert.equal(productCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'iPhone 14 Pro', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, seller, 'owner is correct')
            assert.equal(event.purchased, false, 'purchased is correct')

            // failure
            await await famazon.createProduct('', web3.utils.toWei('1', 'Ether'), {from: seller}).should.be.rejected;
            await await famazon.createProduct('iPhone 14 Pro', 0, {from: seller}).should.be.rejected;
        })

        it('lists products', async() => {
            const product = await famazon.products(productCount)
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(product.name, 'iPhone 14 Pro', 'name is correct')
            assert.equal(product.price, '1000000000000000000', 'price is correct')
            assert.equal(product.owner, seller, 'owner is correct')
            assert.equal(product.purchased, false, 'purchased is correct')
        })

        it('sells products', async() => {
            // track the seller balance before purchase
            let oldSellerBalance
            oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)

            // success: buyer make purchase
            result = await famazon.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})
            
            // check logs
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'iPhone 14 Pro', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, buyer, 'buyer is correct')
            assert.equal(event.purchased, true, 'purchased is correct')

            // check that seller received funds
            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)

            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)

            console.log(oldSellerBalance, newSellerBalance, price)

            const expectedBalance = oldSellerBalance.add(price)

            assert.equal(newSellerBalance.toString(), expectedBalance.toString())

            // failure: try to buy a product that doesn't exist
            await famazon.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
            // failure: try to buy without enough Ether
            await famazon.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;
            // failure: deployer tries to buy (product can't be purchased twice)
            await famazon.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
            // failure: buyer tries to buy again (buyer can't be the seller)
            await famazon.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })
    })
})