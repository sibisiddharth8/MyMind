import { useQuery } from '@tanstack/react-query';
import { getAboutData } from '../services/aboutService';
import { getLinksData } from '../services/linksService';
import { AxiosError } from 'axios';

/**
 * A custom hook to fetch all essential data for the main page.
 */
export function usePortfolioData() {
  // Query for 'About' data (this is considered critical for the page)
  const aboutQuery = useQuery({
    queryKey: ['aboutData'],
    queryFn: getAboutData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for 'Links' data (this is optional)
  const linksQuery = useQuery({
    queryKey: ['linksData'],
    queryFn: getLinksData,
    staleTime: 1000 * 60 * 60, // 1 hour
    // This tells react-query to not treat a 404 "Not Found" as an error for this specific query
    retry: (failureCount, error) => {
      if ((error as AxiosError)?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // --- THIS IS THE FIX ---
  // The hook now returns BOTH the detailed query objects AND the simplified data.
  return {
    // Detailed query objects for pages that need loading/error states
    aboutQuery,
    linksQuery,
    
    // Simplified, direct access to data for simpler components like the Footer
    about: aboutQuery.data?.data,
    links: linksQuery.data?.data,
  };
}