const OrderItem = require('../models/OrderItem')
const VendorProfle = require('../models/VendorProfile')
const User = require('../models/User')
const { BadRequestError, UnauthorizedError, APIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')

// create new vendor profile
const createVendorProfile = async (req, res) => {
    const {
        email,
        displayName,
        companyAddress,
        billingAddress,
        CACName
    } = req.body
    let user;
    // check if user exist
    const existingUser = await User.findOne({
        email: email
    })

    if (existingUser) {
        const existingProfile = await VendorProfle.findOne({
            user: {_id: existingUser._id}
        })
        if (existingProfile) {
            throw new APIError('vendor already exist', StatusCodes.CONFLICT)
        }
        user = existingUser
    }
    else {
        // create new user
        user = await User.create({
            email: email
        })
    }
    const newProfile = await VendorProfle.create({
        displayName,
        companyAddress,
        billingAddress,
        user,
        CACName
    })

    res.status(StatusCodes.OK).json({
        newProfile
    })
}

// to get products ordered from a vendor
const vendorOrderItems = (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new  BadRequestError('unknown vendor')
    }
    const vendor = VendorProfle.findOne({
        user: {_id: userId}
    })
    if (!vendor) {
        throw new UnauthorizedError('not a vendor')
    }
    if (!vendor.isVerified) {
        throw new UnauthorizedError('vendor not verified')
    }
    const orderItems = OrderItem.find({
        product: { user: {_id: userId} }
    }).populate('product').sort('-updatedAt')

    res.status(StatusCodes.OK).json({ orderItems })
}

module.exports = {
    createVendorProfile,
    vendorOrderItems
}