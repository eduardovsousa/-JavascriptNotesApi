var express = require('express');
var router = express.Router();
const Note = require('../models/note')
const withAuth = require('../middlewares/auth');
const WithAuth = require('../middlewares/auth');

//Criando uma nova nota
router.post('/', withAuth, async (req, res) => {
    const { title, body } = req.body
    try {
        let note = new Note({ title: title, body: body, author: req.user._id })
        await note.save()
        res.status(200).json(note)
    } catch (error) {
        res.status(500).json({ error: 'Problem to create a new note' })
    }
})

//Buscando uma nota
router.get('/search', withAuth, async(req, res) => {
    //Irá buscar uma query
    const { query } = req.query
    try {
        let notes = await Note
        //Irá procurar por uma nota através da query, se for o autor da nota
        //Só irá funcionar após a estrutura (schema) que está no models/note
        .find({ author: req.user._id })
        .find({ $text: { $search: query }})
        res.json(notes)
    } catch (error) {
        res.status(500).json({ error: error})
    }
})

//Procurando uma nota específica
router.get('/:id', WithAuth, async (req, res) => {
    try {
        //Pega a informação do ID pelo parâmetro da requisição
        const { id } = req.params
        //Procura a nota
        let note = await Note.findById(id)
        //Verifica se é o dono da nota
        if (isOwner(req.user, note))
            //Se for, recebe a nota
            res.json(note)
        //Caso contrário, permissão negada
        else
            res.status(403).json({ error: 'Permission denied' })

    } catch (error) {
        res.status(500).json({ error: 'Problem to get a note' })
    }
})

//Baixando uma nota
router.get('/', withAuth, async (req, res) => {
    try {
        //Procura as notas e retorna a lista
        let notes = await Note.find({ author: req.user._id })
        res.json(notes)
    } catch (error) {
        res.status(500).json({ error })
    }
})

//Atualizando uma nota
router.put('/:id', withAuth, async (req, res) => {
    //Somente o título e corpo podem ser atualizados em uma nota
    const { title, body } = req.body
    //Pegando o id
    const { id } = req.params
    try {
        //Procurando a nota
        let note = await Note.findById(id)
        //Se for o autor, ele poderá editar a nota
        if (isOwner(req.user, note)) {
            let note = await Note.findOneAndUpdate(id,
                { $set: { title: title, body: body } },
                { upsert: true, 'new': true }
            )
            res.json(note)
            //Caso não seja, receberá permissão negada
        } else
            res.status(403).json({ error: 'Permission denied' })
    } catch (error) {
        res.status(500).json({ error: 'Problem to update a note' })
    }
})

//Deletando uma nota
router.delete('/:id', withAuth, async (req, res) => {
    const { id } = req.params
    try {
        let note = await Note.findById(id)
        //Se for o autor da nota, poderá deletar
        if (isOwner(req.user, note)) {
            await note.delete()
            res.json({ message: 'Note deleted' }).status(204)
        } else {
            res.status(403).json({ error: 'Permission denied' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Problem to delete a note' })
    }
})


//Método para verificar se a nota que a pessoa quer baixar, é a dona da mesma
const isOwner = (user, note) => {
    //verifica se o usuário (id/email) é o mesmo do autor da nota
    if (JSON.stringify(user._id) == JSON.stringify(note.author._id))
        return true
    else
        //retorna falso caso não seja o autor
        return false
}

module.exports = router