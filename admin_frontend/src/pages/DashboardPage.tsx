import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { FiGithub } from 'react-icons/fi';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard">
        <Button onClick={() => window.open('https://github.com/your-username', '_blank')}>
          <FiGithub className="mr-2" />
          View Code
        </Button>
      </PageHeader>
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold text-slate-700">Welcome back!</h2>
        <p className="mt-2 text-slate-600">
          You can manage all sections of your portfolio from the sidebar navigation. This dashboard is the central hub for your content administration.
        </p>
      </div>
    </div>
  );
}