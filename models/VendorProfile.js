const moongose = require('mongoose')

const { Schema, model } = moongose

const VendorProfileSchema = new Schema(
    {
        user: {
            type: moongose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        displayName: {
            type: String
        },
        CACName: {
            type: String,
            required: [true, 'company name cannot be null']
        },
        companyAddress: {
            type: String,
            required: [true, 'vendor company address cannot be null']
        },
        billingAddress: {
            type: String,
            required: [true, 'vendor billing address cannot be null']
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    { timestamps: true }
)

const VendorProfile = model('VendorProfile', VendorProfileSchema)

module.exports = VendorProfile