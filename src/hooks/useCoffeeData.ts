import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchBeans,
  fetchCareCycles,
  fetchConstants,
  fetchMachinePrices,
  fetchMachines,
  fetchSalesReps,
} from "@/api/resources";

const STALE = 1000 * 60 * 60; // 1h — mock API is static

export const machinesKey = ["machines"] as const;
export const machinePricesKey = ["machine-prices"] as const;
export const careCyclesKey = ["care-cycles"] as const;
export const beansKey = ["beans"] as const;
export const salesRepsKey = ["sales-reps"] as const;
export const constantsKey = ["constants"] as const;

export function useMachines() {
  return useQuery({ queryKey: machinesKey, queryFn: fetchMachines, staleTime: STALE });
}
export function useMachinePrices() {
  return useQuery({ queryKey: machinePricesKey, queryFn: fetchMachinePrices, staleTime: STALE });
}
export function useCareCycles() {
  return useQuery({ queryKey: careCyclesKey, queryFn: fetchCareCycles, staleTime: STALE });
}
export function useBeans() {
  return useQuery({ queryKey: beansKey, queryFn: fetchBeans, staleTime: STALE });
}
export function useSalesReps() {
  return useQuery({ queryKey: salesRepsKey, queryFn: fetchSalesReps, staleTime: STALE });
}
export function useConstants() {
  return useQuery({ queryKey: constantsKey, queryFn: fetchConstants, staleTime: STALE });
}

export function useCoffeeBundle() {
  const results = useQueries({
    queries: [
      { queryKey: machinesKey, queryFn: fetchMachines, staleTime: STALE },
      { queryKey: machinePricesKey, queryFn: fetchMachinePrices, staleTime: STALE },
      { queryKey: careCyclesKey, queryFn: fetchCareCycles, staleTime: STALE },
      { queryKey: beansKey, queryFn: fetchBeans, staleTime: STALE },
      { queryKey: salesRepsKey, queryFn: fetchSalesReps, staleTime: STALE },
      { queryKey: constantsKey, queryFn: fetchConstants, staleTime: STALE },
    ],
  });
  const [machines, machinePrices, careCycles, beans, salesReps, constants] = results;
  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  return {
    isLoading,
    isError,
    data:
      !isLoading && !isError
        ? {
            machines: machines.data!,
            machinePrices: machinePrices.data!,
            careCycles: careCycles.data!,
            beans: beans.data!,
            salesReps: salesReps.data!,
            constants: constants.data!,
          }
        : null,
  };
}
