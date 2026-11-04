import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { FORE_LOGO_BASE64, FRANCE_TRAVAIL_LOGO_BASE64 } from '../src/lib/templates/fichesLogos';

const webhookUrl = process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL || 'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
const bearerToken = process.env.KLF_WEBHOOK_BEARER_TOKEN || 'klf_tip_bearer_secret_2026_jarry_secure!';

const targetBrainDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/271026');
const klfEnterpriseDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/01 - Entreprise Fictive KLF');

// 25 machines réalistes KLF Jarry
const rawCleanData = [
  { id: 'MAT-001', machine: 'PC-DIR-01', user: 'Edouard LOMBARD', os: 'Windows 11 Pro', service: 'Direction', site: 'Jarry', type: 'PC Fixe Tour', modele: 'Dell OptiPlex 7090', dateAchat: '2024-01-15', dateDisplay: '15/01/2024', garantie: 36, obs: 'Poste Direction Générale - RAS' },
  { id: 'MAT-002', machine: 'PC-DIR-02', user: 'Marc VERDIER', os: 'Windows 11 Pro', service: 'DSI', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad P16', dateAchat: '2024-02-15', dateDisplay: '15/02/2024', garantie: 36, obs: 'Poste DSI double écran' },
  { id: 'MAT-003', machine: 'PC-FACT-01', user: 'Corinne MONROSE', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2021-06-10', dateDisplay: '10/06/2021', garantie: 36, obs: 'Lenteur sur gros classeurs fret (Palier 2)' },
  { id: 'MAT-004', machine: 'PC-FACT-02', user: 'Lydie BASTIEN', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2021-06-10', dateDisplay: '10/06/2021', garantie: 36, obs: 'Clavier et pavé numérique défaillants' },
  { id: 'MAT-005', machine: 'PC-FACT-03', user: 'Jean-Marc SAINT-VAL', os: 'Windows 11 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 3080', dateAchat: '2023-09-01', dateDisplay: '01/09/2023', garantie: 36, obs: 'Double écran installé' },
  { id: 'MAT-006', machine: 'PC-RH-01', user: 'Elodie THEOPHILE', os: 'Windows 11 Pro', service: 'Ressources Humaines', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 5430', dateAchat: '2023-11-20', dateDisplay: '20/11/2023', garantie: 36, obs: 'Campagne publipostage convocations' },
  { id: 'MAT-007', machine: 'PC-RH-02', user: 'Stagiaire RH', os: 'Windows 10 Pro', service: 'Ressources Humaines', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad L14', dateAchat: '2020-09-15', dateDisplay: '15/09/2020', garantie: 24, obs: 'Batterie HS, fonctionne sur secteur' },
  { id: 'MAT-008', machine: 'PC-LOG-01', user: 'Sebastien LEBLANC', os: 'Windows 11 Pro', service: 'Logistique', site: 'Jarry', type: 'PC Durci', modele: 'Panasonic Toughbook 55', dateAchat: '2024-03-10', dateDisplay: '10/03/2024', garantie: 36, obs: 'Poste chef de quai Jarry' },
  { id: 'MAT-009', machine: 'PC-LOG-02', user: 'Cariste Equipe A', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'Tablette Durcie', modele: 'Zebra ET51', dateAchat: '2022-04-18', dateDisplay: '18/04/2022', garantie: 24, obs: 'Écran tactile rayé' },
  { id: 'MAT-010', machine: 'PC-LOG-03', user: 'Cariste Equipe B', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'Tablette Durcie', modele: 'Zebra ET51', dateAchat: '2022-04-18', dateDisplay: '18/04/2022', garantie: 24, obs: 'Problème synchronisation ERP' },
  { id: 'MAT-011', machine: 'IMP-JARRY-01', user: 'Multi-services Accueil', os: 'Autre', service: 'Accueil', site: 'Jarry', type: 'Copieur Réseau', modele: 'Canon imageRUNNER 2630', dateAchat: '2022-08-01', dateDisplay: '01/08/2022', garantie: 48, obs: 'IP fixe 192.168.10.250' },
  { id: 'MAT-012', machine: 'IMP-FACT-01', user: 'Service Facturation', os: 'Autre', service: 'Facturation', site: 'Jarry', type: 'Imprimante N&B', modele: 'Brother HL-L6400DW', dateAchat: '2021-03-12', dateDisplay: '12/03/2021', garantie: 36, obs: 'Bac papier n°2 bloqué' },
  { id: 'MAT-013', machine: 'PC-FDF-01', user: 'Patrick NARCISSE', os: 'Windows 11 Pro', service: 'Direction', site: 'Fort-de-France', type: 'PC Portable', modele: 'HP EliteBook 840', dateAchat: '2023-05-14', dateDisplay: '14/05/2023', garantie: 36, obs: 'Responsable antenne Martinique' },
  { id: 'MAT-014', machine: 'PC-FDF-02', user: 'Mireille ROSEAU', os: 'Windows 11 Pro', service: 'Facturation', site: 'Fort-de-France', type: 'PC Fixe', modele: 'Dell OptiPlex 3090', dateAchat: '2023-05-14', dateDisplay: '14/05/2023', garantie: 36, obs: 'Guichet douane Fort-de-France' },
  { id: 'MAT-015', machine: 'IMP-FDF-01', user: 'Multi-services FDF', os: 'Autre', service: 'Accueil', site: 'Fort-de-France', type: 'Copieur Réseau', modele: 'Canon imageRUNNER 2625', dateAchat: '2023-05-14', dateDisplay: '14/05/2023', garantie: 48, obs: 'IP fixe 192.168.20.250' },
  { id: 'MAT-016', machine: 'PC-SXM-01', user: 'Dave HODGE', os: 'Windows 10 Pro', service: 'Logistique', site: 'Saint-Martin', type: 'PC Portable', modele: 'Lenovo ThinkPad E15', dateAchat: '2021-10-05', dateDisplay: '05/10/2021', garantie: 36, obs: 'Poste Marigot liaison instable' },
  { id: 'MAT-017', machine: 'PC-COM-01', user: 'Thomas BASTIEN', os: 'Windows 11 Pro', service: 'Commercial', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 7420', dateAchat: '2023-02-10', dateDisplay: '10/02/2023', garantie: 36, obs: 'Commercial itinérant Guadeloupe' },
  { id: 'MAT-018', machine: 'PC-COM-02', user: 'Sabrina EUGENE', os: 'Windows 11 Pro', service: 'Commercial', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 7420', dateAchat: '2023-02-10', dateDisplay: '10/02/2023', garantie: 36, obs: 'Devis grands comptes' },
  { id: 'MAT-019', machine: 'PC-QUAL-01', user: 'Yannick CLAVIER', os: 'Windows 11 Pro', service: 'Qualité & Sécurité', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 5000', dateAchat: '2024-02-01', dateDisplay: '01/02/2024', garantie: 36, obs: 'Audits QSE et normes maritimes' },
  { id: 'MAT-020', machine: 'PC-STAG-01', user: 'Poste Polyvalent', os: 'Windows 10 Pro', service: 'Support IT', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 600', dateAchat: '2019-11-12', dateDisplay: '12/11/2019', garantie: 24, obs: 'Poste atelier TIP à réinstaller' },
  { id: 'MAT-021', machine: 'PC-ACC-01', user: 'Vanessa CIRILLE', os: 'Windows 11 Pro', service: 'Accueil', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 3080', dateAchat: '2022-09-15', dateDisplay: '15/09/2022', garantie: 36, obs: 'Standard téléphonique IP' },
  { id: 'MAT-022', machine: 'PC-LOG-04', user: 'Alain GOURGUE', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2020-03-20', dateDisplay: '20/03/2020', garantie: 36, obs: 'Gestionnaire arrivage conteneurs' },
  { id: 'MAT-023', machine: 'PC-FACT-04', user: 'Cedric VAITILINGON', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2020-04-15', dateDisplay: '15/04/2020', garantie: 36, obs: 'Rapprochement bancaire' },
  { id: 'MAT-024', machine: 'PC-DIR-03', user: 'Assistante Direction', os: 'Windows 11 Pro', service: 'Direction', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 5420', dateAchat: '2022-10-01', dateDisplay: '01/10/2022', garantie: 36, obs: 'Secrétariat général' },
  { id: 'MAT-025', machine: 'PC-MAINT-01', user: 'Technicien Astreinte', os: 'Windows 10 Pro', service: 'DSI', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad L14', dateAchat: '2021-01-10', dateDisplay: '10/01/2021', garantie: 36, obs: 'Astreinte week-end et nuit' },
];

async function compilePdf(html: string, filename: string): Promise<Buffer> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ html, filename }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur Gotenberg HTTP ${res.status}: ${err}`);
  }

  const arrBuf = await res.arrayBuffer();
  return Buffer.from(arrBuf);
}

function buildStudentCleanWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const header = [
    'ID_Materiel',
    'Nom_Machine',
    'Utilisateur',
    'OS',
    'Service',
    'Site',
    'Date_Mise_En_Service',
    'Age_Poste_Annees',
    'Type_Materiel',
    'Garantie_Mois',
    'Statut_Garantie',
    'Observations_Helpdesk'
  ];

  const rows = rawCleanData.map(d => [
    d.id,
    d.machine,
    d.user,
    d.os,
    d.service,
    d.site,
    d.dateDisplay,
    '', // Age à calculer
    d.type,
    d.garantie,
    '',
    d.obs
  ]);

  const wsInventaire = XLSX.utils.aoa_to_sheet([header, ...rows]);
  wsInventaire['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 20 },
    { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
    { wch: 16 }, { wch: 38 }
  ];

  const tdbAoa = [
    ['TABLEAU DE BORD DSI - PILOTAGE ET OBSOLESCENCE DU PARC KLF', '', ''],
    ['Session TIP2 - Direction des Systèmes d\'Information Jarry', '', ''],
    ['', '', ''],
    ['1. RÉPARTITION DU PARC PAR SYSTÈME D\'EXPLOITATION (OS)', '', ''],
    ['Système d\'exploitation (OS)', 'Nombre de postes', 'Formule attendue'],
    ['Windows 10 Pro', '', '=NB.SI(Inventaire!D2:D26; "Windows 10 Pro")'],
    ['Windows 11 Pro', '', '=NB.SI(Inventaire!D2:D26; "Windows 11 Pro")'],
    ['Autre (Copieurs / Imprimantes)', '', '=NB.SI(Inventaire!D2:D26; "Autre")'],
    ['TOTAL GÉNÉRAL DU PARC', '', '=SOMME(B6:B8)'],
    ['', '', ''],
    ['2. INDICATEURS D\'OBSOLESCENCE ET DE RENOUVELLEMENT', '', ''],
    ['Indicateur DSI', 'Valeur', 'Formule attendue'],
    ['Nombre de postes vétustes (>= 5 ans)', '', '=NB.SI(Inventaire!H2:H26; ">=5")'],
    ['Taux d\'obsolescence du parc (%)', '', '=B13/B9'],
    ['Seuil d\'alerte DSI KLF', '20.0%', 'Seuil critique de renouvellement'],
    ['Statut budgétaire 2027', '', '=SI(B14>B15; "BUDGET RENOUVELLEMENT REQUIS"; "CONFORME")'],
    ['', '', ''],
    ['3. ESPACE GRAPHIQUES DÉCISIONNELS (Comité de Direction)', '', ''],
    ['Insérer ici : 1) Graphique Donut (Répartition OS) | 2) Histogramme (Obsolescence vs Seuil)', '', '']
  ];

  const wsTdb = XLSX.utils.aoa_to_sheet(tdbAoa);
  wsTdb['!cols'] = [
    { wch: 38 },
    { wch: 20 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInventaire, 'Inventaire');
  XLSX.utils.book_append_sheet(wb, wsTdb, 'TDB_Direction_DSI');

  return wb;
}

function buildTeacherCorrigéWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const header = [
    'ID_Materiel',
    'Nom_Machine',
    'Utilisateur',
    'OS',
    'Service',
    'Site',
    'Date_Mise_En_Service',
    'Age_Poste_Annees',
    'Type_Materiel',
    'Garantie_Mois',
    'Statut_Obsolescence',
    'Observations_Helpdesk'
  ];

  const rows = rawCleanData.map(d => {
    const anneeAchat = parseInt(d.dateAchat.split('-')[0], 10);
    const age = 2026 - anneeAchat;
    const statut = age >= 5 ? 'A RENOUVELER (>= 5 ans)' : 'CONFORME (< 5 ans)';
    return [
      d.id,
      d.machine,
      d.user,
      d.os,
      d.service,
      d.site,
      d.dateDisplay,
      age,
      d.type,
      d.garantie,
      statut,
      d.obs
    ];
  });

  const wsInventaire = XLSX.utils.aoa_to_sheet([header, ...rows]);
  wsInventaire['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 20 },
    { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
    { wch: 24 }, { wch: 38 }
  ];

  const tdbAoa = [
    ['TABLEAU DE BORD DSI - PILOTAGE ET OBSOLESCENCE DU PARC KLF (CORRIGÉ FORMATEUR)', '', ''],
    ['Session TIP2 - Direction des Systèmes d\'Information Jarry', '', ''],
    ['', '', ''],
    ['1. RÉPARTITION DU PARC PAR SYSTÈME D\'EXPLOITATION (OS)', '', ''],
    ['Système d\'exploitation (OS)', 'Nombre de postes', 'Formule exacte'],
    ['Windows 10 Pro', 10, '=NB.SI(Inventaire!D2:D26; "Windows 10 Pro")'],
    ['Windows 11 Pro', 12, '=NB.SI(Inventaire!D2:D26; "Windows 11 Pro")'],
    ['Autre (Copieurs / Imprimantes)', 3, '=NB.SI(Inventaire!D2:D26; "Autre")'],
    ['TOTAL GÉNÉRAL DU PARC', 25, '=SOMME(B6:B8)'],
    ['', '', ''],
    ['2. INDICATEURS D\'OBSOLESCENCE ET DE RENOUVELLEMENT', '', ''],
    ['Indicateur DSI', 'Valeur', 'Formule exacte'],
    ['Nombre de postes vétustes (>= 5 ans)', 9, '=NB.SI(Inventaire!H2:H26; ">=5")'],
    ['Taux d\'obsolescence du parc (%)', '36.0%', '=B13/B9'],
    ['Seuil d\'alerte DSI KLF', '20.0%', 'Seuil critique de renouvellement'],
    ['Statut budgétaire 2027', 'BUDGET RENOUVELLEMENT REQUIS', '=SI(B14>B15; "BUDGET RENOUVELLEMENT REQUIS"; "CONFORME")'],
    ['', '', ''],
    ['3. RECOMMANDATIONS GRAPHIQUES POUR LE COMITÉ DE DIRECTION', '', ''],
    ['Graphique 1 : Donut Répartition OS', 'Plage A5:B8', 'Couleurs : Win11 Bleu nuit (#0F172A), Win10 Orange alerte (#EA580C)'],
    ['Graphique 2 : Histogramme Obsolescence', 'Plage A14:B15', 'Taux réel (36%) en Rouge alerte face au Seuil de 20% en Vert'],
    ['MFC Onglet Inventaire', 'Colonne H2:H26', 'Règle >= 5 -> Fond rouge clair (#FEE2E2), texte rouge foncé (#991B1B)']
  ];

  const wsTdb = XLSX.utils.aoa_to_sheet(tdbAoa);
  wsTdb['!cols'] = [
    { wch: 38 },
    { wch: 28 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInventaire, 'Inventaire');
  XLSX.utils.book_append_sheet(wb, wsTdb, 'TDB_Direction_DSI');

  return wb;
}

function generateTpHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>TP Cadrage Qualiopi - Visualisation de données DSI & Graphiques KLF</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #0f172a;
      background: #fff;
      font-size: 11.2px;
      line-height: 1.42;
    }

    .page {
      width: 100%;
      height: 100%;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #0f172a;
      margin-bottom: 8px;
    }
    .header-table td {
      border: 1.5px solid #0f172a;
      padding: 6px 12px;
      vertical-align: middle;
    }
    .logo-cell { width: 20%; text-align: center; }
    .logo-cell img { max-height: 54px; display: block; margin: 0 auto; }
    .title-cell {
      width: 58%;
      text-align: center;
      line-height: 1.3;
    }
    .main-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #0f172a;
    }
    .sub-title {
      font-size: 10.5px;
      color: #475569;
      font-weight: 700;
      margin-top: 2px;
    }
    .tp-badge {
      display: inline-block;
      background: #0f172a;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 9px;
      border-radius: 3px;
      margin-top: 3px;
      text-transform: uppercase;
    }
    .ref-cell {
      width: 22%;
      text-align: right;
      font-size: 9.5px;
      line-height: 1.25;
    }
    .ref-cell img { max-height: 42px; margin-top: 3px; display: inline-block; }

    .meta-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: #f8fafc;
      border: 1.2px solid #cbd5e1;
      padding: 5px 10px;
      border-radius: 4px;
      margin-bottom: 7px;
      font-size: 10.5px;
    }
    .meta-item strong { color: #0f172a; }

    .callout {
      background: #f0fdf4;
      border: 1.2px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      padding: 6px 11px;
      border-radius: 4px;
      margin-bottom: 7px;
      font-size: 10.5px;
      line-height: 1.4;
    }
    .callout-title {
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      margin-bottom: 2px;
      font-size: 10.5px;
    }
    .callout-blue {
      background: #f8fafc;
      border: 1.2px solid #cbd5e1;
      border-left: 4px solid #0f172a;
    }
    .callout-blue .callout-title { color: #0f172a; }

    .callout-orange {
      background: #fffbeb;
      border: 1.2px solid #fde68a;
      border-left: 4px solid #ea580c;
    }
    .callout-orange .callout-title { color: #c2410c; }

    .section-header {
      background: #0f172a;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 9px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin: 7px 0 5px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-header .tag {
      background: #334155;
      font-size: 9px;
      padding: 1.5px 5px;
      border-radius: 2px;
    }

    ul, ol { margin-left: 17px; margin-bottom: 5px; }
    li { margin-bottom: 3.5px; font-size: 10.8px; line-height: 1.42; color: #1e293b; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0;
      font-size: 10.5px;
    }
    .data-table th, .data-table td {
      border: 1.2px solid #cbd5e1;
      padding: 5px 9px;
      text-align: left;
    }
    .data-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9.5px;
    }
    .formula-code {
      font-family: "Courier New", Courier, monospace;
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      font-size: 11px;
      padding: 2px 5px;
      border-radius: 3px;
      border: 1px solid #cbd5e1;
      display: inline-block;
    }

    .code-box {
      background: #0f172a;
      color: #38bdf8;
      font-family: "Courier New", Courier, monospace;
      padding: 6px 11px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      margin: 4px 0 5px 0;
      border-left: 3.5px solid #38bdf8;
    }

    .eval-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
      margin-top: 5px;
    }
    .eval-table th, .eval-table td {
      border: 1.2px solid #cbd5e1;
      padding: 4px 7px;
    }
    .eval-table th {
      background: #0f172a;
      color: #fff;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .sign-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      border: 1.2px dashed #94a3b8;
      border-radius: 4px;
    }
    .sign-table td {
      padding: 6px 10px;
      vertical-align: top;
      font-size: 9.5px;
    }

    .footer-bar {
      border-top: 1px solid #cbd5e1;
      padding-top: 3.5px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="page">
    <div>
      <table class="header-table">
        <tr>
          <td class="logo-cell">
            <img src="${FORE_LOGO_BASE64}" alt="FORE Alternance">
          </td>
          <td class="title-cell">
            <div class="main-title">Karukera Logistique & Fret (KLF)</div>
            <div class="sub-title">Direction des Systèmes d'Information • Jarry (Guadeloupe)</div>
            <span class="tp-badge">TP PALIER 1 • SÉANCE 7 (27/10/2026)</span>
          </td>
          <td class="ref-cell">
            <strong>Qualiopi Ind. 4 & 5</strong><br>
            Réf : TP-DSI-GRAPHS-271026<br>
            Titre Pro TIP (Niv. 4)<br>
            <img src="${FRANCE_TRAVAIL_LOGO_BASE64}" alt="France Travail">
          </td>
        </tr>
      </table>

      <div class="meta-bar">
        <div class="meta-item"><strong>Date :</strong> 27/10/2026 (13h30-15h30)</div>
        <div class="meta-item"><strong>Module :</strong> Palier 1 Consolidation Tableur</div>
        <div class="meta-item"><strong>Formateur :</strong> David JACQUA</div>
        <div class="meta-item"><strong>Livrable :</strong> Classeur .xlsx sur Google Drive</div>
      </div>

      <div class="callout callout-blue">
        <div class="callout-title">🏢 Contexte professionnel immersif DSI KLF</div>
        Vous intervenez comme <strong>Technicien Informatique de Proximité junior</strong> au sein de la DSI de <strong>Karukera Logistique & Fret</strong> à Jarry. Le Directeur Général <strong>Edouard LOMBARD</strong> réunit le Comité de Direction pour arbitrer le plan de renouvellement du parc 2027. Les tableaux de chiffres bruts ne suffisent plus : la Direction exige des <strong>graphiques décisionnels clairs</strong> et des <strong>alertes visuelles automatiques</strong> sur les machines critiques hors garantie.
      </div>

      <div class="callout callout-orange">
        <div class="callout-title">💡 Modalité pédagogique différenciée & Entraide</div>
        • <strong>Apprenants absents le 20/10 :</strong> démarrez par l'étape 1 pour consolider vos formules de calcul.<br>
        • <strong>Apprenants avancés :</strong> finalisez vos indicateurs, apportez votre soutien à un collègue (rôle de <em>Technicien Référent Support N2</em> valorisé au REAC) et construisez immédiatement les graphiques DSI.
      </div>

      <div class="section-header">
        <span>Étape 1 : Consolidation & Vérification du Tableau de Bord DSI</span>
        <span class="tag">Compétence CP 02</span>
      </div>
      <p style="margin-bottom: 5px;">Ouvrez votre classeur <code>KLF_Inventaire_Parc_Jarry_Base_271026.xlsx</code> sur le Drive. Dans l'onglet <strong>TDB_Direction_DSI</strong>, implémentez et validez les indicateurs clés :</p>
      
      <table class="data-table">
        <tr>
          <th>Indicateur technique DSI</th>
          <th>Formule normalisée exacte</th>
          <th>Résultat attendu</th>
        </tr>
        <tr>
          <td><strong>Windows 10 Pro</strong> (Fin support proche)</td>
          <td><span class="formula-code">=NB.SI(Inventaire!D2:D26; "Windows 10 Pro")</span></td>
          <td><strong>10 postes</strong></td>
        </tr>
        <tr>
          <td><strong>Windows 11 Pro</strong> (Standard actuel)</td>
          <td><span class="formula-code">=NB.SI(Inventaire!D2:D26; "Windows 11 Pro")</span></td>
          <td><strong>12 postes</strong></td>
        </tr>
        <tr>
          <td><strong>Autre</strong> (Copieurs / Imprimantes)</td>
          <td><span class="formula-code">=NB.SI(Inventaire!D2:D26; "Autre")</span></td>
          <td><strong>3 équipements</strong></td>
        </tr>
        <tr>
          <td><strong>TOTAL GÉNÉRAL DU PARC</strong></td>
          <td><span class="formula-code">=SOMME(B6:B8)</span></td>
          <td><strong>25 machines</strong></td>
        </tr>
        <tr>
          <td><strong>Âge du poste (Colonne H Inventaire)</strong></td>
          <td><span class="formula-code">=ANNEE(AUJOURDHUI()) - ANNEE(G2)</span></td>
          <td><em>Années écoulées</em></td>
        </tr>
        <tr>
          <td><strong>Postes vétustes (&gt;= 5 ans)</strong></td>
          <td><span class="formula-code">=NB.SI(Inventaire!H2:H26; "&gt;=5")</span></td>
          <td><strong>9 postes critiques</strong></td>
        </tr>
        <tr>
          <td><strong>Taux d'obsolescence global (%)</strong></td>
          <td><span class="formula-code">=B13/B9</span> (Format Pourcentage)</td>
          <td><strong>36,0 %</strong> (&gt; seuil 20%)</td>
        </tr>
        <tr>
          <td><strong>Décision budgétaire 2027</strong></td>
          <td><span class="formula-code">=SI(B14&gt;B15; "BUDGET RENOUVELLEMENT REQUIS"; "CONFORME")</span></td>
          <td><strong>ALERTE BUDGET</strong></td>
        </tr>
      </table>

      <div class="section-header">
        <span>Étape 2 : Création du Graphique Donut (Répartition par OS)</span>
        <span class="tag">Compétence CP 01</span>
      </div>
      <ol>
        <li>Dans l'onglet <code>TDB_Direction_DSI</code>, sélectionnez la plage <strong>A5:B8</strong> (Systèmes d'exploitation et Nombre de postes, sans inclure la ligne Total).</li>
        <li>Cliquez sur le ruban <strong>Insertion &gt; Graphiques &gt; Graphique en anneau (Donut)</strong>.</li>
        <li>Définissez le titre du graphique : <strong>RÉPARTITION DU PARC PAR OS (DSI KLF)</strong>.</li>
        <li><strong>Charte graphique DSI :</strong> Personnalisez les couleurs de secteurs :
          <ul>
            <li>Windows 11 Pro : <strong>Bleu nuit</strong> (<code>#0F172A</code>) • Parc conforme standard.</li>
            <li>Windows 10 Pro : <strong>Orange alerte</strong> (<code>#EA580C</code>) • Parc à migrer d'urgence.</li>
            <li>Autre (Périphériques) : <strong>Gris ardoise</strong> (<code>#64748B</code>).</li>
          </ul>
        </li>
        <li>Activez les <strong>Étiquettes de données</strong> pour afficher à la fois la valeur absolue et le pourcentage.</li>
      </ol>
    </div>

    <div class="footer-bar">
      <span>FORE Alternance Jarry • Titre Pro TIP • Palier 1 Tableur DSI & Visualisation</span>
      <span>Page 1 / 2</span>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page">
    <div>
      <div class="section-header">
        <span>Étape 3 : Jauge d'Obsolescence face au Seuil d'Alerte (Histogramme 2D)</span>
        <span class="tag">Aide à la Décision</span>
      </div>
      <ol>
        <li>Sélectionnez les cellules <strong>A14:B15</strong> (Taux d'obsolescence : <code>36,0%</code> et Seuil d'alerte : <code>20,0%</code>).</li>
        <li>Insérez un <strong>Histogramme 2D groupé (Barres verticales)</strong>.</li>
        <li>Attribuez le titre : <strong>TAUX D'OBSOLESCENCE VS SEUIL D'ALERTE 2027</strong>.</li>
        <li>Ajustez la mise en forme pour marquer l'urgence décisionnelle :
          <ul>
            <li>Barre Taux d'obsolescence (36%) ➔ Remplissage <strong>Rouge alerte</strong> (<code>#DC2626</code>).</li>
            <li>Barre Seuil critique (20%) ➔ Remplissage <strong>Vert foncé</strong> (<code>#16A34A</code>).</li>
          </ul>
        </li>
        <li>Positionnez ce graphique proprement sous le tableau d'obsolescence dans l'onglet <code>TDB_Direction_DSI</code>.</li>
      </ol>

      <div class="section-header">
        <span>Étape 4 : Mise en Forme Conditionnelle (MFC) dans l'Inventaire</span>
        <span class="tag">Contrôle Visuel DSI</span>
      </div>
      <p style="margin-bottom: 5px;">Pour permettre aux techniciens de repérer immédiatement les machines à remplacer sur le terrain :</p>
      <ol>
        <li>Basculez sur l'onglet <strong>Inventaire</strong> et sélectionnez la colonne des âges : plage <strong>H2:H26</strong>.</li>
        <li>Dans le ruban <strong>Accueil</strong>, cliquez sur <strong>Mise en forme conditionnelle &gt; Règles de surbrillance des cellules &gt; Supérieur ou égal à...</strong></li>
        <li>Saisissez la valeur de seuil : <strong><code>5</code></strong>.</li>
        <li>Sélectionnez le format : <strong>Remplissage rouge clair avec texte rouge foncé</strong>.</li>
        <li><strong>Épreuve du test dynamique :</strong> Modifiez temporairement la date de mise en service du poste <code>MAT-001</code> en <code>15/01/2018</code>. Vérifiez que la cellule passe immédiatement au rouge. Remettez ensuite la date d'origine (<code>15/01/2024</code>).</li>
      </ol>

      <div class="section-header">
        <span>Étape 5 : Sauvegarde & Dépôt sur Google Drive</span>
        <span class="tag">Traçabilité Qualiopi</span>
      </div>
      <ul>
        <li>Enregistrez votre classeur finalisé en respectant la charte de nommage DSI KLF :<br>
          <div class="code-box">NOM_Prenom_TDB_Graphiques_27102026.xlsx</div>
        </li>
        <li>Déposez impérativement votre fichier dans votre casier individuel Google Drive :<br>
          👉 <strong>Dossier :</strong> <code>TIP-FORE-2026_2027 / Casiers_Apprenants / 27-10-2026</code> avant <strong>15h30</strong>.
        </li>
      </ul>

      <div class="section-header">
        <span>Grille d'Évaluation Formative des Compétences REAC (CCP 1)</span>
        <span class="tag">Qualiopi Ind. 11</span>
      </div>
      <table class="eval-table">
        <tr>
          <th>Critère d'évaluation technique</th>
          <th>Indicateur d'observabilité</th>
          <th>Barème</th>
          <th>Résultat</th>
        </tr>
        <tr>
          <td><strong>1. Exactitude des formules DSI</strong></td>
          <td>NB.SI exacts ("Windows 10 Pro"), calcul d'âge dynamique en col H, taux à 36%</td>
          <td>8 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>2. Graphique Donut (Répartition OS)</strong></td>
          <td>Secteurs calibrés, légende visible, couleurs KLF (bleu/orange), pourcentages</td>
          <td>4 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>3. Histogramme d'alerte Seuil</strong></td>
          <td>Comparaison visuelle claire 36% vs 20%, titre explicite, barres contrastées</td>
          <td>3 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>4. Mise en forme conditionnelle</strong></td>
          <td>Coloration automatique rouge des 9 machines &gt;= 5 ans, réactivité dynamique</td>
          <td>3 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>5. Rigueur, Nommage & Dépôt Drive</strong></td>
          <td>Fichier normé déposé dans le casier Drive avant l'horaire de clôture (15h30)</td>
          <td>2 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
      </table>

      <table class="sign-table">
        <tr>
          <td style="width: 50%;">
            <strong>Observations & Remédiation individualisée :</strong><br>
            <div style="height: 22px; border-bottom: 1px dotted #cbd5e1; margin-top: 3px;"></div>
          </td>
          <td style="width: 50%; text-align: right;">
            <strong>Visa & Signature du Formateur Référent :</strong><br>
            <div style="font-size: 10px; color: #475569; margin-top: 2px;">David JACQUA • FORE Alternance Jarry</div>
            <div style="height: 16px;"></div>
          </td>
        </tr>
      </table>
    </div>

    <div class="footer-bar">
      <span>Titre Pro Technicien Informatique de Proximité (TIP) • Ministère du Travail • Qualiopi Ind. 11</span>
      <span>Page 2 / 2</span>
    </div>
  </div>

</body>
</html>`;
}

function generateTpMarkdown(): string {
  return `---
title: Consignes TP - Visualisation de données DSI & Graphiques KLF
date: 2026-10-27
type: consignes_tp
statut: actif
tags:
  - tp
  - tableur
  - graphiques
  - mise-en-forme-conditionnelle
  - tip2
  - klf
  - qualiopi
aliases:
  - Consignes TP Séance 7 TIP2
  - TP Graphiques DSI KLF & MFC
---

# 💻 Consignes TP : Visualisation de données DSI & Graphiques décisionnels (KLF)

> [!TIP] Document officiel d'impression & traçabilité Qualiopi
> La version imprimable officielle (2 pages A4 strictes avec logos FORE Alternance, France Travail, grille d'évaluation et visa formateur) a été compilée via Gotenberg :
> 👉 **PDF Officiel à imprimer / projeter :** [[TP_Consignes_Graphiques_DSI_MFC_271026.pdf]]

---

> [!NOTE] Contexte professionnel KLF
> Vous intervenez en tant que **Technicien Informatique de Proximité junior** au sein de la DSI de **Karukera Logistique & Fret (KLF)** à Jarry (Guadeloupe).
> Le Directeur Général **Edouard LOMBARD** réunit le Comité de Direction pour arbitrer le plan de renouvellement du parc 2027. Les tableaux de chiffres bruts ne suffisent plus : la Direction exige des **graphiques décisionnels clairs** et des **alertes visuelles automatiques** sur les machines critiques hors garantie.

---

## 🎯 Objectifs de l'intervention technique (Qualiopi Ind. 5)

1. **Valider les indicateurs d'inventaire** (\`NB.SI\` pour l'OS, calcul d'âge dynamique en colonne H, taux d'obsolescence et formule \`SI\`).
2. **Concevoir un graphique en anneau (Donut Chart)** professionnel présentant la répartition des OS pour le slide de Direction.
3. **Mettre en place un histogramme comparatif** mettant en valeur le taux d'obsolescence réel (36 %) face au seuil d'alerte (20 %).
4. **Appliquer une règle de mise en forme conditionnelle (MFC)** sur la liste du matériel pour colorer en rouge clair les postes de 5 ans et plus.
5. **Déposer le classeur finalisé** selon la norme de nommage DSI KLF sur Google Drive avant 15h30.

---

## 📋 Déroulé des étapes à réaliser

### Étape 1 : Consolidation du Tableau de Bord DSI
Ouvrez votre classeur \`KLF_Inventaire_Parc_Jarry_Base_271026.xlsx\` sur le Google Drive. Dans l'onglet **TDB_Direction_DSI**, vérifiez et complétez les calculs :

| Indicateur DSI | Formule exacte à implémenter | Résultat attendu |
| :--- | :--- | :---: |
| **Windows 10 Pro** | \`=NB.SI(Inventaire!D2:D26; "Windows 10 Pro")\` | **10 postes** |
| **Windows 11 Pro** | \`=NB.SI(Inventaire!D2:D26; "Windows 11 Pro")\` | **12 postes** |
| **Autre (Imprimantes/Copieurs)** | \`=NB.SI(Inventaire!D2:D26; "Autre")\` | **3 postes** |
| **TOTAL GÉNÉRAL DU PARC** | \`=SOMME(B6:B8)\` | **25 postes** |
| **Âge en colonne H (Inventaire)** | \`=ANNEE(AUJOURDHUI()) - ANNEE(G2)\` | *Calcul dynamique* |
| **Postes vétustes (&gt;= 5 ans)** | \`=NB.SI(Inventaire!H2:H26; ">=5")\` | **9 postes** |
| **Taux d'obsolescence (%)** | \`=B13/B9\` *(Format Pourcentage)* | **36,0 %** |
| **Décision budgétaire 2027** | \`=SI(B14>B15; "BUDGET RENOUVELLEMENT REQUIS"; "CONFORME")\` | **ALERTE BUDGET** |

---

### Étape 2 : Création du Graphique en anneau (Donut Chart) – Répartition par OS
1. Sélectionnez la plage **A5:B8** dans l'onglet \`TDB_Direction_DSI\`.
2. Cliquez sur **Insertion > Graphiques > Graphique en anneau**.
3. Titre : **RÉPARTITION DU PARC PAR OS (DSI KLF)**.
4. Couleurs de la charte DSI KLF :
   - Windows 11 Pro : **Bleu nuit** (\`#0F172A\`).
   - Windows 10 Pro : **Orange alerte** (\`#EA580C\`).
   - Autre : **Gris ardoise** (\`#64748B\`).
5. Affichez les **Étiquettes de données** avec valeurs et pourcentages.

---

### Étape 3 : Jauge d'Obsolescence face au Seuil d'Alerte (Histogramme 2D)
1. Sélectionnez les cellules **A14:B15** (Taux d'obsolescence et Seuil d'alerte).
2. Insérez un **Histogramme 2D groupé**.
3. Titre : **TAUX D'OBSOLESCENCE VS SEUIL D'ALERTE 2027**.
4. Mettez la barre du taux réel (36 %) en **Rouge alerte** et celle du seuil (20 %) en **Vert**.

---

### Étape 4 : Mise en forme conditionnelle (MFC) dans l'Inventaire
1. Dans l'onglet **Inventaire**, sélectionnez la plage **H2:H26** (Âge du poste).
2. Cliquez sur **Accueil > Mise en forme conditionnelle > Règles de surbrillance > Supérieur ou égal à...**
3. Saisissez **\`5\`** et validez le format : **Remplissage rouge clair avec texte rouge foncé**.
4. Testez la réactivité dynamique en modifiant temporairement une date récente en 2018 : la ligne doit rougir immédiatement.

---

### Étape 5 : Sauvegarde & Dépôt sur Google Drive
* Enregistrez votre classeur au format normé :
  \`NOM_Prenom_TDB_Graphiques_27102026.xlsx\`
* Déposez le fichier dans votre casier Google Drive (\`TIP-FORE-2026_2027/Casiers_Apprenants/27-10-2026\`) avant **15h30**.
`;
}

function generateFicheAnimationMarkdown(): string {
  return `---
title: Palier 1 - Séance 07 - Fiche d'animation formateur (27-10-2026)
date: 2026-10-27
type: fiche_animation_formateur
statut: pret_pour_cours
tags:
  - pedagogie
  - animation
  - tableur
  - graphiques
  - mise-en-forme-conditionnelle
  - foad
  - differenciation
  - klf
  - tip2
  - qualiopi
aliases:
  - Fiche d'animation Séance 7 TIP2
  - Guide formateur Visualisation DSI & Graphiques KLF 27-10-2026
---

# Fiche d'animation formateur : Palier 1 – Visualisation de données DSI & Graphiques décisionnels

> [!IMPORTANT] Informations administratives & traçabilité Qualiopi
> - **Centre de formation :** METAFORE Houelbourg / FORE Alternance Jarry (Guadeloupe)
> - **Session :** Titre Professionnel Technicien Informatique de Proximité (TIP2 – Session C26031A)
> - **Formateur référent :** David JACQUA
> - **Date & horaire :** Mardi 27 octobre 2026 (Après-midi 13h30 – 15h30 / 2h00)
> - **Volume horaire cumulé :** 28h00 / 85h00 (Séance 7 sur 30 / Séance 10 du chronogramme officiel)
> - **Modalité pédagogique hybride-ready :** Présentiel en salle informatique (Houelbourg) OU Distanciel synchrone Google Meet (\`https://meet.google.com/orq-tenj-fub\`) selon l'état du réseau et des accès routiers.
> - **Contexte pédagogique spécifique (Gestion de l'hétérogénéité) :**
>   - 5 apprenants absents lors de la séance précédente du 20/10 (à onboarder sur le tableur KLF).
>   - 7 apprenants ayant initié les calculs de répartition et d'âge, mais n'ayant pas finalisé le tableau complet.
>   - 2 à 3 apprenants rapides (Jordan, Thomas B.) prêts pour les extensions visuelles et l'entraide de groupe.
> - **Références réglementaires Qualiopi :**
>   - **Indicateur 4 & 5 :** Compétences professionnelles REAC ciblées (CCP 1 – Assister les utilisateurs en bureautique et parc).
>   - **Indicateur 8 & 11 :** Évaluation formative continue et traçabilité des livrables techniques.
>   - **Indicateur 10 :** Individualisation des parcours et adaptation au rythme d'apprentissage (Pédagogie différenciée & Peer-learning).
>   - **Indicateur 17, 18 & 19 :** Moyens techniques, assistance synchrone et ressources documentaires.

---

## 🎯 1. Compétences visées & objectifs pédagogiques opérationnels

### A. Compétences professionnelles REAC ciblées (CCP 1)
* **CP 01 :** Assister les utilisateurs sur leurs outils bureautiques et collaboratifs (aide technique, écoute et posture d'entraide entre collègues).
* **CP 02 :** Participer à la gestion du parc informatique et au suivi des équipements (tableaux de bord, indicateurs visuels et seuils de renouvellement).
* **CP 03 :** Capitaliser et documenter ses interventions pour le Dossier Professionnel (DP).

### B. Objectifs d'apprentissage évaluables (Indicateur 5)
À l'issue des 2 heures d'atelier, l'apprenant sera capable de :
1. **Finaliser ou vérifier l'exactitude des calculs statistiques DSI** (\`NB.SI\` pour l'OS, calcul d'âge dynamique en années via \`AUJOURDHUI()\`, taux d'obsolescence et règle de décision \`SI\`).
2. **Concevoir un graphique en anneau (Donut Chart)** professionnel présentant la ventilation du parc par OS avec légende et pourcentages lisibles pour la Direction.
3. **Mettre en place un histogramme comparatif** mettant en valeur le taux d'obsolescence réel (36 %) face au seuil d'alerte critique de la DSI KLF (20 %).
4. **Appliquer une règle de mise en forme conditionnelle (MFC)** sur la liste du matériel pour surligner automatiquement en rouge clair les postes de 5 ans et plus.
5. **Déposer le classeur finalisé** selon la norme de nommage DSI KLF sur l'espace partagé Google Drive.

---

## 🛠️ 2. Moyens pédagogiques, techniques & ressources (Indicateurs 17, 18 & 19)

* **Environnement logiciel :** Microsoft Excel 2019/2021/365 ou Google Sheets.
* **Classeur de travail apprenants :** \`KLF_Inventaire_Parc_Jarry_Base_271026.xlsx\` (accessible sur le Google Drive officiel de la promotion).
* **Classeur corrigé formateur :** [[KLF_Tableau_Bord_DSI_Graphiques_CORRIGE.xlsx]] (avec formules, MFC et graphiques finalisés).
* **Consignes et tutoriel illustré :** [[TP_Consignes_Graphiques_DSI_MFC_271026.pdf]] (fiche guide 2 pages A4).
* **Dispositif d'assistance et de différenciation (Indicateurs 10 & 18) :**
  - Vidéoprojection ou partage d'écran Google Meet pour les démonstrations de modélisation graphique.
  - Assistance Rapide Windows (\`Win + Ctrl + Q\`) ou co-édition Sheets en cas de blocage d'un apprenant distant.
  - Binômes d'entraide (Peer-learning) : valorisation des apprenants avancés en tant que *Techniciens Support N2* (+100 PTS KLF).

---

## ⏱️ 3. Déroulement minuté de la séance (13h30 – 15h30)

| Créneau | Durée | Activité pédagogique | Rôle du formateur (David) |
| :--- | :---: | :--- | :--- |
| **13h30 – 13h45** | 15 min | **Accueil, Émargement & Cadrage** | Pointage présence. Cadrage Mission DSI KLF : *« Présentation au DG Edouard Lombard à 15h30 »*. |
| **13h45 – 14h20** | 35 min | **Atelier différencié & Entraide** | Absents sur le tableau socle. Avancés sur les graphiques ou en soutien N2 (+100 PTS KLF). |
| **14h20 – 14h45** | 25 min | **Démo collective Graphiques & MFC** | Démo pas-à-pas : Donut OS avec charte KLF, Histogramme d'alerte et règle MFC rouge. |
| **14h45 – 15h15** | 30 min | **Corrigé DSI & Analyse décisionnelle** | Projection du corrigé complet : 36 % d'obsolescence, débat d'arbitrage budgétaire DSI (8 500 € HT). |
| **15h15 – 15h30** | 15 min | **Dépôt Google Drive & Clôture** | Dépôt normalisé \`NOM_Prenom_TDB_Graphiques_27102026.xlsx\` dans le casier Drive et émargement. |

---

## 📊 4. Grille d'évaluation formative (Indicateur Qualiopi 11)

| Critère d'évaluation | Indicateur de réussite | Niveau attendu |
| :--- | :--- | :---: |
| **Exactitude des formules statistiques** | Plages exactes, guillemets sur \`"Windows 10 Pro"\`, calcul d'âge correct | **100 %** |
| **Qualité du graphique en anneau** | Donut lisible, légende claire, pourcentages affichés, charte respectée | **Acquis** |
| **Mise en forme conditionnelle** | Coloration automatique rouge sur les postes &gt;= 5 ans sans débordement | **Acquis** |
| **Autonomie & Hygiène de nommage** | Fichier déposé dans le casier Drive avant 15h30 sous le nom normé | **Conforme** |
| **Posture professionnelle & Entraide** | Écoute, partage d'expérience et soutien technique aux pairs | **Remarquable** |

---

**Visa du formateur référent :**  
*David JACQUA – Formateur & Référent pédagogique TIP*  
*Document conforme Qualiopi – Séance du 27 octobre 2026*
`;
}

async function run() {
  console.log('🚀 Démarrage de la génération de la Séance 7 (27/10/2026)...');

  if (!fs.existsSync(targetBrainDir)) {
    fs.mkdirSync(targetBrainDir, { recursive: true });
    console.log(`📁 Dossier créé : ${targetBrainDir}`);
  }

  // 1. Écriture de la fiche d'animation formateur
  const ficheAnimPath = path.join(targetBrainDir, 'Palier 1 - Séance 07 - Fiche d\'animation formateur (27-10-2026).md');
  fs.writeFileSync(ficheAnimPath, generateFicheAnimationMarkdown(), 'utf-8');
  console.log('  ✅ Fiche d\'animation formateur générée : Palier 1 - Séance 07 - Fiche d\'animation formateur (27-10-2026).md');

  // 2. Écriture des consignes TP Markdown
  const tpMdPath = path.join(targetBrainDir, 'TP_Consignes_Graphiques_DSI_MFC_271026.md');
  fs.writeFileSync(tpMdPath, generateTpMarkdown(), 'utf-8');
  console.log('  ✅ Fiche consignes TP Markdown générée : TP_Consignes_Graphiques_DSI_MFC_271026.md');

  // 3. Écriture du HTML du TP
  const html = generateTpHtml();
  const htmlPath = path.join(targetBrainDir, 'TP_Consignes_Graphiques_DSI_MFC_271026.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('  ✅ Fichier HTML du TP généré avec succès !');

  // 4. Compilation Gotenberg vers PDF (2 pages A4)
  console.log('  ⏳ Compilation Gotenberg vers PDF Qualiopi...');
  try {
    const pdfBuf = await compilePdf(html, 'TP_Consignes_Graphiques_DSI_MFC_271026.pdf');
    const pdfPath = path.join(targetBrainDir, 'TP_Consignes_Graphiques_DSI_MFC_271026.pdf');
    fs.writeFileSync(pdfPath, pdfBuf);
    console.log(`  🎉 PDF officiel généré avec succès (${(pdfBuf.length / 1024).toFixed(1)} Ko) : ${pdfPath}`);
  } catch (err: any) {
    console.error('  ⚠️ Erreur compilation Gotenberg :', err.message);
  }

  // 5. Génération des classeurs Excel
  console.log('  ⏳ Génération des classeurs Excel pour la séance du 27/10/2026...');
  const baseWb = buildStudentCleanWorkbook();
  const corrigeWb = buildTeacherCorrigéWorkbook();

  const baseExcelPath = path.join(targetBrainDir, 'KLF_Inventaire_Parc_Jarry_Base_271026.xlsx');
  const corrigeExcelPath = path.join(targetBrainDir, 'KLF_Tableau_Bord_DSI_Graphiques_CORRIGE.xlsx');

  XLSX.writeFile(baseWb, baseExcelPath);
  XLSX.writeFile(corrigeWb, corrigeExcelPath);
  console.log(`  ✅ Classeur Apprenants généré : ${baseExcelPath}`);
  console.log(`  ✅ Classeur Corrigé généré : ${corrigeExcelPath}`);

  // Duplication dans 01 - Entreprise Fictive KLF
  if (fs.existsSync(klfEnterpriseDir)) {
    XLSX.writeFile(baseWb, path.join(klfEnterpriseDir, 'KLF_Inventaire_Parc_Jarry_Base_271026.xlsx'));
    XLSX.writeFile(corrigeWb, path.join(klfEnterpriseDir, 'KLF_Tableau_Bord_DSI_Graphiques_CORRIGE.xlsx'));
    console.log('  📁 Classeurs dupliqués dans 01 - Entreprise Fictive KLF');
  }

  console.log('\n🌟 Tous les supports pédagogiques de la séance du 27/10/2026 sont prêts !');
}

run().catch(console.error);
