import express from 'express';
import authUser from '../middlewares/authUser.js';
import {
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress
} from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);
addressRouter.get('/get', authUser, getAddress);
addressRouter.put('/update', authUser, updateAddress);
addressRouter.delete('/delete', authUser, deleteAddress);

export default addressRouter;