import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface SettingsPageProps {
  showToast: (type: 'success' | 'error', message: string) => void;
}

type DeliveryZone = {
  name: string;
  fee: number;
  free_over: number;
  time: string;
  label: string;
};

export default function SettingsPage({ showToast }: SettingsPageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach(row => {
        settingsMap[row.key] = row.value;
      });
      setSettings(settingsMap);
      setAdminPassword(settingsMap['admin_password'] || 'zeshviv2025');

      try {
        const parsedZones = JSON.parse(settingsMap['delivery_zones'] || '[]');
        setZones(parsedZones);
      } catch {
        setZones([]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save delivery zones as JSON
      const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));

      // Add zones
      rows.push({ key: 'delivery_zones', value: JSON.stringify(zones) });
      rows.push({ key: 'admin_password', value: adminPassword });

      // Upsert each setting
      for (const row of rows) {
        const { error } = await supabase
          .from('store_settings')
          .upsert({ key: row.key, value: row.value, updated_at: new Date().toISOString() });
        if (error) throw error;
      }

      showToast('success', 'Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showToast('error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateZone = (index: number, field: keyof DeliveryZone, value: string | number) => {
    setZones(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addZone = () => {
    setZones(prev => [...prev, { name: '', fee: 0, free_over: 99999, time: '', label: '' }]);
  };

  const removeZone = (index: number) => {
    setZones(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin text-5xl mb-4">⚙️</div>
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400";

  return (
    <div className="space-y-6">
      {/* Save button */}
      <div className="flex items-center justify-end gap-3 sticky top-20 z-30">
        <button
          onClick={fetchSettings}
          className="bg-white border border-gray-200 hover:border-amber-400 text-gray-700 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          🔄 Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${
            saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {saving ? '💾 Saving...' : '💾 Save All Settings'}
        </button>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-900 text-white px-5 py-3">
          <h3 className="font-bold text-sm">🏪 Store Information</h3>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Store Name</label>
            <input type="text" value={settings['store_name'] || ''} onChange={e => updateSetting('store_name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tagline</label>
            <input type="text" value={settings['store_tagline'] || ''} onChange={e => updateSetting('store_tagline', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
            <input type="text" value={settings['store_phone'] || ''} onChange={e => updateSetting('store_phone', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input type="email" value={settings['store_email'] || ''} onChange={e => updateSetting('store_email', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp Number</label>
            <input type="text" value={settings['store_whatsapp'] || ''} onChange={e => updateSetting('store_whatsapp', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Working Hours</label>
            <input type="text" value={settings['working_hours'] || ''} onChange={e => updateSetting('working_hours', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-green-700 text-white px-5 py-3">
          <h3 className="font-bold text-sm">💰 Payment Settings</h3>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pochi la Biashara Number</label>
            <input type="text" value={settings['pochi_number'] || ''} onChange={e => updateSetting('pochi_number', e.target.value)} className={inputClass} />
            <p className="text-[10px] text-gray-400 mt-1">Customers will send payment to this number</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pochi Business Name</label>
            <input type="text" value={settings['pochi_name'] || ''} onChange={e => updateSetting('pochi_name', e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-blue-700 text-white px-5 py-3">
          <h3 className="font-bold text-sm">🚚 Delivery Settings</h3>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Default Delivery Fee (KES)</label>
            <input type="number" value={settings['default_delivery_fee'] || '200'} onChange={e => updateSetting('default_delivery_fee', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Free Delivery Threshold (KES)</label>
            <input type="number" value={settings['free_delivery_threshold'] || '3000'} onChange={e => updateSetting('free_delivery_threshold', e.target.value)} className={inputClass} />
            <p className="text-[10px] text-gray-400 mt-1">Orders above this amount get free delivery (CBD only)</p>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-900">Delivery Zones</h4>
            <button onClick={addZone} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-amber-400">
              + Add Zone
            </button>
          </div>
          <div className="space-y-3">
            {zones.map((zone, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Zone #{i + 1}</span>
                  <button onClick={() => removeZone(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                    ✕ Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <input type="text" placeholder="Zone Name" value={zone.name} onChange={e => updateZone(i, 'name', e.target.value)} className={inputClass} />
                  <input type="number" placeholder="Fee" value={zone.fee} onChange={e => updateZone(i, 'fee', Number(e.target.value))} className={inputClass} />
                  <input type="number" placeholder="Free over" value={zone.free_over} onChange={e => updateZone(i, 'free_over', Number(e.target.value))} className={inputClass} />
                  <input type="text" placeholder="Time (e.g. 2-3 hrs)" value={zone.time} onChange={e => updateZone(i, 'time', e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Label" value={zone.label} onChange={e => updateZone(i, 'label', e.target.value)} className={inputClass} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-red-700 text-white px-5 py-3">
          <h3 className="font-bold text-sm">🔐 Security</h3>
        </div>
        <div className="p-5">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Dashboard Password</label>
            <input type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className={inputClass} />
            <p className="text-[10px] text-gray-400 mt-1">This password protects access to the admin dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
