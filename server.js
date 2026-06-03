const express = require('express');
const path = require('path');
const app = require('./api/index');
const PORT = process.env.PORT || 3000;

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ARIA running on http://localhost:${PORT}`);
});
