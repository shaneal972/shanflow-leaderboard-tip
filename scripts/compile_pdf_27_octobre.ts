import * as fs from 'fs';
import * as path from 'path';

const webhookUrl = process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL || 'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
const bearerToken = process.env.KLF_WEBHOOK_BEARER_TOKEN || 'klf_tip_bearer_secret_2026_jarry_secure!';

const targetBrainDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/271026');

async function run() {
  const htmlPath = path.join(targetBrainDir, 'TP_Consignes_Graphiques_DSI_MFC_271026.html');
  const pdfPath = path.join(targetBrainDir, 'TP_Consignes_Graphiques_DSI_MFC_271026.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('HTML file not found:', htmlPath);
    process.exit(1);
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');
  console.log('⏳ Compilation Gotenberg vers PDF Qualiopi via n8n...');

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ html, filename: 'TP_Consignes_Graphiques_DSI_MFC_271026.pdf' }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur Gotenberg HTTP ${res.status}: ${err}`);
  }

  const arrBuf = await res.arrayBuffer();
  const pdfBuf = Buffer.from(arrBuf);
  fs.writeFileSync(pdfPath, pdfBuf);
  console.log(`🎉 PDF officiel généré avec succès (${(pdfBuf.length / 1024).toFixed(1)} Ko) : ${pdfPath}`);
}

run().catch(console.error);
