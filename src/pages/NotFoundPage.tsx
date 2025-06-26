import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';
import ActionButton from '../components/ui/ActionButton';
import ScrollToTop from '../components/ui/ScrollToTop';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6">
        <ScrollToTop />
      <div className="max-w-md">
        <FiAlertTriangle className="mx-auto h-16 w-16 text-amber-400" />
        <h1 className="mt-6 text-4xl md:text-5xl font-extrabold text-slate-800">
          404 - Page Not Found
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex justify-center">
          <Link to="/">
            <ActionButton>
                <FiHome className="mr-2" />
                Go Back to Homepage
            </ActionButton>
          </Link>
        </div>
      </div>
    </div>
  );
}