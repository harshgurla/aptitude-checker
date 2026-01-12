import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      onError: (error) => {
        console.error('Query error:', error);
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query keys for better organization
export const queryKeys = {
  // Auth
  profile: () => ['profile'],
  
  // Dashboard
  dashboard: () => ['dashboard'],
  todaysTest: () => ['todaysTest'],
  leaderboard: () => ['leaderboard'],
  
  // Test
  test: (testId) => ['test', testId],
  testQuestions: (testId) => ['test', testId, 'questions'],
  testResult: (testId) => ['test', testId, 'result'],
  
  // Admin
  adminDashboard: () => ['admin', 'dashboard'],
  students: (skip, limit) => ['admin', 'students', skip, limit],
  student: (studentId) => ['admin', 'student', studentId],
  todayTopic: () => ['admin', 'todayTopic'],
};
