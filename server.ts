import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely with telemetry User-Agent as required by the skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes FIRST
app.post("/api/ai/correct-service", async (req, res) => {
  try {
    const { title, description, category, estimatedPrice } = req.body;

    const prompt = `Analise este chamado de serviço técnico sob demanda e faça as correções necessárias:
- Corrija erros gramaticais e de digitação.
- Escreva um título curto, claro, profissional e chamativo.
- Expanda a descrição para um formato técnico e estruturado (detalhando sintomas, possíveis causas e instruções para o prestador).
- Sugira a melhor categoria aplicável dentre as seguintes opções: 'hidraulica', 'eletrica', 'climatizacao', 'pintura', 'alvenaria', 'limpeza', 'geral'.
- Estime um preço justo e realista em Reais (R$) para o mercado brasileiro de mão de obra técnica sob demanda.

Dados do Chamado:
Título Original: ${title || "Sem título"}
Descrição Original: ${description || "Sem descrição fornecida"}
Categoria Atual: ${category || "geral"}
Preço Atual Estimado: R$ ${estimatedPrice || 150}
`;

    // Request structured JSON using the official @google/genai API schema configuration
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é o Engenheiro Chefe e Assistente Técnico Inteligente da M1 BRASIL SERVIÇOS. Sua missão é estruturar chamados de clientes de forma profissional, clara e técnica para facilitar o entendimento dos prestadores de serviço e sugerir preços de mercado justos.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Título corrigido e profissional em letras maiúsculas.",
            },
            description: {
              type: Type.STRING,
              description: "Descrição técnica estruturada detalhando o problema, possíveis causas e instruções de segurança.",
            },
            category: {
              type: Type.STRING,
              description: "A melhor categoria sugerida. Deve ser uma destas opções: 'hidraulica', 'eletrica', 'climatizacao', 'pintura', 'alvenaria', 'limpeza', 'geral'.",
            },
            recommendedPrice: {
              type: Type.NUMBER,
              description: "Preço justo estimado em Reais (R$).",
            }
          },
          required: ["title", "description", "category", "recommendedPrice"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Resposta da IA vazia");
    }

    const aiData = JSON.parse(resultText.trim());
    return res.json({ success: true, data: aiData });
  } catch (error: any) {
    console.error("Erro no processamento da IA, aplicando fallback de contingência:", error);
    
    // Contingência estruturada amigável para evitar travar a experiência do usuário quando a cota do Gemini for atingida
    const fallbackCategory = req.body.category || 'marido_de_aluguel';
    const fallbackPrice = req.body.estimatedPrice || 150;
    
    const fallbackData = {
      title: `${(req.body.title || "SOLICITAÇÃO DE SERVIÇO M1").toUpperCase()} (ANALISADO PELA CENTRAL)`,
      description: `${req.body.description || "Solicitação técnica de atendimento registrada."}\n\n[Aviso: Devido à alta demanda em nossos servidores, este laudo foi estruturado sob o protocolo de contingência rápida da Central M1. Detalhes finais serão acordados diretamente com o profissional designado.]`,
      category: fallbackCategory,
      recommendedPrice: Number(fallbackPrice) || 150
    };

    return res.json({ 
      success: true, 
      data: fallbackData, 
      isFallback: true,
      message: "Atendimento pré-estruturado via protocolo de contingência rápida M1." 
    });
  }
});

// Vite middleware / Static Asset serving setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
