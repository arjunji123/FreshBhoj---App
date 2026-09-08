import Config from 'react-native-config';

export interface ReverseGeocodeResult {
  formattedAddress: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Resolves a lat/lng dropped on the map picker into a human address. Uses the
 * same Google Maps API key the Android build needs for map tiles — Google
 * lets one key cover both the Maps SDK and the Geocoding API.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodeResult | null> {
  const apiKey = Config.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
    );
    const json = await response.json();
    if (json.status !== 'OK' || !json.results?.length) return null;

    const result = json.results[0];
    const components: GoogleAddressComponent[] = result.address_components ?? [];
    const find = (type: string) => components.find((c) => c.types.includes(type))?.long_name;

    return {
      formattedAddress: result.formatted_address,
      locality: find('sublocality_level_1') ?? find('sublocality') ?? find('locality'),
      city: find('locality') ?? find('administrative_area_level_2'),
      state: find('administrative_area_level_1'),
      pincode: find('postal_code'),
    };
  } catch {
    return null;
  }
}
