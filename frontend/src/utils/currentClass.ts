const IST_OFFSET_MINUTES = 330; // UTC+05:30

const toMinutesFromMidnight = (timeStr: string): number => {
  const [time, modifierRaw = "AM"] = timeStr.trim().split(" ");
  const [hoursRaw, minutesRaw] = time.split(":").map(Number);
  const modifier = modifierRaw.toUpperCase();

  let hours = hoursRaw;
  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + (minutesRaw || 0);
};

const getCurrentMinutesInIST = (): number => {
  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = utcMinutes + IST_OFFSET_MINUTES;
  const minutesInDay = 24 * 60;
  return ((istMinutes % minutesInDay) + minutesInDay) % minutesInDay;
};

export const isCurrentClass = (timeRange: string) => {
  if (!timeRange?.includes("-")) return false;
  const [startRaw, endRaw] = timeRange.split(" - ").map((part) => part.trim());
  const start = toMinutesFromMidnight(startRaw);
  const end = toMinutesFromMidnight(endRaw);
  const nowMinutes = getCurrentMinutesInIST();
  return nowMinutes >= start && nowMinutes <= end;
};
