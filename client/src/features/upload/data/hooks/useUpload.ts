import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadAvatar,
  deleteAvatar,
  uploadClubLogo,
  deleteClubLogo,
} from '../services/upload.service';

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
}

export function useUploadClubLogo(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadClubLogo(clubId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-club'] });
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
    },
  });
}

export function useDeleteClubLogo(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteClubLogo(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-club'] });
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
    },
  });
}
