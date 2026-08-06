/** Echte UNZE Connect / Plattform-Screenshots — korrekte Zuordnung der Views */
export type ConnectShowcaseImage = {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
};

export const CONNECT_PLATFORM_SHOWCASE: ConnectShowcaseImage[] = [
  {
    id: "discover",
    src: "/media/showcase/connect/discover.png",
    alt: "UNZE Connect — Discover auf dem Smartphone",
    title: "Discover",
    subtitle: "Communities, Events & Netzwerk",
  },
  {
    id: "dashboard",
    src: "/media/showcase/connect/dashboard.png",
    alt: "UNZE Connect — Creator Dashboard",
    title: "Creator Dashboard",
    subtitle: "Communities verwalten & steuern",
  },
  {
    id: "community",
    src: "/media/showcase/connect/community.png",
    alt: "UNZE Connect — Community-Ansicht",
    title: "Community",
    subtitle: "Öffentliche Community-Seite",
  },
];

/** Erweiterte Screens für Portfolio / Admin / Profil */
export const CONNECT_ADMIN_SHOWCASE: ConnectShowcaseImage = {
  id: "admin",
  src: "/media/showcase/connect/admin.png",
  alt: "UNZE Connect — Administration & Mitglieder",
  title: "Administration",
  subtitle: "Mitglieder, Rollen & Verwaltung",
};

export const CONNECT_PROFILE_SHOWCASE: ConnectShowcaseImage = {
  id: "profile",
  src: "/media/showcase/connect/profile.png",
  alt: "UNZE Connect — Profil & Creator",
  title: "Profil & Creator",
  subtitle: "Profil, Auszeichnungen & Einstellungen",
};

export const CONNECT_LOGIN_SHOWCASE: ConnectShowcaseImage = {
  id: "login",
  src: "/media/showcase/connect/login.png",
  alt: "UNZE Connect — Anmelden",
  title: "Anmelden",
  subtitle: "Login & Registrierung",
};
