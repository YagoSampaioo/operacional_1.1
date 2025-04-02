export interface Location {
  id: number;
  created_at: string;
  empresa: string;
  estado: string;
  pais: string;
  cidade: string;
  latitude: string;
  longitude: string;
}

export interface Churn {
  id: number;
  created_at: string;
  empresa: string;
  motivo: string;
  data_de_churn: string;
  LTV: number;
  gestor: string;
  valor_perdido: number;
  squad: string;
}

export interface Upsell {
  id: number;
  created_at: string;
  empresa: string;
  servico: string;
  data_de_upsell: string;
  gestor: string;
  valor_de_upsell: number;
  squad: string;
}

export interface ClientNote {
  id: string;
  client_name: string;
  note: string;
  created_at: string;
  updated_at: string;
}