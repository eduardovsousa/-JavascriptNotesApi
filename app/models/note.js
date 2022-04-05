const mongoose = require('mongoose')

//Estrutura Schema para o banco de dados
let noteSchema = new mongoose.Schema({
    title: String,
    body: String,
    created_at: { type: Date, default: Date.now },   //Quando a nota foi criada
    upadated_at: { type: Date, default: Date.now },  //Quando a nota foi atualizada
    //Para cada nota, terá um Autor, e esse autor, será obrigatório
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

//Estrutura para a busca das notas pelo Query (notes.js)
noteSchema.index({ 'title': 'text', 'body': 'text'})

module.exports = mongoose.model('Note', noteSchema)