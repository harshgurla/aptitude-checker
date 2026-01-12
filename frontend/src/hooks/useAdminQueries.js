import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/api';
import { queryKeys } from '../lib/queryClient';

// Get admin dashboard
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.adminDashboard(),
    queryFn: async () => {
      const response = await adminService.getDashboard();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get all students
export const useStudents = (skip = 0, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.students(skip, limit),
    queryFn: async () => {
      const response = await adminService.getAllStudents(skip, limit);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get student details
export const useStudent = (studentId, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.student(studentId),
    queryFn: async () => {
      const response = await adminService.getStudentDetails(studentId);
      return response.data;
    },
    enabled: enabled && !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get today's topic info
export const useTodayTopic = () => {
  return useQuery({
    queryKey: queryKeys.todayTopic(),
    queryFn: async () => {
      const response = await adminService.getTodayTopicInfo();
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute to update countdown
  });
};

// Generate questions mutation
export const useGenerateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminService.generateQuestions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTopic() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
    },
  });
};

// Rotate topic mutation
export const useRotateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminService.rotateTopic(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTopic() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard() });
    },
  });
};

// Toggle student active status
export const useToggleStudentActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId) => adminService.toggleStudentActive(studentId),
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      queryClient.invalidateQueries({ queryKey: queryKeys.student(studentId) });
    },
  });
};

// Pause student tests
export const usePauseStudentTests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, durationDays }) => 
      adminService.pauseStudentTests(studentId, durationDays),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      queryClient.invalidateQueries({ queryKey: queryKeys.student(studentId) });
    },
  });
};

// Resume student tests
export const useResumeStudentTests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId) => adminService.resumeStudentTests(studentId),
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      queryClient.invalidateQueries({ queryKey: queryKeys.student(studentId) });
    },
  });
};
