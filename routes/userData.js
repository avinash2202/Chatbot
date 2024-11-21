const express = require('express');
const UserData = require('../models/userDataModel');

const router = express.Router();

// Handle the POST request with file uploads
router.post('/', async (req, res) => {
    try {
        const { name, age, email, incidentDateTime, incidentDetails, bankName, transactionId_UTR, 
            transactionDateTime, fraudAmount, website, other, suspectInfo, suspect_mobileNo, 
            suspect_emailId, suspect_bankAccountNo, suspect_address } = req.body;
    
        const userData = new UserData({ name, age, email, incidentDateTime, incidentDetails, 
            nationalId, bankName,transactionId_UTR, transactionDateTime, fraudAmount, evidenceDoc,
            website, other, suspectInfo, suspect_mobileNo, suspect_emailId, suspect_bankAccountNo, 
            suspect_address, suspect_photograph, suspect_document });
        // await userData.save();
        res.status(201).json({ success: true, data: userData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to save data' });
    }
});

module.exports = router;