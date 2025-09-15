const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: String,
            required: true, // Garante que este campo sempre tenha um valor
            unique: true,   // Garante que não haverá dois usuários com o mesmo ID
        },
        usuario: {
            type: String,
            required: true,
            trim: true,     // Remove espaços em branco do início e do fim
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, // Salva o email sempre em minúsculas para evitar duplicatas
            trim: true,
        },
        senha: {
            type: String,
            required: true,
        },
        idade: {
            type: Number,
            required: false, // Idade não é um campo obrigatório
        },
    },
    {
        // Adiciona automaticamente os campos createdAt e updatedAt
        timestamps: true,
    }
);

const Registro = mongoose.model('RegistroUsuarios', registroSchema);

module.exports = Registro;