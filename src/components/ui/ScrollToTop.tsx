import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component has no visual output. Its only job is to scroll to the top on navigation.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}