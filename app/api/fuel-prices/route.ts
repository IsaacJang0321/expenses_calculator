import { NextRequest, NextResponse } from "next/server";

// 간단한 XML 파싱 헬퍼 함수
function parseXML(xmlText: string): { [key: string]: any }[] {
  const oils: { [key: string]: any }[] = [];
  
  // <OIL> 태그들을 찾아서 파싱
  const oilRegex = /<OIL>(.*?)<\/OIL>/gs;
  let match;
  
  while ((match = oilRegex.exec(xmlText)) !== null) {
    const oilContent = match[1];
    const oil: { [key: string]: string } = {};
    
    // 각 필드 추출
    const fields = ['TRADE_DT', 'PRODCD', 'PRODNM', 'PRICE', 'DIFF'];
    fields.forEach(field => {
      const fieldRegex = new RegExp(`<${field}>(.*?)<\/${field}>`, 's');
      const fieldMatch = fieldRegex.exec(oilContent);
      if (fieldMatch) {
        oil[field] = fieldMatch[1].trim();
      }
    });
    
    if (oil.PRODCD) {
      oils.push(oil);
    }
  }
  
  return oils;
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPINET_API_KEY;

    if (!apiKey) {
      console.warn("OPINET_API_KEY not configured, returning default prices");
      return NextResponse.json({
        gasoline: 1850,
        premiumGasoline: null,
        diesel: 1650,
        lpg: 950,
        timestamp: Date.now(),
      });
    }

    // 오피넷 API 호출
    const url = `https://www.opinet.co.kr/api/avgAllPrice.do?code=${apiKey}&out=xml`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/xml",
      },
    });

    if (!response.ok) {
      throw new Error(`OPINET API error: ${response.status}`);
    }

    const xmlText = await response.text();
    
    // 에러 체크
    if (xmlText.includes("<ERROR>")) {
      const errorMatch = xmlText.match(/<ERROR>(.*?)<\/ERROR>/s);
      const errorMsg = errorMatch ? errorMatch[1].trim() : "Unknown error";
      throw new Error(`OPINET API error: ${errorMsg}`);
    }

    // XML 파싱
    const oils = parseXML(xmlText);
    
    let gasoline = 1850; // 기본값 (일반 휘발유 B027)
    let premiumGasoline: number | null = null; // 고급휘발유 (B034)
    let diesel = 1650; // 기본값
    let lpg = 950; // 기본값

    oils.forEach((oil) => {
      const prodcd = oil.PRODCD;
      const price = oil.PRICE ? parseFloat(oil.PRICE) : null;

      if (price === null || isNaN(price)) return;

      // 제품 코드에 따라 매핑
      // B027: 휘발유 (일반)
      if (prodcd === "B027") {
        gasoline = price;
      }
      // B034: 고급휘발유
      else if (prodcd === "B034") {
        premiumGasoline = price;
      }
      // D047: 자동차용경유
      else if (prodcd === "D047") {
        diesel = price;
      }
      // LPG는 다른 코드일 수 있음 (C004 등)
      else if (prodcd === "C004" || prodcd?.includes("LPG")) {
        lpg = price;
      }
    });

    return NextResponse.json({
      gasoline: Math.round(gasoline),
      premiumGasoline: premiumGasoline ? Math.round(premiumGasoline) : null,
      diesel: Math.round(diesel),
      lpg: Math.round(lpg),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to fetch fuel prices from OPINET:", error);
    
    // 에러 발생 시 기본값 반환
    return NextResponse.json({
      gasoline: 1850,
      premiumGasoline: null,
      diesel: 1650,
      lpg: 950,
      timestamp: Date.now(),
    });
  }
}

