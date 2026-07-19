export type Journey = {
  label: string;
  lngLat: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  story?: string;
  lookArounds?: LookAroundSpot[];
};

// A real Street View spot near the origin — the "step out of the plane"
// moment. lngLat is [longitude, latitude], same as everywhere else here.
export type LookAroundSpot = {
  label: string;
  lngLat: [number, number];
  // Pin an exact panorama instead of radius-searching near lngLat. Use for
  // sparse-coverage places (Burundi) where BEST-preference search flaps
  // between panos of mixed quality. If Google retires the pano, the radius
  // search below is still the fallback.
  pano?: string;
  heading?: number;
  pitch?: number;
  radius?: number;
  // true → only Google's own linked outdoor imagery (walkable, arrow to
  // arrow); false/absent → any 360, including one-off user photospheres,
  // which is all that exists in Comayagua and Kayanza.
  outdoorOnly?: boolean;
  note?: string;
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

export type TastingNote = {
  flavor: string;
  when?: string;
  temperature?: string;
};

export type TastingPayload = {
  submittedAt?: string;
  coffee?: string;
  taster?: string;
  comment?: string;
  notes: TastingNote[];
};

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};
