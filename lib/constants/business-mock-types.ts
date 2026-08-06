/** Mock-Vorschau-Typen — bewusst ohne Komponenten-Imports (Zirkularität vermeiden). */

export type MockVariant =
  | "dashboard"
  | "customers"
  | "offers"
  | "invoices"
  | "employees"
  | "calendar"
  | "documents"
  | "marketing"
  | "analytics"
  | "website"
  | "webapp"
  | "ai"
  | "community"
  | "admin"
  | "profile";

export type MockLayout = "desktop" | "tablet" | "mobile";

export type DeviceVariant = "laptop" | "desktop" | "tablet" | "phone";
