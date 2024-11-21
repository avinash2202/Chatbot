const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    name: {type: String, required: true},
    age: {type: String, required: true},
    email: {type: String, required: true},
    incidentDateTime: {type: String, required: true},
    incidentDetails: {type: String, required: true},
    nationalId: {type: String, required: false},
    bankName: {type: String, required: true},
    transactionId_UTR: {type: String, required: true},
    transactionDateTime: {type: String, required: true},
    fraudAmount: {type: String, required: true},
    evidenceDoc: {type: String, required: false},
    website: {type: String, required: false},
    other: {type: String, required: true},
    suspectInfo: [String],
    suspect_mobileNo: {type: String, required: false},
    suspect_emailId: {type: String, required: false},
    suspect_bankAccountNo: {type: String, required: false},
    suspect_address: {type: String, required: false},
    suspect_photograph: {type: String, required: false},
    suspect_document: {type: String, required: false},
});

module.exports = mongoose.model('UserData', userDataSchema);