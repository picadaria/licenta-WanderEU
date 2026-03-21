export interface Destination {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export const EU_DESTINATIONS: Destination[] = [
  { city: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3676, lng: 4.9041 },
  { city: "Athens", country: "Greece", countryCode: "GR", lat: 37.9838, lng: 23.7275 },
  { city: "Berlin", country: "Germany", countryCode: "DE", lat: 52.52, lng: 13.405 },
  { city: "Bratislava", country: "Slovakia", countryCode: "SK", lat: 48.1486, lng: 17.1077 },
  { city: "Brussels", country: "Belgium", countryCode: "BE", lat: 50.8503, lng: 4.3517 },
  { city: "Bucharest", country: "Romania", countryCode: "RO", lat: 44.4268, lng: 26.1025 },
  { city: "Budapest", country: "Hungary", countryCode: "HU", lat: 47.4979, lng: 19.0402 },
  { city: "Copenhagen", country: "Denmark", countryCode: "DK", lat: 55.6761, lng: 12.5683 },
  { city: "Dublin", country: "Ireland", countryCode: "IE", lat: 53.3498, lng: -6.2603 },
  { city: "Helsinki", country: "Finland", countryCode: "FI", lat: 60.1699, lng: 24.9384 },
  { city: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.7169, lng: -9.1395 },
  { city: "Ljubljana", country: "Slovenia", countryCode: "SI", lat: 46.0569, lng: 14.5058 },
  { city: "Luxembourg", country: "Luxembourg", countryCode: "LU", lat: 49.6116, lng: 6.1319 },
  { city: "Madrid", country: "Spain", countryCode: "ES", lat: 40.4168, lng: -3.7038 },
  { city: "Nicosia", country: "Cyprus", countryCode: "CY", lat: 35.1856, lng: 33.3823 },
  { city: "Paris", country: "France", countryCode: "FR", lat: 48.8566, lng: 2.3522 },
  { city: "Prague", country: "Czech Republic", countryCode: "CZ", lat: 50.0755, lng: 14.4378 },
  { city: "Riga", country: "Latvia", countryCode: "LV", lat: 56.9496, lng: 24.1052 },
  { city: "Rome", country: "Italy", countryCode: "IT", lat: 41.9028, lng: 12.4964 },
  { city: "Sofia", country: "Bulgaria", countryCode: "BG", lat: 42.6977, lng: 23.3219 },
  { city: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.3293, lng: 18.0686 },
  { city: "Tallinn", country: "Estonia", countryCode: "EE", lat: 59.437, lng: 24.7536 },
  { city: "Vienna", country: "Austria", countryCode: "AT", lat: 48.2082, lng: 16.3738 },
  { city: "Vilnius", country: "Lithuania", countryCode: "LT", lat: 54.6872, lng: 25.2797 },
  { city: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.2297, lng: 21.0122 },
  { city: "Zagreb", country: "Croatia", countryCode: "HR", lat: 45.815, lng: 15.9819 },
  { city: "Valletta", country: "Malta", countryCode: "MT", lat: 35.8997, lng: 14.5147 },
];
