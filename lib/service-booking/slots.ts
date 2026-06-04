export type ServiceBookingSlot = {
  id: string;
  startsAt: string;
  label: string;
};

const SLOT_HOURS = [9, 11, 14, 16, 18];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministische Demo-/MVP-Slots (kein separates DB-Schema) */
export function generateServiceBookingSlots(
  groupId: string,
  daysAhead = 14,
): ServiceBookingSlot[] {
  const slots: ServiceBookingSlot[] = [];
  const base = hashSeed(groupId);

  for (let d = 1; d <= daysAhead; d++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + d);
    if (date.getDay() === 0) continue;

    for (let i = 0; i < SLOT_HOURS.length; i++) {
      const pick = (base + d * 7 + i) % 5;
      if (pick === 0) continue;

      const hour = SLOT_HOURS[i];
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);

      const label = start.toLocaleString("de-DE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      slots.push({
        id: `${groupId}-${d}-${hour}`,
        startsAt: start.toISOString(),
        label,
      });
    }
  }

  return slots.slice(0, 24);
}
