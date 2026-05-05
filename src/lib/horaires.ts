/**
 * Types pour les horaires d'ouverture
 */
export interface DaySchedule {
  open: string; // "08:00"
  close: string; // "20:00"
  closed?: boolean; // true si fermé ce jour
}

export interface WeekSchedule {
  lundi: DaySchedule;
  mardi: DaySchedule;
  mercredi: DaySchedule;
  jeudi: DaySchedule;
  vendredi: DaySchedule;
  samedi: DaySchedule;
  dimanche: DaySchedule;
}

const DAY_KEYS: (keyof WeekSchedule)[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
];

/**
 * Retourne la clé du jour actuel en français (Abidjan = UTC+0)
 */
export function getCurrentDayKey(): keyof WeekSchedule {
  // Abidjan est en UTC+0 (GMT), pas de décalage
  const now = new Date();
  const dayIndex = now.getUTCDay(); // 0=dimanche, 1=lundi, ...
  // Mapper vers nos clés françaises
  const mapping: Record<number, keyof WeekSchedule> = {
    0: 'dimanche',
    1: 'lundi',
    2: 'mardi',
    3: 'mercredi',
    4: 'jeudi',
    5: 'vendredi',
    6: 'samedi',
  };
  return mapping[dayIndex];
}

/**
 * Retourne l'heure actuelle en minutes depuis minuit (UTC+0 pour Abidjan)
 */
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getUTCHours() * 60 + now.getUTCMinutes();
}

/**
 * Convertit une heure "HH:MM" en minutes depuis minuit
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Détermine si un supermarché est ouvert maintenant
 * en fonction de ses horaires et de l'heure actuelle à Abidjan (UTC+0)
 *
 * @param horairesJson - JSON string des horaires de la semaine
 * @returns true si le supermarché est ouvert
 */
export function estOuvertMaintenant(horairesJson: string): boolean {
  try {
    const horaires = JSON.parse(horairesJson) as Partial<WeekSchedule>;
    const today = getCurrentDayKey();
    const todaySchedule = horaires[today];

    if (!todaySchedule || todaySchedule.closed) {
      return false;
    }

    const now = getCurrentTimeInMinutes();
    const openTime = timeToMinutes(todaySchedule.open);
    const closeTime = timeToMinutes(todaySchedule.close);

    return now >= openTime && now <= closeTime;
  } catch {
    // Si les horaires ne sont pas parsables, on considère fermé par sécurité
    return false;
  }
}

/**
 * Retourne les horaires du jour en format lisible
 */
export function getHorairesAujourdhui(horairesJson: string): string {
  try {
    const horaires = JSON.parse(horairesJson) as Partial<WeekSchedule>;
    const today = getCurrentDayKey();
    const todaySchedule = horaires[today];

    if (!todaySchedule || todaySchedule.closed) {
      return 'Fermé aujourd\'hui';
    }

    return `${todaySchedule.open} - ${todaySchedule.close}`;
  } catch {
    return 'Horaires non disponibles';
  }
}

/**
 * Retourne les horaires de la semaine en format lisible
 */
export function getHorairesSemaine(horairesJson: string): { jour: string; horaire: string }[] {
  try {
    const horaires = JSON.parse(horairesJson) as Partial<WeekSchedule>;
    const dayLabels: Record<keyof WeekSchedule, string> = {
      lundi: 'Lundi',
      mardi: 'Mardi',
      mercredi: 'Mercredi',
      jeudi: 'Jeudi',
      vendredi: 'Vendredi',
      samedi: 'Samedi',
      dimanche: 'Dimanche',
    };

    return DAY_KEYS.map((key) => {
      const schedule = horaires[key];
      return {
        jour: dayLabels[key],
        horaire:
          !schedule || schedule.closed
            ? 'Fermé'
            : `${schedule.open} - ${schedule.close}`,
      };
    });
  } catch {
    return DAY_KEYS.map((key) => ({
      jour: key,
      horaire: 'Non disponible',
    }));
  }
}
