import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer (upload de imagens)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/**
 * CADASTRAR IMAGEM
 */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: imagePath });
});

/**
 * ATUALIZAR IMAGEM (substituir a antiga)
 * Recebe no body o caminho da imagem antiga (oldImage) e a nova (file)
 */
app.put("/upload", upload.single("file"), (req, res) => {
  try {
    const oldImagePath = req.body.oldImage; // exemplo: /uploads/1691763771123-foto.png

    // Apagar a imagem antiga, se existir
    if (oldImagePath) {
      const absoluteOldPath = path.join(__dirname, oldImagePath);
      if (fs.existsSync(absoluteOldPath)) {
        fs.unlinkSync(absoluteOldPath);
        console.log(`Imagem antiga removida: ${absoluteOldPath}`);
      }
    }

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ imageUrl: imagePath });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar imagem" });
  }
});

/**
 * EXCLUIR IMAGEM
 * Recebe no body o caminho da imagem a excluir
 */
app.delete("/upload", (req, res) => {
  try {
    const { imagePath } = req.body; // exemplo: /uploads/1691763771123-foto.png

    if (!imagePath) {
      return res.status(400).json({ error: "Nenhuma imagem informada" });
    }

    const absolutePath = path.join(__dirname, imagePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return res.json({ message: "Imagem excluída com sucesso" });
    } else {
      return res.status(404).json({ error: "Imagem não encontrada" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir imagem" });
  }
});

// Servir as imagens da pasta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(5000, () => console.log("Servidor rodando na porta 5000 🚀"));
