// M1 SERV - Geolocation and Google Maps Engine

export interface GeoLocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
  addressSuggestion?: string;
}

/**
 * Capture high-accuracy browser GPS coordinates
 */
export async function getCurrentCoordinates(): Promise<GeoLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        // Fallback default coordinates (São Paulo, Central)
        resolve({
          lat: -23.561684,
          lng: -46.655981,
          accuracy: 50,
          addressSuggestion: 'Av. Paulista, São Paulo - SP'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Generate direct Google Maps navigation URL
 */
export function getGoogleMapsNavigationUrl(lat: number, lng: number, address?: string): string {
  if (lat && lng && (lat !== 0 || lng !== 0)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return `https://www.google.com/maps/@-23.561684,-46.655981,15z`;
}

/**
 * Generate Google Maps search / pin URL
 */
export function getGoogleMapsSearchUrl(address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Generate WhatsApp share message with direct GPS link
 */
export function getMapsWhatsAppShareUrl(
  serviceCode: string,
  serviceTitle: string,
  clientName: string,
  address: string,
  lat: number,
  lng: number,
  providerPhone?: string
): string {
  const mapsUrl = getGoogleMapsNavigationUrl(lat, lng, address);
  const message = `📍 *M1 SERV - ROTA GPS DO CHAMADO ${serviceCode}*\n\n` +
    `🔧 *Serviço:* ${serviceTitle}\n` +
    `👤 *Cliente:* ${clientName}\n` +
    `🏠 *Endereço:* ${address}\n\n` +
    `🗺️ *Clique para abrir GPS no Google Maps:*\n${mapsUrl}\n\n` +
    `⚡ M1 Brasil Serviços Técnicos Credenciados`;

  const phoneParam = providerPhone ? providerPhone.replace(/\D/g, '') : '';
  const baseUrl = phoneParam ? `https://wa.me/55${phoneParam}?text=` : `https://api.whatsapp.com/send?text=`;
  return `${baseUrl}${encodeURIComponent(message)}`;
}

/**
 * Calculate distance in Kilometers between two coordinates using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
