const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const userData = require('./routes/userData');
const configureUploads = require('./routes/upload')

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose.connect('mongodb://localhost:27017/chatdata')
    .then(() => console.log('MongoDB Connected.'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

app.use('/saveUserData', userData);

configureUploads(app)


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});