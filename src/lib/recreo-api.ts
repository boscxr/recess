// API Client for recreo-api (Rails backend)
// Used for NorthCargo inventory operations

const API_BASE = process.env.RECREO_API_URL || "http://localhost:3000";
const API_TOKEN = process.env.RECREO_API_TOKEN || "";
const TENANT_SLUG = process.env.RECREO_TENANT_SLUG || "northcargo";

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;

  const url = new URL(`/api/v1/admin${path}`, API_BASE);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Tenant-Slug": TENANT_SLUG,
  };

  if (API_TOKEN) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  return res.json();
}

// ============================================
// Inventory Pieces
// ============================================

export interface InventoryPiece {
  id: string;
  serial_number: string;
  folio: string | null;
  qr_code: string;
  current_status: string;
  condition: string;
  origin_type: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  weight: number | null;
  dimensions: string | null;
  notes: string | null;
  reception_notes: string | null;
  quantity: number;
  received_at: string | null;
  delivered_at: string | null;
  received_us_at: string | null;
  reviewed_us_at: string | null;
  received_mx_at: string | null;
  reviewed_mx_at: string | null;
  created_at: string;
  updated_at: string;
  status_label: string;
  status_color: string;
  requires_evidence: boolean;
  valid_next_statuses: { key: string; label: string; requires_evidence: boolean }[];
  display_name: string;
  full_description: string;
  days_since_received: number | null;
  days_in_current_status: number;
  product: { id: string; name: string; sku: string } | null;
  project: { id: string; name: string; project_type: string } | null;
  current_location: { id: string; name: string; code: string; location_type: string } | null;
  inventory_box: {
    id: string;
    box_number: string;
    qr_code: string;
    status: string;
    box_sequence: number | null;
    total_boxes: number | null;
    sequence_label: string | null;
  } | null;
  invoice_info: { id: string; invoice_number: string; supplier_name: string } | null;
  recent_movements: {
    id: string;
    from_status: string;
    to_status: string;
    movement_type: string;
    description: string;
    performed_by: string;
    has_evidence: boolean;
    created_at: string;
  }[];
  // Show-only: full movements array
  movements?: {
    id: string;
    piece_serial: string;
    from_status: string;
    to_status: string;
    movement_type: string;
    performed_by: string;
    notes: string;
    created_at: string;
  }[];
}

// Actual backend response shape: { pieces: [...], meta: {...}, status_counts: {...} }
interface RawPiecesResponse {
  pieces: InventoryPiece[];
  meta: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
  status_counts: Record<string, number>;
}

// Normalized shape for frontend consumption
export interface PiecesResponse {
  success: boolean;
  data: InventoryPiece[];
  meta: {
    pagination: { page: number; per_page: number; total: number; pages: number };
    status_counts: Record<string, number>;
  };
}

export async function fetchPieces(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  origin_type?: string;
  project_id?: string;
  location_id?: string;
  search?: string;
  sort?: string;
  direction?: string;
}): Promise<PiecesResponse> {
  const raw = await apiRequest<RawPiecesResponse>("/inventory_pieces", {
    params: params as Record<string, string | number | undefined>,
  });
  return {
    success: true,
    data: raw.pieces,
    meta: {
      pagination: {
        page: raw.meta.current_page,
        per_page: raw.meta.per_page,
        total: raw.meta.total_count,
        pages: raw.meta.total_pages,
      },
      status_counts: raw.status_counts || {},
    },
  };
}

// Show returns piece directly (no wrapper)
export async function fetchPiece(id: string): Promise<{ success: boolean; data: InventoryPiece }> {
  const piece = await apiRequest<InventoryPiece>(`/inventory_pieces/${id}`);
  return { success: true, data: piece };
}

// Lookup by folio
export async function fetchPieceByFolio(folio: string): Promise<{ success: boolean; data: InventoryPiece }> {
  const piece = await apiRequest<InventoryPiece>(`/inventory_pieces/by_folio/${encodeURIComponent(folio)}`);
  return { success: true, data: piece };
}

export async function transitionPiece(
  id: string,
  status: string,
  data?: { location_id?: string; notes?: string; condition?: string }
) {
  return apiRequest(`/inventory_pieces/${id}/transition`, {
    method: "POST",
    body: { status, ...data },
  });
}

// Dashboard KPIs
export interface DashboardData {
  summary: {
    total_pieces: number;
    pendiente_compra: number;
    por_recibir: number;
    en_bodega: number;
    en_transito: number;
    entregado: number;
    danado: number;
  };
  status_breakdown: Record<string, number>;
  condition_breakdown: Record<string, number>;
  stale: {
    total: number;
    threshold_days: number;
    breakdown: Record<string, number>;
    aging_breakdown: { status: string; bucket_7_14: number; bucket_14_30: number; bucket_30_plus: number }[];
  };
  recent_activity: {
    id: string;
    piece_serial: string;
    piece_name: string;
    piece_id: string;
    from_status: string;
    to_status: string;
    movement_type: string;
    performed_by: string;
    notes: string;
    created_at: string;
  }[];
}

export async function fetchDashboard(params?: { stale_days?: number }): Promise<DashboardData> {
  return apiRequest<DashboardData>("/inventory_pieces/dashboard", {
    params: params as Record<string, string | number | undefined>,
  });
}

// Statuses catalog
export interface StatusConfig {
  key: string;
  label: string;
  label_en: string;
  color: string;
  requires_evidence: boolean;
  evidence_requirements: string[];
  next_statuses: string[];
}

