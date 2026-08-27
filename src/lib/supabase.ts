import { supabase } from '../../supabase/client';
import { supabaseServer } from '../../supabase/server';
import { 
  Apprenant, 
  Badge, 
  LeaderboardApprenant, 
  TicketKLF, 
  DPSuivi 
} from '@/types/tip';
import { 
  MOCK_APPRENANTS, 
  MOCK_BADGES, 
  MOCK_TICKETS, 
  MOCK_ACHIEVEMENTS, 
  MOCK_DP_SUIVI, 
  getPublicLeaderboard 
} from '@/data/mockData';

export { supabase, supabaseServer };

/**
 * Récupère le classement public pseudo-anonymisé (RGPD).
 * Tente d'abord la vue sécurisée tip.v_leaderboard_public, sinon bascule sur le mock enrichi.
 */
export async function getLeaderboardData(): Promise<LeaderboardApprenant[]> {
  try {
    const { data, error } = await supabase
      .from('v_leaderboard_public')
      .select('*');

    if (error || !data || data.length === 0) {
      return getPublicLeaderboard();
    }

    // Récupération du compte de badges pour chaque apprenant
    const { data: achievements } = await supabase
      .from('sf_achievements')
      .select('apprenant_id, badge_id');

    const badgeCounts: Record<string, number> = {};
    if (achievements) {
      achievements.forEach((ach) => {
        badgeCounts[ach.apprenant_id] = (badgeCounts[ach.apprenant_id] || 0) + 1;
      });
    }

    return data.map((item, index) => ({
      ...item,
      rank: index + 1,
      badges_count: badgeCounts[item.id] || 0,
    }));
  } catch {
    return getPublicLeaderboard();
  }
}

/**
 * Récupère le profil complet d'un apprenant pour son passeport personnel.
 */
export async function getApprenantById(id: string): Promise<Apprenant | null> {
  try {
    const { data, error } = await supabase
      .from('sf_apprenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      const mock = MOCK_APPRENANTS.find((a) => a.id === id);
      return mock || null;
    }

    return data;
  } catch {
    const mock = MOCK_APPRENANTS.find((a) => a.id === id);
    return mock || null;
  }
}

/**
 * Récupère tous les badges avec le statut débloqué pour un apprenant donné.
 */
export async function getBadgesWithStatus(apprenantId: string): Promise<Badge[]> {
  try {
    const { data: badgesData, error: badgesError } = await supabase
      .from('sf_badges')
      .select('*')
      .order('points_requis', { ascending: true });

    const allBadges = (!badgesError && badgesData && badgesData.length > 0) 
      ? badgesData 
      : MOCK_BADGES;

    const { data: achievements, error: achError } = await supabase
      .from('sf_achievements')
      .select('badge_id, obtenu_le')
      .eq('apprenant_id', apprenantId);

    const unlockedMap: Record<string, string> = {};
    if (!achError && achievements) {
      achievements.forEach((ach) => {
        unlockedMap[ach.badge_id] = ach.obtenu_le;
      });
    } else {
      const mockAch = MOCK_ACHIEVEMENTS[apprenantId] || [];
      mockAch.forEach((badgeId) => {
        unlockedMap[badgeId] = new Date().toISOString();
      });
    }

    return allBadges.map((badge) => ({
      ...badge,
      unlocked: !!unlockedMap[badge.id],
      obtenu_le: unlockedMap[badge.id],
    }));
  } catch {
    const mockAch = MOCK_ACHIEVEMENTS[apprenantId] || [];
    return MOCK_BADGES.map((b) => ({
      ...b,
      unlocked: mockAch.includes(b.id),
      obtenu_le: mockAch.includes(b.id) ? new Date().toISOString() : undefined,
    }));
  }
}

/**
 * Récupère les tickets du Helpdesk KLF.
 */
export async function getTicketsData(): Promise<TicketKLF[]> {
  try {
    const { data, error } = await supabase
      .from('sf_tickets_klf')
      .select('*')
      .order('urgence', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_TICKETS;
    }

    return data;
  } catch {
    return MOCK_TICKETS;
  }
}

/**
 * Récupère le suivi DP REAC d'un apprenant.
 */
export async function getDPSuiviByApprenant(apprenantId: string): Promise<DPSuivi> {
  try {
    const { data, error } = await supabase
      .from('sf_dp_suivi')
      .select('*')
      .eq('apprenant_id', apprenantId)
      .single();

    if (error || !data) {
      return MOCK_DP_SUIVI[apprenantId] || {
        apprenant_id: apprenantId,
        rubrique_1: false,
        rubrique_2: false,
        rubrique_3: false,
        rubrique_4: false,
        rubrique_5: false,
        statut_dp: 'brouillon',
      };
    }

    return data;
  } catch {
    return MOCK_DP_SUIVI[apprenantId] || {
      apprenant_id: apprenantId,
      rubrique_1: false,
      rubrique_2: false,
      rubrique_3: false,
      rubrique_4: false,
      rubrique_5: false,
      statut_dp: 'brouillon',
    };
  }
}

/**
 * Récupère tous les apprenants avec identité complète pour l'administration.
 */
export async function getAllApprenantsAdmin(): Promise<Apprenant[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_apprenants')
      .select('*')
      .order('points_total', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_APPRENANTS;
    }
    return data;
  } catch {
    return MOCK_APPRENANTS;
  }
}

/**
 * Récupère tous les badges pour le cockpit d'administration.
 */
export async function getAllBadgesAdmin(): Promise<Badge[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_badges')
      .select('*')
      .order('points_requis', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_BADGES;
    }
    return data;
  } catch {
    return MOCK_BADGES;
  }
}

/**
 * Récupère toutes les liaisons apprenant-badges (achievements).
 */
export async function getAllAchievementsAdmin(): Promise<{ apprenant_id: string; badge_id: string; obtenu_le?: string }[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_achievements')
      .select('apprenant_id, badge_id, obtenu_le');

    if (error || !data) {
      const mockList: { apprenant_id: string; badge_id: string; obtenu_le?: string }[] = [];
      Object.entries(MOCK_ACHIEVEMENTS).forEach(([apprenantId, badgeIds]) => {
        badgeIds.forEach((badgeId) => {
          mockList.push({ apprenant_id: apprenantId, badge_id: badgeId, obtenu_le: new Date().toISOString() });
        });
      });
      return mockList;
    }
    return data;
  } catch {
    const mockList: { apprenant_id: string; badge_id: string; obtenu_le?: string }[] = [];
    Object.entries(MOCK_ACHIEVEMENTS).forEach(([apprenantId, badgeIds]) => {
      badgeIds.forEach((badgeId) => {
        mockList.push({ apprenant_id: apprenantId, badge_id: badgeId, obtenu_le: new Date().toISOString() });
      });
    });
    return mockList;
  }
}

/**
 * Récupère l'ensemble des fiches de suivi DP pour la promotion.
 */
export async function getAllDPSuiviAdmin(): Promise<DPSuivi[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_dp_suivi')
      .select('*');

    if (error || !data || data.length === 0) {
      return Object.values(MOCK_DP_SUIVI);
    }
    return data;
  } catch {
    return Object.values(MOCK_DP_SUIVI);
  }
}
