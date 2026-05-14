import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEFAULT_SCHOOL_SETTINGS,
  SchoolFeatureKey,
  SchoolModuleKey,
  SchoolSettings,
  hasFeatureFlag,
  isModuleEnabledFlag,
  normalizeSchoolSettings,
} from '@/lib/school-settings';
import { useSchoolSettingsStore } from '@/store/useSchoolSettingsStore';

interface SchoolSettingsContextValue {
  settings: SchoolSettings;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  hasFeature: (feature: SchoolFeatureKey) => boolean;
  isModuleEnabled: (moduleKey: SchoolModuleKey) => boolean;
  refresh: () => Promise<void>;
}

const defaultValue: SchoolSettingsContextValue = {
  settings: normalizeSchoolSettings(DEFAULT_SCHOOL_SETTINGS),
  loading: false,
  loaded: true,
  error: null,
  hasFeature: (feature) => hasFeatureFlag(DEFAULT_SCHOOL_SETTINGS, feature),
  isModuleEnabled: (moduleKey) => isModuleEnabledFlag(DEFAULT_SCHOOL_SETTINGS, moduleKey),
  refresh: async () => undefined,
};

const SchoolSettingsContext = createContext<SchoolSettingsContextValue>(defaultValue);

export const SchoolSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { schoolId, role } = useAuth();
  const settings = useSchoolSettingsStore(state => state.settings);
  const loading = useSchoolSettingsStore(state => state.loading);
  const loaded = useSchoolSettingsStore(state => state.loaded);
  const error = useSchoolSettingsStore(state => state.error);
  const fetchSchoolSettings = useSchoolSettingsStore(state => state.fetchSchoolSettings);
  const resetSchoolSettings = useSchoolSettingsStore(state => state.resetSchoolSettings);

  useEffect(() => {
    if (!role || !schoolId) {
      resetSchoolSettings();
      return;
    }

    void fetchSchoolSettings(schoolId);
  }, [role, schoolId, fetchSchoolSettings, resetSchoolSettings]);

  const value = useMemo<SchoolSettingsContextValue>(() => ({
    settings,
    loading,
    loaded,
    error,
    hasFeature: (feature) => hasFeatureFlag(settings, feature),
    isModuleEnabled: (moduleKey) => isModuleEnabledFlag(settings, moduleKey),
    refresh: async () => {
      if (schoolId) {
        await fetchSchoolSettings(schoolId);
      }
    },
  }), [settings, loading, loaded, error, schoolId, fetchSchoolSettings]);

  return (
    <SchoolSettingsContext.Provider value={value}>
      {children}
    </SchoolSettingsContext.Provider>
  );
};

export const useSchoolSettings = () => useContext(SchoolSettingsContext);
