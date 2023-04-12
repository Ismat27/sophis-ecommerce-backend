const OrderItem = require('../models/OrderItem')
const VendorProfile = require('../models/VendorProfile')
const User = require('../models/User')
const { BadRequestError, UnauthorizedError, APIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const Product = require('../models/Product')

// create new vendor profile
const createVendorProfile = async (req, res) => {
    const {
        email,
        displayName,
        companyAddress,
        billingAddress,
        CACName,
        firstName,
        lastName,
        phoneNumber,
        password,
        confirmPassword,
    } = req.body
    let user;
    // check if user exist
    const existingUser = await User.findOne({
        email: email
    })

    if (existingUser) {
        const existingProfile = await VendorProfile.findOne({
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
            email: email,
            firstName,
            lastName,
            phoneNumber,
            password,
            confirmPassword
        })
    }
    const newProfile = await VendorProfile.create({
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
const vendorOrderItems = async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new  BadRequestError('unknown vendor')
    }
    const vendor = await VendorProfile.findOne({
        user: userId
    })
    if (!vendor) {
        throw new UnauthorizedError('not a vendor')
    }
    if (!vendor.isVerified) {
        throw new UnauthorizedError('vendor not verified')
    }
    const vendorProducts = await Product.find(
        { user: userId }
    )
    const ids = vendorProducts.map(item => item._id)
    const orderItems = await OrderItem.find(
        { product: { $in: ids} }
    ).populate('product').sort('-updatedAt')

    res.status(StatusCodes.OK).json({ orderItems })
}
const verifyVendor = async (req, res) => {
    const { verify, userId } = req.body
    if (!userId) {
        throw new BadRequestError('unknown vendor')
    }
    const vendor = await VendorProfile.findOneAndUpdate(
        { user: { _id: userId } },
        { isVerified: verify },
        { runValidators: true, new: true}
    )
    if (!vendor) {
        throw new UnauthorizedError('not a vendor')
    }
    res.status(StatusCodes.OK).json(vendor)
}

const fetchVendors = async (req, res) => {
    const vendors = await VendorProfile.find().populate('user')
    res.status(StatusCodes.OK).json(vendors)
}

module.exports = {
    createVendorProfile,
    vendorOrderItems,
    verifyVendor,
    fetchVendors
}