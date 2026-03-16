export const normalizeCourseCode = (code?: string): string => {
  if (!code) return "";
  return code.trim().toLowerCase();
};
