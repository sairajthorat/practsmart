import app from './api/index.js';

const port = 5000;

app.listen(port, () => {
  console.log(`Local Server running on port ${port}`);
});
