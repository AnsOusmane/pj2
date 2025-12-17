const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // 👉 permet à Angular d’accéder aux images

app.use('/api/news', require('./routes/news.routes'));

app.listen(3000, () => console.log('🚀 API sur http://localhost:3000'));
