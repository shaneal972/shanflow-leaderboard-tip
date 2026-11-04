/**
 * Cœur métier pur (Clean Architecture - Couche 1 Domain)
 * Évaluation docimologique KLF & protocole anti-biais en 12 verrous pour les nouveaux quiz.
 * Zéro dépendance externe (aucun framework, aucun ORM).
 */

export interface EvaluableQuestion {
  id: string;
  points?: number | null;
}

export interface QuizEvaluationOutcome {
  scoreObtenu: number;
  totalPointsPossibles: number;
  scorePourcentage: number;
  isValidated: boolean;
  pointsAttribues: number;
}

export interface RawImportedOption {
  texte: string;
  is_correct: boolean;
  dsi_explanation: string;
}

export interface BalancedQuestionOptions {
  lettre: 'A' | 'B' | 'C' | 'D';
  texte: string;
  is_correct: boolean;
  dsi_explanation: string;
}

export interface ImportedQuizQuestionInput {
  theme?: string;
  question?: string;
  enonce?: string;
  options?: unknown;
  correct?: unknown;
  feedback?: string;
  dsi_feedback?: string;
  points?: number;
}

export interface NormalizedImportedQuestion {
  theme: string;
  enonce: string;
  points: number;
  rawOptions: RawImportedOption[];
}

export interface KlfDistributionAudit {
  counts: Record<'A' | 'B' | 'C' | 'D', number>;
  percentages: Record<'A' | 'B' | 'C' | 'D', number>;
  totalQuestions: number;
  maxConsecutiveIdentical: number;
  hasCyclicPattern: boolean;
  isCompliant: boolean;
  summaryText: string;
}

export type KlfNewQuizValidationResult =
  | {
      valid: true;
      normalizedQuestions: NormalizedImportedQuestion[];
      balancedOptions: BalancedQuestionOptions[][];
      distributionAudit: KlfDistributionAudit;
    }
  | {
      valid: false;
      errors: string[];
    };

const LETTERS: readonly ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

// Verrou 7 : Options méta formellement interdites
const META_OPTION_REGEX =
  /\b(toutes?\s+les\s+(?:r[eé]ponses|propositions|options)|aucune\s+des\s+(?:r[eé]ponses|propositions|options)|tout\s+ce\s+qui\s+pr[eé]c[eè]de|(?:les\s+)?(?:r[eé]ponses|propositions|options)\s+[a-d]\s+(?:et|ou)\s+[a-d])\b/i;

// Verrou 8 : Adverbes et marqueurs absolus
const ABSOLUTE_MARKER_REGEX =
  /(\btoujours\b|\bjamais\b|\baucun(?:e|s|es)?\b|\bobligatoirement\b|\bsyst[eé]matiquement\b|\bdans\s+100\s*%\s+des\s+cas\b)/i;

