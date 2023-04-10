const formatProduct = ( product ) => {
    const newProduct = {...product.toObject()}
    newProduct['id'] = newProduct['_id']
    delete newProduct['_id']
    return newProduct
}

module.exports = formatProduct