import { API_ENDPOINTS } from "@/lib/api-config";

export interface VietQrBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

interface VietQrBanksResponse {
  code: string;
  desc: string;
  data: VietQrBank[];
}

const VIET_QR_BANKS_ENDPOINT = API_ENDPOINTS.banks.list;

export async function fetchVietQrBanks() {
  const response = await fetch(VIET_QR_BANKS_ENDPOINT, {
    method: "GET",
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách ngân hàng");
  }

  const payload = (await response.json()) as VietQrBanksResponse;

  if (payload.code !== "00" || !Array.isArray(payload.data)) {
    throw new Error(payload.desc || "Dữ liệu ngân hàng không hợp lệ");
  }

  return payload.data;
}
