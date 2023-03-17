exports.createProduct = (req, res,) => {
    const name = req.body.name
    const price = req.body.price
    res.json(
        {
            message: 'Create Product success',
            data: {
                id: 1,
                name: name,
                price: price
            }
        }
    )
}

exports.getAllProducts = (req, res,) => {
    res.json(
        {
            message: "get All product success",
            data: {
                id: 1,
                name: 'Krepek Jengkol',
                price: 5000
            }
        }
    )
} 