import express from "express";
import multer from "multer";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração Multer (armazenar em memória, não no disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * CADASTRAR IMAGEM
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // encapsulando upload_stream em Promise
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "meu_projeto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // resposta JSON com a URL segura do Cloudinary
    res.json({
      imageUrl: uploadResult.secure_url, // ✅ link pronto para salvar no Firebase
      publicId: uploadResult.public_id,
    });

  } catch (err) {
    console.error("Erro ao enviar imagem:", err);
    res.status(500).json({ error: "Erro ao enviar imagem" });
  }
});


/**
 * ATUALIZAR IMAGEM (substituir a antiga)
 */
app.put("/upload", upload.single("file"), async (req, res) => {
  try {
    const { oldImageId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // 1. Upload da nova
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "meu_projeto" },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    // 2. Se deu certo, remove a antiga
    if (oldImageId) {
      await cloudinary.uploader.destroy(oldImageId);
    }

    res.json({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar imagem" });
  }
});


/**
 * EXCLUIR IMAGEM
 */
app.delete("/upload", async (req, res) => {
  try {
    const { publicId } = req.body; // precisa do public_id salvo no banco

    if (!publicId) {
      return res.status(400).json({ error: "Nenhuma imagem informada" });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Imagem excluída com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir imagem" });
  }
});

app.listen(5000, () => console.log("Servidor rodando na porta 5000 🚀"));
