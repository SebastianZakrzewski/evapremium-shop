export interface Mats {
  id: number;
  type: string;
  color: string;
  cellType: string;
  edgeColor: string;
  image: string;
}

export interface CreateMatsRequest {
  type: string;
  color: string;
  cellType: string;
  edgeColor: string;
  image: string;
}

export interface UpdateMatsRequest extends Partial<CreateMatsRequest> {
  id: number;
}

export interface MatsFilter {
  type?: string;
  color?: string;
  cellType?: string;
  edgeColor?: string;
} 