import { api } from "@/lib/api";
import type {
  Bean,
  CareCycle,
  Constants,
  Machine,
  MachinePrice,
  SalesRep,
} from "@/services/coffee/types";

const RESOURCE_ROOT = "/coffee";

async function get<T>(path: string): Promise<T> {
  const { data } = await api.get<T>(`${RESOURCE_ROOT}${path}`);
  return data;
}

export const fetchMachines = () => get<Machine[]>("/machines.json");
export const fetchMachinePrices = () => get<MachinePrice[]>("/machine-prices.json");
export const fetchCareCycles = () => get<CareCycle[]>("/care-cycles.json");
export const fetchBeans = () => get<Bean[]>("/beans.json");
export const fetchSalesReps = () => get<SalesRep[]>("/sales-reps.json");
export const fetchConstants = () => get<Constants>("/constants.json");
