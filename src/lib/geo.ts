/**
 * Calcule la distance entre deux points géographiques en utilisant la formule Haversine.
 * Retourne la distance en kilomètres.
 *
 * @param lat1 Latitude du point 1 (en degrés)
 * @param lng1 Longitude du point 1 (en degrés)
 * @param lat2 Latitude du point 2 (en degrés)
 * @param lng2 Longitude du point 2 (en degrés)
 * @returns Distance en kilomètres
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formate une distance pour l'affichage
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
