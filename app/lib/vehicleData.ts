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
  현대: {
    "엠티알ST1어린이운송승합차": {
      variants: [{ fuelType: "electric", efficiency: 3.5 }],
      defaultFuelType: "electric",
    },
    GV70: {
      variants: [
        { fuelType: "gasoline", efficiency: 9.3 },
        { fuelType: "electric", efficiency: 4.4 },
        { fuelType: "diesel", efficiency: 12.7 },
      ],
      defaultFuelType: "gasoline",
    },
    아이오닉6: {
      variants: [{ fuelType: "electric", efficiency: 5.4 }],
      defaultFuelType: "electric",
    },
    쏘나타: {
      variants: [
        { fuelType: "gasoline", efficiency: 14.3 },
        { fuelType: "lpg", efficiency: 9.8 },
      ],
      defaultFuelType: "gasoline",
    },
    "엠티알ST1승합자동차": {
      variants: [{ fuelType: "electric", efficiency: 3.5 }],
      defaultFuelType: "electric",
    },
    넥쏘: {
      variants: [{ fuelType: "electric", efficiency: 98.2 }], // hydrogen을 electric으로 처리 (fuelType에 hydrogen 없음)
      defaultFuelType: "electric",
    },
    G90: {
      variants: [{ fuelType: "gasoline", efficiency: 8.5 }],
      defaultFuelType: "gasoline",
    },
    팰리세이드: {
      variants: [
        { fuelType: "gasoline", efficiency: 10.0 },
        { fuelType: "diesel", efficiency: 11.8 },
      ],
      defaultFuelType: "gasoline",
    },
    G80: {
      variants: [
        { fuelType: "gasoline", efficiency: 9.4 },
        { fuelType: "electric", efficiency: 4.3 },
        { fuelType: "diesel", efficiency: 13.4 },
      ],
      defaultFuelType: "gasoline",
    },
    GV60: {
      variants: [{ fuelType: "electric", efficiency: 4.4 }],
      defaultFuelType: "electric",
    },
    포터: {
      variants: [
        { fuelType: "electric", efficiency: 3.1 },
        { fuelType: "lpg", efficiency: 6.5 },
        { fuelType: "diesel", efficiency: 9.1 },
      ],
      defaultFuelType: "electric",
    },
    스타리아: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.5 },
        { fuelType: "diesel", efficiency: 10.6 },
        { fuelType: "lpg", efficiency: 6.7 },
      ],
      defaultFuelType: "gasoline",
    },
    GV80: {
      variants: [
        { fuelType: "gasoline", efficiency: 8.5 },
        { fuelType: "diesel", efficiency: 11.0 },
      ],
      defaultFuelType: "gasoline",
    },
    아이오닉9: {
      variants: [{ fuelType: "electric", efficiency: 4.2 }],
      defaultFuelType: "electric",
    },
    캐스퍼: {
      variants: [
        { fuelType: "electric", efficiency: 5.2 },
        { fuelType: "gasoline", efficiency: 13.4 },
      ],
      defaultFuelType: "gasoline",
    },
    코나: {
      variants: [
        { fuelType: "electric", efficiency: 5.2 },
        { fuelType: "gasoline", efficiency: 13.4 },
        { fuelType: "diesel", efficiency: 16.2 },
      ],
      defaultFuelType: "gasoline",
    },
    아이오닉5: {
      variants: [{ fuelType: "electric", efficiency: 4.8 }],
      defaultFuelType: "electric",
    },
    싼타페: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.4 },
        { fuelType: "diesel", efficiency: 13.2 },
      ],
      defaultFuelType: "gasoline",
    },
    아반떼: {
      variants: [
        { fuelType: "gasoline", efficiency: 15.2 },
        { fuelType: "lpg", efficiency: 10.5 },
        { fuelType: "diesel", efficiency: 17.5 },
      ],
      defaultFuelType: "gasoline",
    },
    "한국상용0.9톤롱바디EV내장탑트럭": {
      variants: [{ fuelType: "electric", efficiency: 2.1 }],
      defaultFuelType: "electric",
    },
    "한국상용1톤롱바디EV트럭": {
      variants: [{ fuelType: "electric", efficiency: 2.7 }],
      defaultFuelType: "electric",
    },
    투싼: {
      variants: [
        { fuelType: "diesel", efficiency: 13.9 },
        { fuelType: "gasoline", efficiency: 13.3 },
      ],
      defaultFuelType: "gasoline",
    },
    G70: {
      variants: [
        { fuelType: "gasoline", efficiency: 9.7 },
        { fuelType: "diesel", efficiency: 14.2 },
      ],
      defaultFuelType: "gasoline",
    },
    그랜저: {
      variants: [
        { fuelType: "gasoline", efficiency: 11.9 },
        { fuelType: "lpg", efficiency: 7.4 },
      ],
      defaultFuelType: "gasoline",
    },
    벨로스터: {
      variants: [{ fuelType: "gasoline", efficiency: 11.6 }],
      defaultFuelType: "gasoline",
    },
    그랜드스타렉스: {
      variants: [
        { fuelType: "diesel", efficiency: 9.3 },
        { fuelType: "lpg", efficiency: 5.8 },
      ],
      defaultFuelType: "diesel",
    },
    베뉴: {
      variants: [{ fuelType: "gasoline", efficiency: 13.5 }],
      defaultFuelType: "gasoline",
    },
    아이오닉: {
      variants: [
        { fuelType: "gasoline", efficiency: 28.3 }, // hybrid를 gasoline으로 처리 (높은 연비)
        { fuelType: "gasoline", efficiency: 21.3 },
      ],
      defaultFuelType: "gasoline",
    },
    i30: {
      variants: [{ fuelType: "gasoline", efficiency: 11.6 }],
      defaultFuelType: "gasoline",
    },
    그랜드: {
      variants: [{ fuelType: "diesel", efficiency: 10.2 }],
      defaultFuelType: "diesel",
    },
    엑센트: {
      variants: [{ fuelType: "gasoline", efficiency: 13.5 }],
      defaultFuelType: "gasoline",
    },
    아슬란: {
      variants: [{ fuelType: "gasoline", efficiency: 9.7 }],
      defaultFuelType: "gasoline",
    },
  },
  기아: {
    레이: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.9 },
        { fuelType: "electric", efficiency: 5.1 },
        { fuelType: "lpg", efficiency: 10.5 },
      ],
      defaultFuelType: "gasoline",
    },
    EV5: {
      variants: [{ fuelType: "electric", efficiency: 5.0 }],
      defaultFuelType: "electric",
    },
    PV5: {
      variants: [{ fuelType: "electric", efficiency: 4.7 }],
      defaultFuelType: "electric",
    },
    쏘렌토: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.3 },
        { fuelType: "diesel", efficiency: 13.3 },
      ],
      defaultFuelType: "gasoline",
    },
    모닝: {
      variants: [
        { fuelType: "gasoline", efficiency: 15.1 },
        { fuelType: "lpg", efficiency: 11.9 },
      ],
      defaultFuelType: "gasoline",
    },
    타스만: {
      variants: [{ fuelType: "gasoline", efficiency: 8.0 }],
      defaultFuelType: "gasoline",
    },
    EV4: {
      variants: [{ fuelType: "electric", efficiency: 5.6 }],
      defaultFuelType: "electric",
    },
    봉고: {
      variants: [
        { fuelType: "electric", efficiency: 3.1 },
        { fuelType: "lpg", efficiency: 6.5 },
        { fuelType: "diesel", efficiency: 9.1 },
      ],
      defaultFuelType: "electric",
    },
    EV9: {
      variants: [{ fuelType: "electric", efficiency: 4.0 }],
      defaultFuelType: "electric",
    },
    스포티지: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.9 },
        { fuelType: "lpg", efficiency: 8.9 },
        { fuelType: "diesel", efficiency: 13.8 },
      ],
      defaultFuelType: "gasoline",
    },
    K5: {
      variants: [
        { fuelType: "lpg", efficiency: 9.7 },
        { fuelType: "gasoline", efficiency: 14.7 },
        { fuelType: "gasoline", efficiency: 23.8 }, // hybrid를 gasoline으로 처리 (높은 연비)
      ],
      defaultFuelType: "gasoline",
    },
    EV6: {
      variants: [{ fuelType: "electric", efficiency: 4.9 }],
      defaultFuelType: "electric",
    },
    K8: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.4 },
        { fuelType: "lpg", efficiency: 7.9 },
      ],
      defaultFuelType: "gasoline",
    },
    EV3: {
      variants: [{ fuelType: "electric", efficiency: 5.2 }],
      defaultFuelType: "electric",
    },
    카니발: {
      variants: [
        { fuelType: "gasoline", efficiency: 9.2 },
        { fuelType: "diesel", efficiency: 11.8 },
      ],
      defaultFuelType: "gasoline",
    },
    셀토스: {
      variants: [
        { fuelType: "gasoline", efficiency: 11.9 },
        { fuelType: "diesel", efficiency: 16.0 },
      ],
      defaultFuelType: "gasoline",
    },
    니로: {
      variants: [
        { fuelType: "electric", efficiency: 5.3 },
        { fuelType: "gasoline", efficiency: 19.3 },
        { fuelType: "gasoline", efficiency: 25.9 }, // hybrid를 gasoline으로 처리 (높은 연비)
      ],
      defaultFuelType: "gasoline",
    },
    모하비: {
      variants: [{ fuelType: "diesel", efficiency: 9.4 }],
      defaultFuelType: "diesel",
    },
    K9: {
      variants: [{ fuelType: "gasoline", efficiency: 8.5 }],
      defaultFuelType: "gasoline",
    },
    스타리아: {
      variants: [{ fuelType: "lpg", efficiency: 6.7 }],
      defaultFuelType: "lpg",
    },
    K3: {
      variants: [{ fuelType: "gasoline", efficiency: 13.2 }],
      defaultFuelType: "gasoline",
    },
    스팅어: {
      variants: [
        { fuelType: "gasoline", efficiency: 9.6 },
        { fuelType: "diesel", efficiency: 13.9 },
      ],
      defaultFuelType: "gasoline",
    },
    K7: {
      variants: [
        { fuelType: "gasoline", efficiency: 11.6 },
        { fuelType: "diesel", efficiency: 14.4 },
        { fuelType: "lpg", efficiency: 7.4 },
      ],
      defaultFuelType: "gasoline",
    },
    쏘울: {
      variants: [
        { fuelType: "electric", efficiency: 5.5 },
        { fuelType: "gasoline", efficiency: 12.3 },
      ],
      defaultFuelType: "gasoline",
    },
    스토닉: {
      variants: [
        { fuelType: "diesel", efficiency: 16.9 },
        { fuelType: "gasoline", efficiency: 13.0 },
      ],
      defaultFuelType: "gasoline",
    },
  },
  쌍용: {
    액티언: {
      variants: [{ fuelType: "gasoline", efficiency: 12.8 }],
      defaultFuelType: "gasoline",
    },
    토레스: {
      variants: [
        { fuelType: "electric", efficiency: 4.3 },
        { fuelType: "gasoline", efficiency: 11.2 },
      ],
      defaultFuelType: "gasoline",
    },
    티볼리: {
      variants: [
        { fuelType: "diesel", efficiency: 14.4 },
        { fuelType: "gasoline", efficiency: 12.0 },
      ],
      defaultFuelType: "gasoline",
    },
    코란도: {
      variants: [
        { fuelType: "gasoline", efficiency: 11.4 },
        { fuelType: "diesel", efficiency: 14.4 },
      ],
      defaultFuelType: "gasoline",
    },
    G4: {
      variants: [{ fuelType: "diesel", efficiency: 10.3 }],
      defaultFuelType: "diesel",
    },
  },
  르노: {
    "SCENIC_E3/E3+_19\"": {
      variants: [{ fuelType: "electric", efficiency: 4.4 }],
      defaultFuelType: "electric",
    },
    콜레오스: {
      variants: [{ fuelType: "gasoline", efficiency: 11.8 }],
      defaultFuelType: "gasoline",
    },
    XM3: {
      variants: [
        { fuelType: "gasoline", efficiency: 13.8 },
        { fuelType: "lpg", efficiency: 10.7 },
      ],
      defaultFuelType: "gasoline",
    },
    트위지: {
      variants: [{ fuelType: "electric", efficiency: 7.1 }],
      defaultFuelType: "electric",
    },
    "MEGANE_E3/E3+_20\"": {
      variants: [{ fuelType: "electric", efficiency: 4.3 }],
      defaultFuelType: "electric",
    },
    QM6: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.0 },
        { fuelType: "diesel", efficiency: 14.1 },
        { fuelType: "lpg", efficiency: 9.4 },
      ],
      defaultFuelType: "gasoline",
    },
    Master: {
      variants: [{ fuelType: "diesel", efficiency: 10.6 }],
      defaultFuelType: "diesel",
    },
  },
  벤츠: {
    GLS: {
      variants: [
        { fuelType: "gasoline", efficiency: 6.7 },
        { fuelType: "diesel", efficiency: 9.9 },
      ],
      defaultFuelType: "gasoline",
    },
    GLA: {
      variants: [
        { fuelType: "gasoline", efficiency: 11.7 },
        { fuelType: "diesel", efficiency: 14.7 },
      ],
      defaultFuelType: "gasoline",
    },
    GLC: {
      variants: [
        { fuelType: "gasoline", efficiency: 10.2 },
        { fuelType: "diesel", efficiency: 12.9 },
        { fuelType: "electric", efficiency: 4.3 },
      ],
      defaultFuelType: "gasoline",
    },
    S: {
      variants: [
        { fuelType: "gasoline", efficiency: 8.4 },
        { fuelType: "diesel", efficiency: 10.4 },
      ],
      defaultFuelType: "gasoline",
    },
    C: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.2 },
        { fuelType: "diesel", efficiency: 15.1 },
      ],
      defaultFuelType: "gasoline",
    },
    EQS: {
      variants: [{ fuelType: "electric", efficiency: 4.4 }],
      defaultFuelType: "electric",
    },
    EQE: {
      variants: [{ fuelType: "electric", efficiency: 4.7 }],
      defaultFuelType: "electric",
    },
    E: {
      variants: [
        { fuelType: "gasoline", efficiency: 13.0 },
        { fuelType: "diesel", efficiency: 15.7 },
      ],
      defaultFuelType: "gasoline",
    },
    "AMG GT": {
      variants: [{ fuelType: "gasoline", efficiency: 7.6 }],
      defaultFuelType: "gasoline",
    },
    "AMG C43": {
      variants: [{ fuelType: "gasoline", efficiency: 9.5 }],
      defaultFuelType: "gasoline",
    },
    "AMG E53": {
      variants: [{ fuelType: "gasoline", efficiency: 9.4 }],
      defaultFuelType: "gasoline",
    },
    "AMG G63": {
      variants: [{ fuelType: "gasoline", efficiency: 5.5 }],
      defaultFuelType: "gasoline",
    },
    "AMG S65": {
      variants: [{ fuelType: "gasoline", efficiency: 6.4 }],
      defaultFuelType: "gasoline",
    },
  },
  BMW: {
    M5: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.2 }, // hybrid를 gasoline으로 처리 (높은 연비)
        { fuelType: "gasoline", efficiency: 7.7 },
      ],
      defaultFuelType: "gasoline",
    },
    X3: {
      variants: [{ fuelType: "gasoline", efficiency: 10.4 }],
      defaultFuelType: "gasoline",
    },
    X2: {
      variants: [{ fuelType: "gasoline", efficiency: 10.0 }],
      defaultFuelType: "gasoline",
    },
    X1: {
      variants: [{ fuelType: "gasoline", efficiency: 10.5 }],
      defaultFuelType: "gasoline",
    },
    X6: {
      variants: [{ fuelType: "gasoline", efficiency: 6.7 }],
      defaultFuelType: "gasoline",
    },
    X5: {
      variants: [{ fuelType: "gasoline", efficiency: 6.7 }],
      defaultFuelType: "gasoline",
    },
    Z4: {
      variants: [{ fuelType: "gasoline", efficiency: 10.4 }],
      defaultFuelType: "gasoline",
    },
    I3: {
      variants: [{ fuelType: "electric", efficiency: 5.6 }],
      defaultFuelType: "electric",
    },
    M40I: {
      variants: [{ fuelType: "gasoline", efficiency: 10.2 }],
      defaultFuelType: "gasoline",
    },
    M35I: {
      variants: [{ fuelType: "gasoline", efficiency: 9.9 }],
      defaultFuelType: "gasoline",
    },
    M50I: {
      variants: [{ fuelType: "gasoline", efficiency: 7.4 }],
      defaultFuelType: "gasoline",
    },
    I4: {
      variants: [{ fuelType: "electric", efficiency: 4.6 }],
      defaultFuelType: "electric",
    },
    I7: {
      variants: [{ fuelType: "electric", efficiency: 4.3 }],
      defaultFuelType: "electric",
    },
    I5: {
      variants: [{ fuelType: "electric", efficiency: 4.3 }],
      defaultFuelType: "electric",
    },
    I8: {
      variants: [{ fuelType: "gasoline", efficiency: 16.2 }], // hybrid를 gasoline으로 처리 (높은 연비)
      defaultFuelType: "gasoline",
    },
    "530I": {
      variants: [{ fuelType: "gasoline", efficiency: 12.1 }],
      defaultFuelType: "gasoline",
    },
    "320I": {
      variants: [{ fuelType: "gasoline", efficiency: 13.0 }],
      defaultFuelType: "gasoline",
    },
    "420I": {
      variants: [{ fuelType: "gasoline", efficiency: 11.9 }],
      defaultFuelType: "gasoline",
    },
    "420D": {
      variants: [{ fuelType: "diesel", efficiency: 17.3 }],
      defaultFuelType: "diesel",
    },
    "520D": {
      variants: [{ fuelType: "diesel", efficiency: 15.9 }],
      defaultFuelType: "diesel",
    },
    "530E": {
      variants: [{ fuelType: "gasoline", efficiency: 15.8 }], // hybrid를 gasoline으로 처리 (높은 연비)
      defaultFuelType: "gasoline",
    },
    "330E": {
      variants: [{ fuelType: "gasoline", efficiency: 15.9 }], // hybrid를 gasoline으로 처리 (높은 연비)
      defaultFuelType: "gasoline",
    },
    "118D": {
      variants: [{ fuelType: "diesel", efficiency: 17.3 }],
      defaultFuelType: "diesel",
    },
    "120D": {
      variants: [{ fuelType: "diesel", efficiency: 17.9 }],
      defaultFuelType: "diesel",
    },
    "218D": {
      variants: [{ fuelType: "diesel", efficiency: 17.5 }],
      defaultFuelType: "diesel",
    },
  },
  아우디: {
    RS: {
      variants: [
        { fuelType: "gasoline", efficiency: 7.8 },
        { fuelType: "electric", efficiency: 3.4 },
      ],
      defaultFuelType: "gasoline",
    },
    Q4: {
      variants: [{ fuelType: "electric", efficiency: 4.9 }],
      defaultFuelType: "electric",
    },
    Q8: {
      variants: [
        { fuelType: "gasoline", efficiency: 7.9 },
        { fuelType: "electric", efficiency: 3.5 },
      ],
      defaultFuelType: "gasoline",
    },
    Q3: {
      variants: [{ fuelType: "gasoline", efficiency: 10.8 }],
      defaultFuelType: "gasoline",
    },
    Q2: {
      variants: [{ fuelType: "gasoline", efficiency: 11.4 }],
      defaultFuelType: "gasoline",
    },
    A4: {
      variants: [
        { fuelType: "gasoline", efficiency: 12.5 },
        { fuelType: "diesel", efficiency: 16.7 },
      ],
      defaultFuelType: "gasoline",
    },
    A6: {
      variants: [{ fuelType: "gasoline", efficiency: 11.3 }],
      defaultFuelType: "gasoline",
    },
    A7: {
      variants: [{ fuelType: "gasoline", efficiency: 10.6 }],
      defaultFuelType: "gasoline",
    },
    A8: {
      variants: [
        { fuelType: "gasoline", efficiency: 9.3 },
        { fuelType: "diesel", efficiency: 14.4 },
      ],
      defaultFuelType: "gasoline",
    },
    Q5: {
      variants: [
        { fuelType: "gasoline", efficiency: 10.1 },
        { fuelType: "diesel", efficiency: 14.7 },
      ],
      defaultFuelType: "gasoline",
    },
    E: {
      variants: [{ fuelType: "electric", efficiency: 3.0 }],
      defaultFuelType: "electric",
    },
  },
  포르쉐: {
    파나메라: {
      variants: [
        { fuelType: "gasoline", efficiency: 7.5 },
        { fuelType: "gasoline", efficiency: 11.4 }, // hybrid를 gasoline으로 처리 (높은 연비)
      ],
      defaultFuelType: "gasoline",
    },
    카이엔: {
      variants: [
        { fuelType: "gasoline", efficiency: 7.3 },
        { fuelType: "gasoline", efficiency: 10.5 }, // hybrid를 gasoline으로 처리 (높은 연비)
      ],
      defaultFuelType: "gasoline",
    },
    "911": {
      variants: [{ fuelType: "gasoline", efficiency: 8.5 }],
      defaultFuelType: "gasoline",
    },
    타이칸: {
      variants: [{ fuelType: "electric", efficiency: 4.2 }],
      defaultFuelType: "electric",
    },
    "718": {
      variants: [{ fuelType: "gasoline", efficiency: 8.4 }],
      defaultFuelType: "gasoline",
    },
  },
  볼보: {
    XC60: {
      variants: [
        { fuelType: "gasoline", efficiency: 10.0 },
        { fuelType: "gasoline", efficiency: 16.8 }, // hybrid를 gasoline으로 처리 (높은 연비)
      ],
      defaultFuelType: "gasoline",
    },
    XC90: {
      variants: [{ fuelType: "gasoline", efficiency: 16.4 }], // hybrid를 gasoline으로 처리 (높은 연비)
      defaultFuelType: "gasoline",
    },
    XC40: {
      variants: [
        { fuelType: "gasoline", efficiency: 11.3 },
        { fuelType: "gasoline", efficiency: 16.4 }, // hybrid를 gasoline으로 처리 (높은 연비)
        { fuelType: "electric", efficiency: 4.4 },
      ],
      defaultFuelType: "gasoline",
    },
    EX30: {
      variants: [{ fuelType: "electric", efficiency: 4.6 }],
      defaultFuelType: "electric",
    },
    EX90: {
      variants: [{ fuelType: "electric", efficiency: 4.4 }],
      defaultFuelType: "electric",
    },
    C40: {
      variants: [{ fuelType: "electric", efficiency: 4.6 }],
      defaultFuelType: "electric",
    },
  },
};

export function getBrands(): string[] {
  return Object.keys(vehicleData);
}

export function getModels(brand: string): string[] {
  if (!brand || !vehicleData[brand]) return [];
  const models = Object.keys(vehicleData[brand]);
  // 한글과 영문이 섞여있을 수 있으므로 정렬
  return models.sort((a, b) => {
    // 한글과 영문을 구분하여 정렬
    const aIsKorean = /[가-힣]/.test(a);
    const bIsKorean = /[가-힣]/.test(b);
    
    // 한글이 우선
    if (aIsKorean && !bIsKorean) return -1;
    if (!aIsKorean && bIsKorean) return 1;
    
    // 같은 타입이면 일반 정렬
    return a.localeCompare(b, 'ko');
  });
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




