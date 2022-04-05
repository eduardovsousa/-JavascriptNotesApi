const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

//Estrutura Schema para o banco de dados
let userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    upadated_at: { type: Date, default: Date.now },
})

//aplicando o bcrypt, que transforma as senhas em Hashes
userSchema.pre('save', function(next) {
    //Verificar se o registro do BD é Novo ou se foi Modificado
    if (this.New || this.isModified('password')) {
        //Faz a criptografia, esse "10" é o "saltOrRounds", que é o nível  para a quantidade da criptografia
        bcrypt.hash(this.password, 10,  
            //hasehdPassword = Senha alterada para Hash
            (err, hashedPassword) => {
                if (err)
                next(err)   //Comunica se existe algum erro nessa nova/alteração de senha
                else {
                    this.password = hashedPassword //Se der certo, ele pega essa senha criptografada e envia para o BD, substituindo a senha original pela nova criptografada
                    next()
                }
            })
    }
})

//Método para comparar os passwords, o nome declarado foi "isCorrectPassword", mas não é padrão
userSchema.methods.isCorrectPassword = function (password, callback) {
    //Comparando a senha Hash do BD com a senha do usuário
    //Same é quem irá dizer se a senha é igual ou não (true/false)
    bcrypt.compare(password, this.password, function(err, same) {
        if (err)
        callback(err)
        else {
            //Se não tiver erro, acontece o else
            callback(err, same)
        }
    })
}

module.exports = mongoose.model('User', userSchema)