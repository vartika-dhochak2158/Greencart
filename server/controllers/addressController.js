import Address from "../models/Address.js"


// Add Address : /api/address/add
export const addAddress = async (req, res) => {
    try {
        const { address, userId } = req.body

        const newAddress = await Address.create({
            ...address,
            userId
        })

        res.json({
            success: true,
            message: "Address added successfully",
            addressId: newAddress._id
        })

    } catch (error) {
        console.log(error.message)

        res.json({
            success: false,
            message: error.message
        })
    }
}

// Get Address : /api/address/get
export const getAddress = async(req, res)=>{
    try {
        const { userId } = req.body
        const addresses = await Address.find({userId})
        res.json({success: true, addresses})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
// Update Address : /api/address/update
export const updateAddress = async (req, res) => {
    try {
        const { addressId, address, userId } = req.body;

        if (!addressId || !address) {
            return res.json({
                success: false,
                message: "Address ID and address are required"
            });
        }

        const updatedAddress = await Address.findOneAndUpdate(
            {
                _id: addressId,
                userId
            },
            {
                ...address
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedAddress) {
            return res.json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            message: "Address updated successfully",
            address: updatedAddress
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};
// Delete Address : /api/address/delete
export const deleteAddress = async (req, res) => {
    try {
        const { addressId, userId } = req.body;

        if (!addressId) {
            return res.json({
                success: false,
                message: "Address ID is required"
            });
        }

        const deletedAddress = await Address.findOneAndDelete({
            _id: addressId,
            userId
        });

        if (!deletedAddress) {
            return res.json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};