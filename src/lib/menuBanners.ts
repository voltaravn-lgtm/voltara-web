import { MenuItem } from "../context/AppContext";

export function getMenuBanner(menuItems: MenuItem[], path: string, fallback: string) {
  const configuredBanner = menuItems.find((item) => item.path === path)?.bannerImage?.trim();
  return configuredBanner || fallback;
}
