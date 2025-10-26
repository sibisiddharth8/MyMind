import { Link } from 'react-router-dom';
import { FiBox, FiArrowUp, FiStar, FiGitPullRequest, FiGitBranch, FiSearch, FiTrendingUp, FiClock } from 'react-icons/fi';
import { VscRepo, VscGitCommit, VscSourceControl, VscError, VscRocket } from 'react-icons/vsc';
import { usePortfolioData } from '../hooks/usePortfolioData';
import SocialLinks from '../components/ui/SocialLinks';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGitHubOverview, getGitHubRepos } from '../services/githubService';
import { useDebounce } from '../hooks/useDebounce';
import RepoCardSkeleton from '../components/footer/RepoCardSkeleton';
import NyraLogo from '../assets/NyraAICropped.png';

const eventIcons: { [key: string]: JSX.Element } = {
    'VscGitCommit': <VscGitCommit className="text-sky-600" />,
    'VscRepo': <VscRepo className="text-emerald-600" />,
    'FiGitPullRequest': <FiGitPullRequest className="text-violet-600" />,
    'VscError': <VscError className="text-rose-600" />,
    'VscRocket': <VscRocket className="text-amber-600" />,
};

export default function Footer() {
    const { links } = usePortfolioData();
    const currentYear = new Date().getFullYear();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { 
        data: overviewData, 
        isLoading: isOverviewLoading, 
        error: overviewError 
    } = useQuery({
        queryKey: ['githubOverview'],
        queryFn: getGitHubOverview,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const { 
        data: displayedRepos, 
        isLoading: isReposLoading,
        error: reposError 
    } = useQuery({
        queryKey: ['githubRepos', sortBy, debouncedSearchTerm],
        queryFn: () => getGitHubRepos(debouncedSearchTerm, sortBy),
        keepPreviousData: true,
    });

    const stats = overviewData?.stats || { stars: -1, commits: 0, prs: 0, repos: 0 };
    const latestActivity = overviewData?.latestActivity || [];
    const repos = displayedRepos || [];
    
    const loadingStats = isOverviewLoading;
    const loadingRepos = isReposLoading;
    
    const errorMessage = overviewError ? (overviewError as Error).message : (reposError ? (reposError as Error).message : null);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const Skeleton = ({ className }: { className: string }) => <div className={`animate-pulse bg-slate-200 rounded-md ${className}`}></div>;
    
    const LiveIndicator = () => (
        <div className="flex items-center gap-2 text-xs text-green-600">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live from GitHub
        </div>
    );

    return (
        <footer className="bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12 py-12">
                    <div className="md:col-span-2">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                            <div className="relative w-full sm:w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search my repositories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex-shrink-0 flex items-center bg-slate-200/80 p-1 rounded-md">
                                <button
                                    onClick={() => setSortBy('popular')}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded cursor-pointer ${sortBy === 'popular' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
                                >
                                    <FiTrendingUp /> Popular
                                </button>
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded cursor-pointer ${sortBy === 'recent' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}
                                >
                                    <FiClock /> Recent
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loadingRepos ? (
                                Array.from({ length: 3 }).map((_, i) => <RepoCardSkeleton key={i} />)
                            ) : errorMessage ? (
                                <p className="text-red-500 text-xs col-span-full">{errorMessage}</p>
                            ) : displayedRepos.length > 0 ? (
                                displayedRepos.map(repo => (
                                    <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" 
                                       className="block bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group h-full">
                                        <div className="flex items-center gap-2 mb-2">
                                            <VscRepo className="text-slate-500 flex-shrink-0"/>
                                            <span className="font-semibold text-slate-800 truncate group-hover:text-blue-600">{repo.name}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2 h-10 truncate">{repo.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-600 mt-auto">
                                            <div className="flex items-center gap-1"><FiStar /><span>{repo.stargazers_count}</span></div>
                                            <div className="flex items-center gap-1"><FiGitBranch /><span>{repo.forks_count}</span></div>
                                            {repo.language && <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                                                <span>{repo.language}</span>
                                            </div>}
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm col-span-full text-center py-8">
                                    {debouncedSearchTerm 
                                        ? `No repositories found for "${searchTerm}".`
                                        : "No popular repositories to display." 
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-900">Live Activity</h3>
                            <LiveIndicator />
                        </div>
                        <div className="space-y-3">
                            {loadingStats ? (
                                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)
                            ) : latestActivity.length > 0 ? (
                                latestActivity.map(event => (
                                    <div key={event.id} className="flex items-center gap-3 text-xs">
                                        <div className="flex-shrink-0">{eventIcons[event.config.icon]}</div>
                                        <div className="text-slate-600">
                                            {event.config.label}{' '}
                                            <a href={event.repoUrl} target="_blank" rel="noopener noreferrer" 
                                                className="font-semibold text-slate-800 hover:underline">
                                                {event.repoName}
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-xs">No recent public activity.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 py-6 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="text-center lg:text-left">
                        <div className='flex items-center gap-4 justify-center lg:justify-start'>
                            <Link to="/" className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                                <FiBox className="w-6 h-6 text-blue-600" />
                                <span className="text-lg font-bold text-slate-800">MyMind</span>
                            </Link>
                            <Link to='/nyra' className='flex items-center justify-center lg:justify-start gap-2 mb-2'>
                                <img src={NyraLogo} alt="Nyra Logo" className="h-6.5" />
                                <span className="text-lg font-bold text-slate-800">Nyra.ai</span>
                            </Link>
                        </div>
                        <p className="text-xs text-slate-500">
                            &copy; {currentYear} Sibi Siddharth S. All Rights Reserved.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex items-center gap-3">
                            {loadingStats ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-20" />) :
                                Object.entries(stats).filter(([key, value]) => value !== -1).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-1.5 bg-slate-200/80 text-slate-700 px-2.5 py-1 rounded-md text-xs">
                                        {key === 'stars' && <FiStar/>} {key === 'commits' && <VscGitCommit/>} {key === 'prs' && <FiGitPullRequest/>} {key === 'repos' && <VscSourceControl/>}
                                        <span className="font-bold">{value.toLocaleString()}</span>
                                    </div>
                                ))
                            }
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div>
                                <SocialLinks links={links} />
                            </div>
                            <div className='flex items-center justify-center'>
                                <Link to="/terms" className="text-sm text-slate-500 hover:text-blue-600 hover:underline">Terms & Conditions</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}