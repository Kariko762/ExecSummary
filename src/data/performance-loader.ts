// Auto-load all performance JSON files
const performanceFiles = import.meta.glob('./performance/*.json', { eager: true });

export interface PerformanceData {
  id: string;
  date: string;
  displayName: string;
  demoStudio: {
    demosRegistered: number;
    demosLinkedToDeals: number;
    wonACV: number;
    conversionRate: number;
  };
  activityInsights: {
    capitalMarkets: {
      demoSupportHours: number;
      demoPrepHours: number;
      demoHours: number;
      supportPercentage: number;
      prepPercentage: number;
      demoPercentage: number;
    };
    banking: {
      demoSupportHours: number;
      demoPrepHours: number;
      demoHours: number;
      supportPercentage: number;
      prepPercentage: number;
      demoPercentage: number;
    };
  };
  topAssets: Array<{
    name: string;
    count: number;
    category: string;
  }>;
  demosPerMonth: Array<{
    month: string;
    demos: number;
  }>;
}

export const performanceData: PerformanceData[] = Object.values(performanceFiles)
  .map((module: any) => module.default)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Get the latest performance data
export const latestPerformance = performanceData[0];
