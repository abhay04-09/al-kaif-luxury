export interface NavItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

// The header offers the collection's categories directly. Orders are reached
// from the profile page rather than the header.
export const primaryNavigation: NavItem[] = [
  { label: "Necklace Sets", href: "/products?category=jewellery&search=necklace" },
  { label: "Earrings", href: "/products?category=jewellery&search=earrings" },
  { label: "Bangles & Kadas", href: "/products?category=jewellery&search=bangle" },
  { label: "Chokers", href: "/products?category=jewellery&search=choker" }
];
