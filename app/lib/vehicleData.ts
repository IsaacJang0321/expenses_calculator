export interface VehicleInfo {
  efficiency: number; // km/L
  fuelType: "gasoline" | "diesel" | "lpg" | "electric";
}

export interface VehicleVariant {
  fuelType: "gasoline" | "diesel" | "lpg" | "electric";
  efficiency: number;
}

export interface VehicleModel {
  variants: VehicleVariant[];
  defaultFuelType: "gasoline" | "diesel" | "lpg" | "electric";
}

export interface VehicleData {
  [brand: string]: {
    [model: string]: VehicleModel;
  };
}

export const vehicleData: VehicleData = {
  Hyundai: {
    Sonata: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.5 },
        { fuelType: "gasoline", efficiency: 18.2 }, // Hybrid
      ],
      defaultFuelType: "gasoline",
    },
    Elantra: {
      variants: [
        { fuelType: "gasoline", efficiency: 14.2 },
        { fuelType: "gasoline", efficiency: 19.5 }, // Hybrid
      ],
      defaultFuelType: "gasoline",
    },
    Kona: {
      variants: [
        { fuelType: "gasoline", efficiency: 13.8 },
        { fuelType: "electric", efficiency: 6.2 },
      ],
      defaultFuelType: "gasoline",
    },
    Tucson: {
      variants: [{ fuelType: "gasoline", efficiency: 11.5 }],
      defaultFuelType: "gasoline",
    },
    "Santa Fe": {
      variants: [{ fuelType: "gasoline", efficiency: 10.8 }],
      defaultFuelType: "gasoline",
    },
    Palisade: {
      variants: [{ fuelType: "gasoline", efficiency: 9.5 }],
      defaultFuelType: "gasoline",
    },
    Avante: {
      variants: [{ fuelType: "gasoline", efficiency: 14.5 }],
      defaultFuelType: "gasoline",
    },
    Grandeur: {
      variants: [{ fuelType: "gasoline", efficiency: 11.2 }],
      defaultFuelType: "gasoline",
    },
  },
  Kia: {
    K5: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.3 },
        { fuelType: "gasoline", efficiency: 17.8 }, // Hybrid
      ],
      defaultFuelType: "gasoline",
    },
    Sorento: {
      variants: [{ fuelType: "gasoline", efficiency: 10.5 }],
      defaultFuelType: "gasoline",
    },
    Sportage: {
      variants: [{ fuelType: "gasoline", efficiency: 11.8 }],
      defaultFuelType: "gasoline",
    },
    Telluride: {
      variants: [{ fuelType: "gasoline", efficiency: 9.2 }],
      defaultFuelType: "gasoline",
    },
    Carnival: {
      variants: [{ fuelType: "gasoline", efficiency: 9.8 }],
      defaultFuelType: "gasoline",
    },
    Seltos: {
      variants: [{ fuelType: "gasoline", efficiency: 13.2 }],
      defaultFuelType: "gasoline",
    },
    K3: {
      variants: [
        { fuelType: "gasoline", efficiency: 14.8 },
        { fuelType: "gasoline", efficiency: 20.1 }, // Hybrid
      ],
      defaultFuelType: "gasoline",
    },
    EV6: {
      variants: [{ fuelType: "electric", efficiency: 5.8 }],
      defaultFuelType: "electric",
    },
    Niro: {
      variants: [{ fuelType: "gasoline", efficiency: 19.2 }],
      defaultFuelType: "gasoline",
    },
  },
  Genesis: {
    G70: {
      variants: [{ fuelType: "gasoline", efficiency: 10.5 }],
      defaultFuelType: "gasoline",
    },
    G80: {
      variants: [{ fuelType: "gasoline", efficiency: 9.8 }],
      defaultFuelType: "gasoline",
    },
    G90: {
      variants: [{ fuelType: "gasoline", efficiency: 8.5 }],
      defaultFuelType: "gasoline",
    },
    GV70: {
      variants: [{ fuelType: "gasoline", efficiency: 10.2 }],
      defaultFuelType: "gasoline",
    },
    GV80: {
      variants: [{ fuelType: "gasoline", efficiency: 9.5 }],
      defaultFuelType: "gasoline",
    },
    GV90: {
      variants: [{ fuelType: "gasoline", efficiency: 8.8 }],
      defaultFuelType: "gasoline",
    },
  },
  SsangYong: {
    Rexton: {
      variants: [{ fuelType: "diesel", efficiency: 9.2 }],
      defaultFuelType: "diesel",
    },
    Tivoli: {
      variants: [{ fuelType: "gasoline", efficiency: 12.5 }],
      defaultFuelType: "gasoline",
    },
    Korando: {
      variants: [{ fuelType: "gasoline", efficiency: 11.8 }],
      defaultFuelType: "gasoline",
    },
  },
  Renault: {
    SM6: {
      variants: [{ fuelType: "gasoline", efficiency: 12.0 }],
      defaultFuelType: "gasoline",
    },
    QM6: {
      variants: [{ fuelType: "gasoline", efficiency: 10.5 }],
      defaultFuelType: "gasoline",
    },
  },
};

export function getBrands(): string[] {
  return Object.keys(vehicleData);
}

export function getModels(brand: string): string[] {
  return brand && vehicleData[brand] ? Object.keys(vehicleData[brand]) : [];
}

export function getVehicleModel(
  brand: string,
  model: string
): VehicleModel | null {
  return vehicleData[brand]?.[model] || null;
}

export function getVehicleInfo(
  brand: string,
  model: string,
  fuelType?: "gasoline" | "diesel" | "lpg" | "electric"
): VehicleInfo | null {
  const vehicleModel = vehicleData[brand]?.[model];
  if (!vehicleModel) return null;

  const targetFuelType = fuelType || vehicleModel.defaultFuelType;
  const variant = vehicleModel.variants.find((v) => v.fuelType === targetFuelType);
  
  if (!variant) {
    // Fallback to first variant if requested fuel type not found
    const firstVariant = vehicleModel.variants[0];
    return firstVariant
      ? { efficiency: firstVariant.efficiency, fuelType: firstVariant.fuelType }
      : null;
  }

  return {
    efficiency: variant.efficiency,
    fuelType: variant.fuelType,
  };
}

export function getAvailableFuelTypes(
  brand: string,
  model: string
): ("gasoline" | "diesel" | "lpg" | "electric")[] {
  const vehicleModel = vehicleData[brand]?.[model];
  if (!vehicleModel) return [];
  
  // Get unique fuel types from variants
  const fuelTypes = vehicleModel.variants.map((v) => v.fuelType);
  return Array.from(new Set(fuelTypes)) as ("gasoline" | "diesel" | "lpg" | "electric")[];
}

export function getVehicleVariants(
  brand: string,
  model: string
): VehicleVariant[] {
  const vehicleModel = vehicleData[brand]?.[model];
  return vehicleModel?.variants || [];
}




