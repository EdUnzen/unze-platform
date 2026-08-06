/** Echte UNZE Connect / Plattform-Screenshots — korrekte, lesbare Views */
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
    alt: "UNZE Connect — Discover",
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
    alt: "UNZE Connect — Community",
    title: "Community",
    subtitle: "Öffentliche Community-Seite",
  },
];

export const CONNECT_ADMIN_SHOWCASE: ConnectShowcaseImage = {
  id: "admin",
  src: "/media/showcase/connect/admin.png",
  alt: "UNZE Connect — Administration & Monetarisierung",
  title: "Administration",
  subtitle: "Finanzen, Zugang & Verwaltung",
};

export const CONNECT_PROFILE_SHOWCASE: ConnectShowcaseImage = {
  id: "profile",
  src: "/media/showcase/connect/profile.png",
  alt: "UNZE Connect — Profil & UNZE-ID",
  title: "Profil & UNZE-ID",
  subtitle: "Profil, Verifizierung & Zugang",
};

export const CONNECT_CREATOR_SHOWCASE: ConnectShowcaseImage = {
  id: "creator",
  src: "/media/showcase/connect/creator.png",
  alt: "UNZE Connect — Creator-Bereich",
  title: "Creator",
  subtitle: "Community erstellen & betreiben",
};

export const CONNECT_LOGIN_SHOWCASE: ConnectShowcaseImage = {
  id: "login",
  src: "/media/showcase/connect/login.png",
  alt: "UNZE Connect — Anmelden",
  title: "Anmelden",
  subtitle: "Login & Registrierung",
};