// Verrou 5 : Distracteurs absurdes / anachroniques connus
const ABSURD_DISTRACTOR_REGEX =
  /(\bdisquettes?\b|1[,.]44\s*mo|[eé]teindre\s+l['’][eé]cran|colorier\s+.*\bfeutre\b|vlc\s+media\s+player|[eé]crire\s+dessus\s+avec\s+paint)/i;

// Verrou 11 : Doubles négations alambiquées dans l'énoncé
const DOUBLE_NEGATION_REGEX =
  /(\bn['’]?est\s+pas\b.*\bne\b.*\b(?:pas|jamais|plus)\b|\bsauf\b.*\bne\s+pas\b)/i;

// Verrou 4 : Justification causale lourde insérée dans la seule bonne réponse
const INLINE_JUSTIFICATION_REGEX =
  /\b(car\s+cela\s+permet\s+de|parce\s+que\s+le\s+serveur|afin\s+de\s+garantir\s+que)\b/i;

/**
 * Évalue une copie d'examen KLF de manière déterministe.
 * Respecte strictement la sanction Sentinel Lock (0/20 si closedForCheating === true).
 */
export function evaluateQuizSubmission(params: {
  questions: EvaluableQuestion[];
  correctOptionIds: ReadonlySet<string>;
  answers: Record<string, string> | null | undefined;
  seuilValidation?: number | null;
  pointsRecompense?: number | null;
  closedForCheating?: boolean | null;
}): QuizEvaluationOutcome {
  const {
    questions,
    correctOptionIds,
    answers,
    seuilValidation = 75,
    pointsRecompense = 200,
    closedForCheating = false,
  } = params;

  let totalPointsPossibles = 0;
  for (const q of questions) {
    totalPointsPossibles += q.points ?? 1;
  }

  if (closedForCheating) {
    return {
      scoreObtenu: 0,
      totalPointsPossibles,
      scorePourcentage: 0,
      isValidated: false,
      pointsAttribues: 0,
    };
  }

  let scoreObtenu = 0;
  const safeAnswers = answers ?? {};

  for (const q of questions) {
    const chosenOptionId = safeAnswers[q.id];
    if (chosenOptionId && correctOptionIds.has(chosenOptionId)) {
      scoreObtenu += q.points ?? 1;
    }
  }

  const scorePourcentage =
    totalPointsPossibles > 0 ? Math.round((scoreObtenu / totalPointsPossibles) * 100) : 0;
  const threshold = seuilValidation ?? 75;
  const isValidated = scorePourcentage >= threshold;
  const pointsAttribues = isValidated ? (pointsRecompense ?? 200) : 0;

  return {
    scoreObtenu,
    totalPointsPossibles,
    scorePourcentage,
    isValidated,
    pointsAttribues,
  };
}

/**
 * Calcule l'audit statistique exact (Verrou 1) d'un lot d'options équilibrées.
 */
export function auditQuizOptionsDistribution(
  balancedQuestions: BalancedQuestionOptions[][]
): KlfDistributionAudit {
  const counts: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 };
  const sequence: ('A' | 'B' | 'C' | 'D')[] = [];

  for (const opts of balancedQuestions) {
    const correct = opts.find((o) => o.is_correct);
    if (correct) {
      counts[correct.lettre] += 1;
      sequence.push(correct.lettre);
    }
  }

  const totalQuestions = balancedQuestions.length;
  const percentages: Record<'A' | 'B' | 'C' | 'D', number> = {
    A: totalQuestions > 0 ? Math.round((counts.A / totalQuestions) * 1000) / 10 : 0,
    B: totalQuestions > 0 ? Math.round((counts.B / totalQuestions) * 1000) / 10 : 0,
    C: totalQuestions > 0 ? Math.round((counts.C / totalQuestions) * 1000) / 10 : 0,
    D: totalQuestions > 0 ? Math.round((counts.D / totalQuestions) * 1000) / 10 : 0,
  };

  let maxConsecutiveIdentical = 0;
  let currentStreak = 0;
  for (let i = 0; i < sequence.length; i++) {
    if (i > 0 && sequence[i] === sequence[i - 1]) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxConsecutiveIdentical) {
      maxConsecutiveIdentical = currentStreak;
    }
  }

  const joined = sequence.join('');
  const hasCyclicPattern = joined.includes('ABCDABCD') || joined.includes('DCBADCB');

  const withinBounds = LETTERS.every(
    (l) => percentages[l] >= 20 && percentages[l] <= 35
  );
  const isCompliant =
    totalQuestions > 0 &&
    withinBounds &&
    maxConsecutiveIdentical <= 2 &&
    !hasCyclicPattern;

  const summaryText = `A: ${percentages.A}% (${counts.A}), B: ${percentages.B}% (${counts.B}), C: ${percentages.C}% (${counts.C}), D: ${percentages.D}% (${counts.D})`;

  return {
    counts,
    percentages,
    totalQuestions,
    maxConsecutiveIdentical,
    hasCyclicPattern,
    isCompliant,
    summaryText,
  };
}

/**
 * Verrou 1 & Verrou 2 KLF : Répartit les bonnes réponses d'un lot de questions
 * de manière strictement homogène sur les 4 positions (A, B, C, D) [20% - 35%]
 * tout en mélangeant aléatoirement l'ordre d'apparition des positions cibles
 * et des distracteurs (sans aucun motif répétitif A-B-C-D ni série > 2 identiques).
 */
export function balanceAndShuffleQuizQuestionsOptions(
  questionsRawOptions: RawImportedOption[][],
  rng: () => number = Math.random
): BalancedQuestionOptions[][] {
  const totalQuestions = questionsRawOptions.length;
  if (totalQuestions === 0) return [];

  let targetCorrectLetters: ('A' | 'B' | 'C' | 'D')[] = [];

  for (let attempt = 0; attempt < 16; attempt++) {
    const candidate: ('A' | 'B' | 'C' | 'D')[] = [];
    for (let i = 0; i < totalQuestions; i++) {
      candidate.push(LETTERS[i % 4]);
    }

    for (let i = candidate.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
    }

    // Casser toute série >= 3 lettres identiques consécutives
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 2; i < candidate.length; i++) {
        if (candidate[i] === candidate[i - 1] && candidate[i] === candidate[i - 2]) {
          const swapIdx = candidate.findIndex(
            (l, idx) =>
              l !== candidate[i] &&
              (idx === 0 || candidate[idx - 1] !== candidate[i]) &&
              (idx === candidate.length - 1 || candidate[idx + 1] !== candidate[i])
          );
          if (swapIdx !== -1) {
            [candidate[i], candidate[swapIdx]] = [candidate[swapIdx], candidate[i]];
          }
        }
      }
    }

    const joined = candidate.join('');
    const hasCycle = joined.includes('ABCDABCD') || joined.includes('DCBADCB');
    let maxRun = 1;
    let run = 1;
    for (let i = 1; i < candidate.length; i++) {
      run = candidate[i] === candidate[i - 1] ? run + 1 : 1;
      if (run > maxRun) maxRun = run;
    }

    targetCorrectLetters = candidate;
    if (!hasCycle && maxRun <= 2) {
      break;
    }
  }

  return questionsRawOptions.map((rawOpts, qIdx) => {
    const correctOpt = rawOpts.find((o) => o.is_correct) || rawOpts[0];
    const distractors = rawOpts.filter((o) => o !== correctOpt).slice(0, 3);

    for (let i = distractors.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
    }

    const activeLetters = LETTERS.slice(0, Math.min(4, 1 + distractors.length));
    const targetLetter = activeLetters.includes(targetCorrectLetters[qIdx])
      ? targetCorrectLetters[qIdx]
      : activeLetters[qIdx % activeLetters.length];

    let distractorCursor = 0;
    return activeLetters.map((lettre) => {
      if (lettre === targetLetter && correctOpt) {
        return {
          lettre,
          texte: correctOpt.texte,
          is_correct: true,
          dsi_explanation: correctOpt.dsi_explanation,
        };
      }
      const dist = distractors[distractorCursor++] || {
        texte: 'Option complémentaire manquante.',
        is_correct: false,
        dsi_explanation: 'Incorrect.',
      };
      return {
        lettre,
        texte: dist.texte,
        is_correct: false,
        dsi_explanation: dist.dsi_explanation,
      };
    });
  });
}

