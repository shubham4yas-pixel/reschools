import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  DEFAULT_SCHOOL_SETTINGS,
  SchoolFeatureKey,
  SchoolModuleKey,
  SchoolSettings,
  hasFeatureFlag,
  isModuleEnabledFlag,
  normalizeSchoolSettings,
} from '@/lib/school-settings';

interface SchoolSettingsState {
  currentSchoolId: string | null;
  settings: SchoolSettings;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetchSchoolSettings: (schoolId: string) => Promise<void>;
  resetSchoolSettings: () => void;
  hasFeature: (feature: SchoolFeatureKey) => boolean;
  isModuleEnabled: (moduleKey: SchoolModuleKey) => boolean;
}

const initialState = {
  currentSchoolId: null,
  settings: normalizeSchoolSettings(DEFAULT_SCHOOL_SETTINGS),
  loading: false,
  loaded: false,
  error: null,
};

export const useSchoolSettingsStore = create<SchoolSettingsState>((set, get) => ({
  ...initialState,

  fetchSchoolSettings: async (schoolId) => {
    if (!schoolId) {
      set({ ...initialState });
      return;
    }

    // Only skip if a fetch for THIS schoolId is already in flight
    if (get().loading && get().currentSchoolId === schoolId) return;

    set({
      currentSchoolId: schoolId,
      loading: true,
      loaded: false,
      error: null,
    });

    try {
      const { data, error } = await supabase
        .from('schools')
        .select('settings')
        .eq('id', schoolId)
        .maybeSingle();

      if (error) throw error;

      const normalized = normalizeSchoolSettings(data?.settings);

      console.log(
        '[SchoolSettings] Fetched for school:', schoolId,
        '\n  raw settings:', JSON.stringify(data?.settings),
        '\n  resolved profile_picture:', normalized.profile_picture,
        '\n  resolved profile_image:', normalized.profile_image,
        '\n  resolved photo_url:', normalized.photo_url,
      );

      set({
        currentSchoolId: schoolId,
        settings: normalized,
        loading: false,
        loaded: true,
        error: null,
      });
    } catch (error: any) {
      console.error('[SchoolSettings] Failed to fetch school settings:', error);
      set({
        currentSchoolId: schoolId,
        settings: normalizeSchoolSettings(DEFAULT_SCHOOL_SETTINGS),
        loading: false,
        loaded: true,
        error: error?.message || 'Failed to load school settings',
      });
    }
  },

  resetSchoolSettings: () => set({ ...initialState }),

  hasFeature: (feature) => hasFeatureFlag(get().settings, feature),
  isModuleEnabled: (moduleKey) => isModuleEnabledFlag(get().settings, moduleKey),
}));
