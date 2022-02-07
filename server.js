const express = require('express');
const path = require('path');

const app = express();

app.use('/structor', express.static(path.join(__dirname, 'build')));
app.use('/iframe', express.static(path.join(__dirname, 'build', 'iframe')));

console.log('Listening on port 9001...');
app.listen(9001);