/**
 * Protocole docimologique KLF en 12 verrous appliqué à tout NOUVEAU quiz importé ou généré.
 * Les quiz historiques déjà passés par la promotion ne sont pas réécrits ; seuls les nouveaux
 * quiz sont soumis à cette barrière qualité zéro-défaut avant insertion en base.
 */
export function validateAndPrepareNewQuizKlf(
  rawQuestions: ImportedQuizQuestionInput[],
  rng: () => number = Math.random
): KlfNewQuizValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(rawQuestions) || rawQuestions.length < 8 || rawQuestions.length === 11) {
    return {
      valid: false,
      errors: [
        `Verrou 1 KLF : Le quiz comporte ${Array.isArray(rawQuestions) ? rawQuestions.length : 0} question(s). Pour garantir mathématiquement une répartition entre 20 % et 35 % sur les 4 positions (A, B, C, D), un nouveau quiz doit contenir au moins 8 questions (ex. 8, 10, 12, 15 ou 20 questions ; 11 questions ne permet pas d'atteindre 20 % sur les 4 lettres).`,
      ],
    };
  }

  const normalizedQuestions: NormalizedImportedQuestion[] = [];
  let longestIsCorrectCount = 0;

  rawQuestions.forEach((q, idx) => {
    const qLabel = `Q${idx + 1}`;
    const enonce = String(q.question ?? q.enonce ?? '').trim();
    const theme = String(q.theme ?? 'Général').trim() || 'Général';
    const dsiFeedback = String(q.dsi_feedback ?? q.feedback ?? '').trim();
    const points = typeof q.points === 'number' && q.points > 0 ? Math.round(q.points) : 1;

    if (enonce.length < 15) {
      errors.push(`${qLabel} : L'énoncé est trop court ou manquant (minimum 15 caractères).`);
    }

    if (DOUBLE_NEGATION_REGEX.test(enonce)) {
      errors.push(
        `${qLabel} (Verrou 11 — Doubles négations) : Reformuler l'énoncé de manière directe et affirmative.`
      );
    }

    if (dsiFeedback.length < 15) {
      errors.push(
        `${qLabel} (Verrou 4 — L'œil du DSI) : Le champ "feedback" / "dsi_feedback" est obligatoire (minimum 15 caractères) pour le corrigé différé.`
      );
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(
        `${qLabel} (Verrous 1 & 5) : Chaque question doit comporter exactement 4 options (reçu : ${Array.isArray(q.options) ? q.options.length : 0}).`
      );
      return;
    }

    const correctIdx = typeof q.correct === 'number' ? q.correct : Number(q.correct);
    if (!Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx > 3) {
      errors.push(
        `${qLabel} : L'indice "correct" doit être un entier compris entre 0 et 3 (reçu : ${String(q.correct)}).`
      );
      return;
    }

    const optionTexts = q.options.map((opt) => String(opt ?? '').trim());
    const normalizedSet = new Set(optionTexts.map((t) => t.toLowerCase()));
    if (normalizedSet.size !== 4) {
      errors.push(`${qLabel} : Les 4 propositions doivent être strictement distinctes.`);
    }

    optionTexts.forEach((optText, oIdx) => {
      if (optText.length < 3) {
        errors.push(`${qLabel} (Option ${oIdx + 1}) : Texte d'option vide ou trop court.`);
      }
      if (META_OPTION_REGEX.test(optText)) {
        errors.push(
          `${qLabel} (Verrou 7 — Option méta interdite) : Bannir « Toutes les réponses / Aucune des réponses / A et B » dans "${optText}".`
        );
      }
      if (ABSURD_DISTRACTOR_REGEX.test(optText)) {
        errors.push(
          `${qLabel} (Verrou 5 — Anti-homme de paille) : Distracteur caricatural ou anachronique détecté dans "${optText}".`
        );
      }
    });

    const correctText = optionTexts[correctIdx];
    const distractorTexts = optionTexts.filter((_, oIdx) => oIdx !== correctIdx);

    // Verrou 8 : Adverbe absolu unilatéral dans un distracteur face à une bonne réponse nuancée
    const correctHasAbsolute = ABSOLUTE_MARKER_REGEX.test(correctText);
    if (!correctHasAbsolute) {
      const flaggedDistractor = distractorTexts.find((d) => ABSOLUTE_MARKER_REGEX.test(d));
      if (flaggedDistractor) {
        errors.push(
          `${qLabel} (Verrou 8 — Adverbe absolu unilatéral) : Le distracteur "${flaggedDistractor}" utilise un marqueur absolu (toujours/jamais/aucun/obligatoirement) absent de la bonne réponse.`
        );
      }
    }

    // Verrou 4 : Justification causale logée uniquement dans la bonne réponse
    if (
      INLINE_JUSTIFICATION_REGEX.test(correctText) &&
      !distractorTexts.some((d) => INLINE_JUSTIFICATION_REGEX.test(d))
    ) {
      errors.push(
        `${qLabel} (Verrou 4 — Sanctuarisation de la justification) : Déplacer l'explication causale de la bonne réponse vers "dsi_feedback".`
      );
    }

    // Verrou 3 : Iso-gabarit visuel (écart maximal de 25 % entre la plus courte et la plus longue option, plancher de 10 caractères pour formules courtes)
    const lengths = optionTexts.map((t) => t.length);
    const maxLen = Math.max(...lengths);
    const minLen = Math.min(...lengths);
    const allowedSpread = Math.max(10, Math.ceil(maxLen * 0.25));
    if (maxLen - minLen > allowedSpread) {
      errors.push(
        `${qLabel} (Verrou 3 — Iso-gabarit visuel ±25 %) : Écart de longueur excessif entre les options (min ${minLen} car., max ${maxLen} car., écart autorisé ≤ ${allowedSpread} car.). Harmoniser le gabarit des 4 propositions.`
      );
    }

    const maxDistractorLen = Math.max(...distractorTexts.map((d) => d.length));
    if (correctText.length > Math.ceil(maxDistractorLen * 1.1)) {
      longestIsCorrectCount += 1;
    }

    normalizedQuestions.push({
      theme,
      enonce,
      points,
      rawOptions: optionTexts.map((texte, oIdx) => ({
        texte,
        is_correct: oIdx === correctIdx,
        dsi_explanation:
          oIdx === correctIdx ? dsiFeedback : `Incorrect. ${dsiFeedback}`,
      })),
    });
  });

  // Verrou 3 global : La bonne réponse ne doit pas être systématiquement la plus longue (> 35 % du quiz)
  if (
    rawQuestions.length > 0 &&
    longestIsCorrectCount / rawQuestions.length > 0.35
  ) {
    errors.push(
      `Verrou 3 KLF (Anti-Longest Answer Bias) : La bonne réponse est la proposition la plus longue dans ${longestIsCorrectCount}/${rawQuestions.length} questions (${Math.round((longestIsCorrectCount / rawQuestions.length) * 100)} % > 35 %). Étoffer les distracteurs ou conciser les bonnes réponses.`
    );
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const balancedOptions = balanceAndShuffleQuizQuestionsOptions(
    normalizedQuestions.map((q) => q.rawOptions),
    rng
  );
  const distributionAudit = auditQuizOptionsDistribution(balancedOptions);

  if (!distributionAudit.isCompliant) {
    return {
      valid: false,
      errors: [
        `Verrou 1 KLF : Échec de l'audit statistique après brassage (${distributionAudit.summaryText}).`,
      ],
    };
  }

  return {
    valid: true,
    normalizedQuestions,
    balancedOptions,
    distributionAudit,
  };
}
