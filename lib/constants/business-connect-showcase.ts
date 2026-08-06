/** Echte UNZE Connect / Plattform-Screenshots — npm run marketing:capture:connect */
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
    alt: "UNZE Connect — Discover Referenz",
    title: "Discover",
    subtitle: "Communities, Events & Netzwerk",
  },
  {
    id: "dashboard",
    src: "/media/showcase/connect/dashboard.png",
    alt: "UNZE Connect — Creator Dashboard Referenz",
    title: "Creator Dashboard",
    subtitle: "Verwaltung & Übersicht",
  },
  {
    id: "community",
    src: "/media/showcase/connect/community.png",
    alt: "UNZE Connect — Community Referenz",
    title: "Community",
    subtitle: "Öffentliche Community-Seite",
  },
];
