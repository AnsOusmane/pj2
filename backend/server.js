const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/rapports_officiels', require('./routes/rapportsofficiels.routes'));
app.use('/api/decrets_officiels', require('./routes/decrets.routes'));
app.use('/api/communiques_officiels', require('./routes/communiques.routes'));
app.use('/api/banque_images', require('./routes/banquedimage.routes'));
app.listen(3000, () => console.log('🚀 API sur http://localhost:3000'));