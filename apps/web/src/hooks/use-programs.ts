'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi, type ProgramQueryParams, type Program } from '@/lib/api/programs';

export const programKeys = {
  all: ['programs'] as const,
  catalog: (params?: ProgramQueryParams) => ['programs', 'catalog', params] as const,
  detail: (id: string) => ['programs', id] as const,
  slug: (slug: string) => ['programs', 'slug', slug] as const,
  stats: () => ['programs', 'stats'] as const,
};

export function useProgramCatalog(params?: ProgramQueryParams) {
  return useQuery({
    queryKey: programKeys.catalog(params),
    queryFn: () => programsApi.getCatalog(params),
  });
}

export function useProgramBySlug(slug: string) {
  return useQuery({
    queryKey: programKeys.slug(slug),
    queryFn: () => programsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useProgramById(id: string) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => programsApi.getById(id),
    enabled: !!id,
  });
}

export function useProgramStats() {
  return useQuery({
    queryKey: programKeys.stats(),
    queryFn: () => programsApi.getStats(),
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Program>) => programsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Program> }) =>
      programsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function usePublishProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => programsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}
