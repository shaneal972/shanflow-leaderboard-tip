import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface StudentRecord {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  equipe: string;
  is_admin: boolean;
  pin_code?: string;
}

const FORBIDDEN_PINS = new Set([
  '2026', '0000', '1111', '2222', '3333', '4444',
  '5555', '6666', '7777', '8888', '9999', '1234', '4321'
]);

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Erreur : Variables d\'environnement Supabase manquantes.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: 'tip' },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  console.log('🔄 Récupération des 12 apprenants de la Session C26031A...');
  const { data: students, error: fetchError } = await supabase
    .from('sf_apprenants')
    .select('id, prenom, nom, email, equipe, is_admin, pin_code')
    .eq('is_admin', false)
    .order('nom', { ascending: true })
    .order('prenom', { ascending: true });

  if (fetchError || !students) {
    console.error('❌ Erreur lors de la récupération des apprenants :', fetchError?.message);
    process.exit(1);
  }

  console.log(`✅ ${students.length} apprenants trouvés.`);

  const usedPins = new Set<string>();
  const updatedStudents: (StudentRecord & { pin_code: string })[] = [];

  for (const student of students as StudentRecord[]) {
    let pin = '';
    let attempts = 0;
    do {
      pin = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;
      if (attempts > 10000) {
        throw new Error('Impossible de générer un code PIN unique.');
      }
    } while (FORBIDDEN_PINS.has(pin) || usedPins.has(pin));

    usedPins.add(pin);

    // Mise à jour BDD Supabase
    const { error: updateError } = await supabase
      .from('sf_apprenants')
      .update({ pin_code: pin })
      .eq('id', student.id);

    if (updateError) {
      console.error(`❌ Échec mise à jour pour ${student.prenom} ${student.nom} :`, updateError.message);
      process.exit(1);
    }

    updatedStudents.push({
      ...student,
      pin_code: pin,
    });
  }

  console.log('✅ Tous les apprenants ont été mis à jour dans Supabase (tip.sf_apprenants).');

  // 2. Synchronisation de supabase/schema.sql
  const schemaPath = path.resolve(process.cwd(), 'supabase', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    let schemaUpdatedCount = 0;

    for (const student of updatedStudents) {
      // Expression régulière ciblant spécifiquement la ligne de l'étudiant
      const studentRegex = new RegExp(
        `('${student.email}'[\\s\\S]*?,\\s*false,\\s*)'[^']+'(,\\s*true\\)?)`,
        'g'
      );

      if (studentRegex.test(schemaContent)) {
        schemaContent = schemaContent.replace(
          studentRegex,
          `$1'${student.pin_code}'$2`
        );
        schemaUpdatedCount++;
      }
    }

    fs.writeFileSync(schemaPath, schemaContent, 'utf-8');
    console.log(`✅ ${schemaUpdatedCount}/12 PIN synchronisés dans supabase/schema.sql.`);
  } else {
    console.warn('⚠️ Fichier supabase/schema.sql introuvable.');
  }

  // 3. Affichage récapitulatif
  console.log('\n========================================================================================');
  console.log('📌 RÉCAPITULATIF DES CODES PIN ATTRIBUÉS - PROMOTION TIP METAFORE (SESSION C26031A)');
  console.log('========================================================================================');

  const tableData = updatedStudents.map((s, index) => ({
    'N°': index + 1,
    'Nom': s.nom,
    'Prénom': s.prenom,
    'Escouade': s.equipe,
    'Email': s.email,
    'Code PIN': s.pin_code,
  }));

  console.table(tableData);
  console.log('========================================================================================\n');
}

main().catch((err) => {
  console.error('❌ Erreur inattendue :', err);
  process.exit(1);
});
