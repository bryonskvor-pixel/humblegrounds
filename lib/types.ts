export type Journey = {
  label: string;
  lngLat: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  story?: string;
};

export type Coffee = {
  slug: string;
  name: string;
  origin: string;
  station: string;
  elevation: string;
  variety: string;
  process: string;
  processNote: string;
  notes: string[];
  roastLevel: number;
  price: number | null;
  soldOut: boolean;
  plate: string;
  header?: string;
  aboutFarm?: string;
  journey?: Journey;
};

export type ColdBrew = {
  slug: string;
  name: string;
  notes: string[];
  price: number | null;
  soldOut: boolean;
  plate: string;
  header?: string;
  aboutFarm?: string;
};

export type Menu = {
  month: string;
  monthLabel: string;
  deliveryDay: string;
  venmo: string;
  bagSize: string;
  bagPriceLocal: number;
  bagPriceShip: number;
  coffees: Coffee[];
  coldBrew: ColdBrew;
};

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
};

export type OrderPayload = {
  items: OrderItem[];
  name: string;
  email: string;
  delivery: "local" | "ship";
  address: string;
  payment: "venmo" | "cash";
};

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};
