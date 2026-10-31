export const COUNTRY_OPTIONS = [
  { code: "IN", label: "India", value: "IN India" },
  { code: "US", label: "United States", value: "US United States" },
  { code: "GB", label: "United Kingdom", value: "GB United Kingdom" },
  { code: "SG", label: "Singapore", value: "SG Singapore" },
  { code: "AE", label: "United Arab Emirates", value: "AE United Arab Emirates" },
  { code: "MY", label: "Malaysia", value: "MY Malaysia" },
  { code: "AU", label: "Australia", value: "AU Australia" },
  { code: "CA", label: "Canada", value: "CA Canada" },
  { code: "DE", label: "Germany", value: "DE Germany" },
  { code: "FR", label: "France", value: "FR France" },
  { code: "LK", label: "Sri Lanka", value: "LK Sri Lanka" },
];

export const DEFAULT_COUNTRY_GPS: Record<string, { latitude: number; longitude: number; accuracy: number }> = {
  IN: { latitude: 13.0827, longitude: 80.2707, accuracy: 25 }, // Chennai, India
  US: { latitude: 37.7749, longitude: -122.4194, accuracy: 25 }, // US
  GB: { latitude: 51.5074, longitude: -0.1278, accuracy: 25 }, // London, UK
  SG: { latitude: 1.3521, longitude: 103.8198, accuracy: 25 }, // Singapore
  AE: { latitude: 25.2048, longitude: 55.2708, accuracy: 25 }, // Dubai, UAE
  MY: { latitude: 3.1390, longitude: 101.6869, accuracy: 25 }, // Kuala Lumpur, Malaysia
  AU: { latitude: -33.8688, longitude: 151.2093, accuracy: 25 }, // Sydney, Australia
  CA: { latitude: 43.6532, longitude: -79.3832, accuracy: 25 }, // Toronto, Canada
  DE: { latitude: 52.5200, longitude: 13.4050, accuracy: 25 }, // Berlin, Germany
  FR: { latitude: 48.8566, longitude: 2.3522, accuracy: 25 }, // Paris, France
  LK: { latitude: 6.9271, longitude: 79.8612, accuracy: 25 }, // Colombo, Sri Lanka
};

