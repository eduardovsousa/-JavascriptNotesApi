var express = require('express');
var router = express.Router();
//Importando o User
const User = require('../models/user')
//importando JWT
const jwt = require('jsonwebtoken')
//Faz com que as variáveis de ambiente que ficam em ".env", sejam utilizadas na aplicação
require('dotenv').config()
//Para pegar o Token
const secret = process.env.JWT_TOKEN
const withAuth = require('../middlewares/auth')

//Endpoint para registar um novo usuário
router.post('/register', async (req, res) => {
  //Ele pegará as informações do usuário
  const { name, email, password } = req.body
  //Fará a adição das informações
  const user = new User({ name, email, password })
  try {
    //Se der certo, salvará
    await user.save()
    res.status(200).json(user)
  } catch (error) {
    //Erro caso não dê certo
    res.status(500).json({ error: 'Error registering new user' })
  }
})

//Endpoint para o Login/Token
router.post('/login', async (req, res) => {
  //Utilizará informações de login (email e senha)
  const { email, password } = req.body
  try {
    //Verificando se o email está cadastrado
    let user = await User.findOne({ email })
    //Se o email/user for incorreto
    if (!user)
      res.status(401).json({ error: 'Incorrect email or password' })
    else {
      //Se a senha for incorreta
      user.isCorrectPassword(password, function (error, same) {
        if (!same)
          res.status(401).json({ error: 'Incorrect email or password' })
        else {
          //Se der tudo certo, valida ===> '10d' é o tempo que o token expira, após isso, é realizado o logout automaticamente
          const token = jwt.sign({ email }, secret, { expiresIn: 300 })
          res.json({ user: user, token: token })
        }
      })
    }
  } catch (error) {
    //Caso nada aconteça, é um erro interno
    res.status(500).json({ error: 'Internal error, please try again' })
  }
})

//Atualizando a API
//Alterando o nome e email
router.put('/', withAuth, async function (req, res) {
  const { name, email } = req.body;

  try {
    var user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { name: name, email: email } },
      { upsert: true, 'new': true }
    )
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

//Atualizando a senha
router.put('/password', withAuth, async function (req, res) {
  const { password } = req.body;

  try {
    var user = await User.findOne({ _id: req.user._id })
    user.password = password
    user.save()
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error });
  }
});


//Deletar o usuário
router.delete('/', withAuth, async function (req, res) {
  try {
    let user = await User.findOne({ _id: req.user._id });
    await user.delete();
    res.json({ message: 'OK' }).status(201);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;