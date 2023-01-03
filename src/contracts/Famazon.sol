// declare the version of Solidity
pragma solidity ^0.5.0;

contract Famazon {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price, 
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price, 
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Phones";
    }

    function createProduct(string memory _name, uint _price) public {
        // Product name must not be empty
        require(bytes(_name).length > 0);
        // Product price must be greater than zero
        require(_price > 0);
        // Increase product count
        productCount++;
        // Create the product and add it to the blockchain
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        // Trigger an event
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        // fetch the product
        Product memory _product = products[_id];
        // fetch the owner
        address payable _seller = _product.owner;
        // make sure the product id is valid
        require(_product.id > 0 && _product.id <= productCount);
        // require that there is enough Ether in the transaction
        require(msg.value >= _product.price);
        // require that the product hasn't been purchased
        require(!_product.purchased);
        // require that the buyer isn't t he seller
        require(_seller != msg.sender);
        // transfer ownership to the buyer
        _product.owner = msg.sender;
        // mark as purchased
        _product.purchased = true;
        // update the product
        products[_id] = _product;
        // pay the seller
        address(_seller).transfer(msg.value);  
        // trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}