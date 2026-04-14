import { supabase } from '../lib/supabase';

export type DeliveryZone = {
  name: string;
  fee: number;
  free_over: number;
  time: string;
  label: string;
};

export type StoreSettings = {
  storeName: string;
  storeTagline: string;
  storePhone: string;
  storeEmail: string;
  storeWhatsApp: string;
  pochiNumber: string;
  pochiName: string;
  freeDeliveryThreshold: number;
  defaultDeliveryFee: number;
  workingHours: string;
  deliveryZones: DeliveryZone[];
  adminPassword: string;
};

const defaults: StoreSettings = {
  storeName: 'ZeshViv Perfumes',
  storeTagline: "Mombasa's Premium Perfume Store",
  storePhone: '0723424962',
  storeEmail: 'jamilodipo@gmail.com',
  storeWhatsApp: '0723424962',
  pochiNumber: '0723424962',
  pochiName: 'ZeshViv Perfumes',
  freeDeliveryThreshold: 3000,
  defaultDeliveryFee: 200,
  workingHours: '8am – 9pm daily',
  deliveryZones: [
    { name: 'Mombasa CBD', fee: 0, free_over: 3000, time: '1-2 hours', label: 'FREE over KES 3k, else KES 150' },
    { name: 'Nyali & Bamburi', fee: 200, free_over: 99999, time: '2-3 hours', label: 'KES 200' },
    { name: 'Likoni & South Coast', fee: 250, free_over: 99999, time: '2-4 hours', label: 'KES 250' },
    { name: 'Kisauni & Bombolulu', fee: 200, free_over: 99999, time: '2-3 hours', label: 'KES 200' },
    { name: 'Mtwapa', fee: 300, free_over: 99999, time: '3-4 hours', label: 'KES 300' },
    { name: 'Diani & Ukunda', fee: 400, free_over: 99999, time: 'Next day', label: 'KES 400' },
  ],
  adminPassword: 'zeshviv2025',
};

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await supabase.from('store_settings').select('*');
    if (error || !data) return defaults;

    const map: Record<string, string> = {};
    data.forEach(row => { map[row.key] = row.value; });

    let zones: DeliveryZone[] = [];
    try { zones = JSON.parse(map['delivery_zones'] || '[]'); } catch { /* use default */ }

    return {
      storeName: map['store_name'] || defaults.storeName,
      storeTagline: map['store_tagline'] || defaults.storeTagline,
      storePhone: map['store_phone'] || defaults.storePhone,
      storeEmail: map['store_email'] || defaults.storeEmail,
      storeWhatsApp: map['store_whatsapp'] || defaults.storeWhatsApp,
      pochiNumber: map['pochi_number'] || defaults.pochiNumber,
      pochiName: map['pochi_name'] || defaults.pochiName,
      freeDeliveryThreshold: Number(map['free_delivery_threshold']) || defaults.freeDeliveryThreshold,
      defaultDeliveryFee: Number(map['default_delivery_fee']) || defaults.defaultDeliveryFee,
      workingHours: map['working_hours'] || defaults.workingHours,
      deliveryZones: zones.length ? zones : defaults.deliveryZones,
      adminPassword: map['admin_password'] || defaults.adminPassword,
    };
  } catch {
    return defaults;
  }
}
