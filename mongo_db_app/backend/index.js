const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/mern-simple', {useNewUrlParser: true, useUnifiedTopology: true,}).then(() => console.log('mongodb : 200'));

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
