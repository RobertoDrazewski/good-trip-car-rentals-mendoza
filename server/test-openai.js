const { OpenAI } = require('openai');

// COMENTA O BORRA ESTO TEMPORALMENTE
// require('dotenv').config(); 

// Pega tu nueva API KEY aquí directamente
const openai = new OpenAI({ apiKey: "sk-tu-nueva-api-key-aqui" });

async function checkModels() {
    try {
        const models = await openai.models.list();
        const hasDalle = models.data.find(m => m.id === 'dall-e-3');
        console.log(hasDalle ? "✅ ÉXITO: Acceso a DALL-E 3" : "❌ No hay acceso a DALL-E 3");
    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
}
checkModels();