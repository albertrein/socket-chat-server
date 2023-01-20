//Express routes
const port = 3000;
const express = require('express');
const app = express();
app.use(express.json());
app.listen(port, () => {
  console.log(`Operando na porta ${port}`)
});

app.get('/teste', (req, res) => {
  res.render('teste.html')
})
//Fim express
