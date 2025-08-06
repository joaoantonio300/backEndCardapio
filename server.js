import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
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

// Endpoint para upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: imagePath });
});

// Servir as imagens da pasta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(5000, () => console.log("Servidor rodando na porta 5000 🚀"));
