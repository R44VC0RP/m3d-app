
export interface PrintColor {
  id: string;
  name: string;
  material: string; // PLA, PETG, etc.
  priceModifier: number; // multiplier or additional cost, for now assume 1.0
  inStock: boolean;
}

export async function getAvailableColors(): Promise<PrintColor[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { id: "black-pla", name: "Black PLA", material: "PLA", priceModifier: 1.0, inStock: true },
    { id: "white-pla", name: "White PLA", material: "PLA", priceModifier: 1.0, inStock: true },
    { id: "grey-pla", name: "Grey PLA", material: "PLA", priceModifier: 1.0, inStock: true },
    { id: "red-pla", name: "Red PLA", material: "PLA", priceModifier: 1.0, inStock: true },
    { id: "blue-pla", name: "Blue PLA", material: "PLA", priceModifier: 1.0, inStock: true },
    { id: "black-petg", name: "Black PETG", material: "PETG", priceModifier: 1.2, inStock: true }, // PETG is usually more expensive
    { id: "white-petg", name: "White PETG", material: "PETG", priceModifier: 1.2, inStock: true },
  ];
}

