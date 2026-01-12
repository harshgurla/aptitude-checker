import { useQuery } from '@tanstack/react-query';
import { dashboardService, testService } from '../services/api';
import { queryKeys } from '../lib/queryClient';

// Get dashboard data
export const useDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: async () => {
      const [topicRes, historyRes, rankRes] = await Promise.all([
        dashboardService.getTodayTopic(),
        testService.getTestHistory(5),
        dashboardService.getUserRank(),
      ]);

      return {
        todayTopic: topicRes.data.topic,
        recentTests: historyRes.data.tests || [],
        userRank: rankRes.data.rank ?? null,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get today's test
export const useTodaysTest = () => {
  return useQuery({
    queryKey: queryKeys.todaysTest(),
    queryFn: async () => {
      const response = await dashboardService.getTodayTopic();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get leaderboard
export const useLeaderboard = () => {
  return useQuery({
    queryKey: queryKeys.leaderboard(),
    queryFn: async () => {
      const response = await dashboardService.getLeaderboard();
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
