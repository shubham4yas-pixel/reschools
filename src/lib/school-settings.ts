/**
 * School Settings — normalises the nested JSONB stored in schools.settings.
 *
 * ACTUAL DB structure (verified from Supabase):
 * {
 *   "modules": {
 *     "fees":       true/false,
 *     "marks":      true/false,
 *     "feedback":   true/false,
 *     "students":   true/false,
 *     "analytics":  true/false,
 *     "transport":  true/false,
 *     "attendance": true/false
 *   },
 *   "features": {
 *     "photo_url":       true/false,   ← DB key for profile image (url-based)
 *     "profile_image":   true/false,   ← DB key for profile image (upload-based)
 *     "bulk_upload":     true/false,
 *     "student_search":  true/false,
 *     "teacher_contact": true/false
 *   }
 * }
 *
 * Frontend always calls hasFeature('profile_picture') — so the normalizer
 * creates an alias: if profile_image OR photo_url is false → profile_picture = false.
 *
 * ALL settings default to TRUE — disabling requires an explicit `false`.
 */

// ─── Flat resolved settings (always boolean, never undefined) ────────────────

export interface SchoolSettings {
  // Module flags — map to modules.* in the DB
  students:   boolean;
  attendance: boolean;
  marks:      boolean;
  fees:       boolean;
  transport:  boolean;
  feedback:   boolean;
  analytics:  boolean;

  // Feature flags — actual DB keys inside features.*
  profile_image:   boolean;   // features.profile_image in DB
  photo_url:       boolean;   // features.photo_url in DB
  student_search:  boolean;
  bulk_upload:     boolean;
  teacher_contact: boolean;

  // Frontend alias keys (derived from DB keys inside normalizeSchoolSettings)
  profile_picture:      boolean; // = profile_image AND photo_url
  student_bio:          boolean;
  show_teacher_contact: boolean; // = teacher_contact

  // Legacy flat keys kept for backwards compatibility
  transport_module: boolean; // = transport
  hostel_module:    boolean;

  // Open-ended: any extra key stored in the DB
  [key: string]: boolean;
}

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  // Modules
  students:   true,
  attendance: true,
  marks:      true,
  fees:       true,
  transport:  true,
  feedback:   true,
  analytics:  true,

  // Features (actual DB keys)
  profile_image:   true,
  photo_url:       true,
  student_search:  true,
  bulk_upload:     true,
  teacher_contact: true,

  // Derived aliases (computed by normalizeSchoolSettings — defaults mirror DB defaults)
  profile_picture:      true,
  student_bio:          true,
  show_teacher_contact: true,

  // Legacy
  transport_module: true,
  hostel_module:    false,
};

export type SchoolFeatureKey     = keyof SchoolSettings | (string & {});
export type SchoolModuleKey      = keyof SchoolSettings | (string & {});
export type CoreSchoolSettingKey = keyof typeof DEFAULT_SCHOOL_SETTINGS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toBoolean = (value: unknown, defaultVal: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const n = value.trim().toLowerCase();
    if (n === 'true')  return true;
    if (n === 'false') return false;
  }
  if (value === null || value === undefined) return defaultVal;
  return Boolean(value);
};

/**
 * Converts whatever is stored in schools.settings (nested OR flat) into a
 * single flat SchoolSettings object.  Any key absent from the DB stays at
 * its default value (true for almost everything).
 *
 * Alias derivation (step 4) runs AFTER all DB values are applied:
 *   profile_picture      = profile_image AND photo_url
 *   show_teacher_contact = teacher_contact
 *   transport_module     = transport
 */
export const normalizeSchoolSettings = (raw: unknown): SchoolSettings => {
  const next: SchoolSettings = { ...DEFAULT_SCHOOL_SETTINGS };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return next;
  }

  const data = raw as Record<string, unknown>;

  // Pre-typed references used in the flat-key loop (avoids `in` on `unknown`)
  let modulesObj:  Record<string, unknown> = {};
  let featuresObj: Record<string, unknown> = {};

  // ── 1. Flatten nested modules.* ──────────────────────────────────────────
  if (data.modules && typeof data.modules === 'object' && !Array.isArray(data.modules)) {
    modulesObj = data.modules as Record<string, unknown>;
    for (const [key, value] of Object.entries(modulesObj)) {
      const def = DEFAULT_SCHOOL_SETTINGS[key] ?? true;
      next[key] = toBoolean(value, def);
    }
  }

  // ── 2. Flatten nested features.* ─────────────────────────────────────────
  if (data.features && typeof data.features === 'object' && !Array.isArray(data.features)) {
    featuresObj = data.features as Record<string, unknown>;
    for (const [key, value] of Object.entries(featuresObj)) {
      const def = DEFAULT_SCHOOL_SETTINGS[key] ?? true;
      next[key] = toBoolean(value, def);
    }
  }

  // ── 3. Legacy flat keys — lower priority than nested ─────────────────────
  for (const [key, value] of Object.entries(data)) {
    if (key === 'modules' || key === 'features') continue;
    if (typeof value === 'boolean' || typeof value === 'string') {
      // Skip keys already handled by nested blocks
      if (!(key in modulesObj) && !(key in featuresObj)) {
        const def = DEFAULT_SCHOOL_SETTINGS[key] ?? true;
        next[key] = toBoolean(value, def);
      }
    }
  }

  // ── 4. Derive alias keys from real DB values ──────────────────────────────
  //
  // profile_picture: frontend always calls hasFeature('profile_picture').
  // DB stores 'profile_image' and/or 'photo_url'.
  // If EITHER is false → no profile photos shown.
  next.profile_picture = next.profile_image && next.photo_url;

  // show_teacher_contact: FeedbackList calls hasFeature('show_teacher_contact').
  // DB stores 'teacher_contact'.
  next.show_teacher_contact = next.teacher_contact;

  // transport_module: legacy key kept in sync with canonical 'transport' module.
  next.transport_module = next.transport;

  return next;
};

// ─── Predicate helpers (safe against null/undefined) ─────────────────────────

export const hasFeatureFlag = (
  settings: Partial<SchoolSettings> | null | undefined,
  feature: SchoolFeatureKey,
): boolean => {
  const resolved = normalizeSchoolSettings(settings);
  return resolved[feature] !== false;
};

export const isModuleEnabledFlag = (
  settings: Partial<SchoolSettings> | null | undefined,
  moduleKey: SchoolModuleKey,
): boolean => {
  const resolved = normalizeSchoolSettings(settings);
  return resolved[moduleKey] !== false;
};
