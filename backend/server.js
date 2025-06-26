js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const posters = [
  { id: 1, title: 'Poster 1', imageUrl: 'https://link-to-poster1.jpg' },
  { id: 2, title: 'Poster 2', imageUrl: 'https://link-to-poster2.jpg' }
];

app.get('/api/posters', (req, res) => {
  res.json(posters);
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));

