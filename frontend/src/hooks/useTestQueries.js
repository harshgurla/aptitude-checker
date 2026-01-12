import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testService } from '../services/api';
import { queryKeys } from '../lib/queryClient';

// Start test mutation
export const useStartTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => testService.startTest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todaysTest() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    },
  });
};

// Get test questions
export const useTestQuestions = (testId, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.testQuestions(testId),
    queryFn: async () => {
      const response = await testService.getTest(testId);
      return response.data;
    },
    enabled: enabled && !!testId,
    staleTime: Infinity, // Don't refetch test questions
    cacheTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
};

// Submit test mutation
export const useSubmitTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testId, answers }) => testService.submitTest(testId, answers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testResult(variables.testId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.todaysTest() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard() });
    },
  });
};

// Get test result
export const useTestResult = (testId, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.testResult(testId),
    queryFn: async () => {
      const response = await testService.getResults(testId);
      return response.data;
    },
    enabled: enabled && !!testId,
    staleTime: Infinity, // Results don't change
  });
};
