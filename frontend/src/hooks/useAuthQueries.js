import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { useDispatch } from 'react-redux';
import { setCredentials, logout as logoutAction } from '../store/slices/authSlice';

// Login mutation
export const useLogin = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (response) => {
      const { token, user } = response.data;
      dispatch(setCredentials({ token, user }));
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
    },
  });
};

// Register mutation
export const useRegister = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: (response) => {
      const { token, user } = response.data;
      dispatch(setCredentials({ token, user }));
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear();
    },
  });
};

// Get profile query
export const useProfile = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const response = await authService.getProfile();
      return response.data;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
