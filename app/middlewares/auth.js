//AUTENTICADOR DE TOKEN
//Chamadas básicas
require('dotenv').config()
const secret = process.env.JWT_TOKEN
const jwt = require('jsonwebtoken')
const User = require('../models/user')

//Requisição com autenticação
const WithAuth = (req, res, next) => {
    //No header, ele irá colocar o KEY no postman, que nesse caso, decidi colocar esse nome abaixo
    const token = req.headers['x-access-token']
    //Se é uma req que precisa de um token e não tem o token
    if (!token)
        res.status(401).json({ error: 'Unauthorized: no token provided' })
    else {
        //Verify verifica se o Token é válido
        jwt.verify(token, secret, (error, decoded) => {
            //Caso não seja válido
            if (error)
                res.status(401).json({ error: 'Unauthorized: token invalid' })
            else {
                //Caso seja válido
                req.email = decoded.email
                User.findOne({ email: decoded.email })
                    .then(user => {
                        req.user = user
                        next()
                    })
                    //Caso aconteça algum erro
                    .catch(error => {
                        res.status(401).json({ error: error })
                    })
            }
        })
    }
}

module.exports = WithAuth