export interface NavItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

export const primaryNavigation: NavItem[] = [
  { label: "New Arrivals", href: "/products" },
  { 
    label: "Collections", 
    href: "/products?category=jewellery",
    subItems: [
      { label: "Necklace Sets", href: "/products?category=jewellery&search=necklace" },
      { label: "Earrings", href: "/products?category=jewellery&search=earrings" },
      { label: "Bangles & Kadas", href: "/products?category=jewellery&search=bangle" },
      { label: "Chokers", href: "/products?category=jewellery&search=choker" },
    ]
  },
  { label: "Orders", href: "/orders" }
];

