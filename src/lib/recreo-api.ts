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

  // Build URL with query params
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
    next: { revalidate: 30 }, // Cache for 30 seconds
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
}

interface PiecesResponse {
  success: boolean;
  data: InventoryPiece[];
  meta: {
    pagination: { page: number; per_page: number; total: number; pages: number };
    status_counts: Record<string, number>;
  };
}

interface PieceResponse {
  success: boolean;
  data: InventoryPiece;
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
  return apiRequest<PiecesResponse>("/inventory_pieces", { params: params as Record<string, string | number | undefined> });
}

export async function fetchPiece(id: string): Promise<PieceResponse> {
  return apiRequest<PieceResponse>(`/inventory_pieces/${id}`);
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

interface BoxesResponse {
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
  return apiRequest<BoxesResponse>("/inventory_boxes", { params: params as Record<string, string | number | undefined> });
}

export async function fetchBox(id: string) {
  return apiRequest<{ success: boolean; data: InventoryBox }>(`/inventory_boxes/${id}`);
}

// ============================================
// Inventory Receipts
// ============================================

export interface InventoryReceipt {
  id: string;
  receipt_number: string;
  status: string;
  expected_pieces_count: number;
  received_pieces_count: number;
  notes: string | null;
  project: { id: string; name: string } | null;
  location: { id: string; name: string } | null;
  created_at: string;
}

interface ReceiptsResponse {
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
}): Promise<ReceiptsResponse> {
  return apiRequest<ReceiptsResponse>("/inventory_receipts", { params: params as Record<string, string | number | undefined> });
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

export async function fetchLocations(): Promise<{ success: boolean; data: Location[] }> {
  return apiRequest("/locations", { params: { per_page: 100 } });
}

export async function fetchProjects(): Promise<{ success: boolean; data: Project[] }> {
  return apiRequest("/projects", { params: { per_page: 100, status: "active" } });
}