export async function fetchStatuses(): Promise<Record<string, StatusConfig>> {
  return apiRequest<Record<string, StatusConfig>>("/inventory_pieces/statuses");
}

// ============================================
// Inventory Boxes
// ============================================

export interface InventoryBox {
  id: string;
  box_number: string;
  qr_code: string;
  status: string;
  description: string | null;
  weight: number | null;
  dimensions: string | null;
  box_sequence: number | null;
  total_boxes: number | null;
  sequence_label: string | null;
  pieces_count: number;
  incoming_lines_count: number;
  total_quantity: number;
  pieces_by_status: Record<string, number>;
  display_name: string;
  project: { id: string; name: string; project_type: string } | null;
  location: { id: string; name: string; code: string; location_type: string } | null;
  pieces: {
    id: string;
    serial_number: string;
    qr_code: string;
    current_status: string;
    condition: string;
    quantity: number;
    display_name: string;
    product: { id: string; name: string; sku: string } | null;
  }[];
  created_at: string;
  updated_at: string;
}

// Actual backend: { boxes: [...], meta: {...} }
interface RawBoxesResponse {
  boxes: InventoryBox[];
  meta: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

export interface BoxesResponse {
  success: boolean;
  data: InventoryBox[];
  meta: {
    pagination: { page: number; per_page: number; total: number; pages: number };
  };
}

export async function fetchBoxes(params?: {
  page?: number;
  per_page?: number;
  project_id?: string;
  location_id?: string;
  status?: string;
  search?: string;
}): Promise<BoxesResponse> {
  const raw = await apiRequest<RawBoxesResponse>("/inventory_boxes", {
    params: params as Record<string, string | number | undefined>,
  });
  return {
    success: true,
    data: raw.boxes,
    meta: {
      pagination: {
        page: raw.meta.current_page,
        per_page: raw.meta.per_page,
        total: raw.meta.total_count,
        pages: raw.meta.total_pages,
      },
    },
  };
}

export async function fetchBox(id: string): Promise<{ success: boolean; data: InventoryBox }> {
  const box = await apiRequest<InventoryBox>(`/inventory_boxes/${id}`);
  return { success: true, data: box };
}

// ============================================
// Inventory Receipts
// ============================================

export interface InventoryReceipt {
  id: string;
  receipt_number: string;
  status: string;
  status_label: string;
  boxes_count: number;
  expected_pieces_count: number;
  received_pieces_count: number;
  good_pieces_count: number;
  damaged_pieces_count: number;
  missing_pieces_count: number;
  completion_percentage: number;
  overdue: boolean;
  transport_type: string | null;
  notes: string | null;
  expected_date: string | null;
  project: { id: string; code: string; name: string } | null;
  supplier: { id: string; code: string; name: string } | null;
  location: { id: string; name: string; location_type: string } | null;
  invoice: { id: string; invoice_number: string; supplier_name: string; status: string } | null;
  received_by: { id: string; name: string } | null;
  created_by: { id: string; name: string } | null;
  boxes: { id: string; box_number: string; status: string; display_name: string; pieces_count: number }[];
  created_at: string;
  updated_at: string;
}

// Actual backend: { inventory_receipts: [...], meta: {...} }
interface RawReceiptsResponse {
  inventory_receipts: InventoryReceipt[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ReceiptsResponse {
  success: boolean;
  data: InventoryReceipt[];
  meta: {
    pagination: { page: number; per_page: number; total: number; pages: number };
  };
}

export async function fetchReceipts(params?: {
  page?: number;
  per_page?: number;
  project_id?: string;
  status?: string;
  location_id?: string;
  overdue?: string;
  today?: string;
  this_week?: string;
  search?: string;
}): Promise<ReceiptsResponse> {
  const raw = await apiRequest<RawReceiptsResponse>("/inventory_receipts", {
    params: params as Record<string, string | number | undefined>,
  });
  return {
    success: true,
    data: raw.inventory_receipts,
    meta: {
      pagination: {
        page: raw.meta.current_page,
        per_page: raw.meta.per_page,
        total: raw.meta.total,
        pages: raw.meta.total_pages,
      },
    },
  };
}

// Receipt stats
export interface ReceiptStats {
  stats: {
    total: number;
    by_status: Record<string, number>;
    overdue: number;
    expected_today: number;
    expected_this_week: number;
    pieces_summary: {
      total_expected: number;
      total_received: number;
      total_good: number;
      total_damaged: number;
      total_missing: number;
    };
  };
}

export async function fetchReceiptStats(params?: {
  project_id?: string;
  from?: string;
  to?: string;
}): Promise<ReceiptStats> {
  return apiRequest<ReceiptStats>("/inventory_receipts/stats", {
    params: params as Record<string, string | number | undefined>,
  });
}

// ============================================
// Locations & Projects (for filters)
// ============================================

export interface Location {
  id: string;
  name: string;
  code: string;
  country: string;
  zone_code: string | null;
  city: string | null;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  folio_prefix: string | null;
  project_type: string;
  status: string;
}

export async function fetchLocations(): Promise<{ data: Location[] }> {
  return apiRequest("/locations", { params: { per_page: 100 } });
}

export async function fetchProjects(): Promise<{ data: Project[] }> {
  return apiRequest("/projects", { params: { per_page: 100, status: "active" } });
}
