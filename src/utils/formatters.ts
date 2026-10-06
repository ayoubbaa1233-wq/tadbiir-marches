/**
 * Utilitaires de formatage pour l'application administrative
 */

export function formatMontant(montant: number | undefined | null): string {
  if (montant === undefined || montant === null || isNaN(montant)) {
    return '0 DH';
  }
  // Formatage avec séparateur de milliers en espace insécable
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(montant);
  return `${formatted} DH`;
}

export function formatNombre(valeur: number | undefined | null): string {
  if (valeur === undefined || valeur === null || isNaN(valeur)) {
    return '0';
  }
  return new Intl.NumberFormat('fr-FR').format(valeur);
}

export function formatHeures(heures: number | undefined | null): string {
  if (heures === undefined || heures === null || isNaN(heures)) {
    return '0 h';
  }
  return `${formatNombre(heures)} h`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatPourcentage(valeur: number): string {
  if (isNaN(valeur) || !isFinite(valeur)) return '0%';
  return `${Math.round(valeur)}%`;
}

/**
 * Arrondi monétaire strict à 2 décimales pour sécuriser l'arithmétique IEEE-754
 * Évite les imprécisions natives de JavaScript (ex: 0.1 + 0.2 => 0.3)
 */
export const roundMonetaire = (val: number): number => {
  if (isNaN(val) || !isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

/**
 * Générateur d'identifiants séquentiels uniques
 * Exemples: M001, FOR-001, INT-001, ITV-001, DEC-001, PAY-001
 */
export function generateNextId(prefix: string, existingIds: string[]): string {
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}[-_]?0*(\\d+)$`);

  for (const id of existingIds) {
    const match = id.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  const padding = nextNum < 1000 ? String(nextNum).padStart(3, '0') : String(nextNum);
  
  if (prefix === 'M') {
    return `M${padding}`;
  }
  return `${prefix}-${padding}`;
}
