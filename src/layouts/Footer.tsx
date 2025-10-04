import { Link } from 'react-router-dom';
import { FiBox, FiArrowUp, FiStar, FiGitPullRequest, FiGitBranch, FiExternalLink, FiSearch, FiTrendingUp, FiClock } from 'react-icons/fi';
import { VscRepo, VscGitCommit, VscSourceControl, VscError, VscRocket } from 'react-icons/vsc';
import { usePortfolioData } from '../hooks/usePortfolioData';
import SocialLinks from '../components/ui/SocialLinks';
import { useState, useEffect, useMemo } from 'react';

import NyraLogo from '../assets/NyraAICropped.png';

const eventConfig = {
    'PushEvent': { icon: <VscGitCommit className="text-sky-600" />, label: 'Pushed to' },
    'CreateEvent': { icon: <VscRepo className="text-emerald-600" />, label: 'Created repo' },
    'PullRequestEvent': { icon: <FiGitPullRequest className="text-violet-600" />, label: 'Opened PR in' },
    'IssuesEvent': { icon: <VscError className="text-rose-600" />, label: 'Opened issue in' },
    'ReleaseEvent': { icon: <VscRocket className="text-amber-600" />, label: 'New release in' },
};

export default function Footer() {
    const { links } = usePortfolioData();
    const currentYear = new Date().getFullYear();
    const username = "sibisiddharth8";

    const [stats, setStats] = useState({ stars: 0, commits: 0, prs: 0, repos: 0 });
    const [allRepos, setAllRepos] = useState([]);
    const [latestActivity, setLatestActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('popular');

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchGitHubData = async () => {
            try {
                setLoading(true);
                const headers: { [key: string]: string } = { 'Accept': 'application/vnd.github.v3+json' };

                const token = import.meta.env.VITE_APP_GITHUB_TOKEN;

                if (token) {
                  headers['Authorization'] = `token ${token}`;
                }
                
                const [reposRes, commitsRes, pullsRes, eventsRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers }),
                    fetch(`https://api.github.com/search/commits?q=author:${username}`, { headers }),
                    fetch(`https://api.github.com/search/issues?q=author:${username}+is:pr`, { headers }),
                    fetch(`https://api.github.com/users/${username}/events/public?per_page=5`, { headers })
                ]);

                if (!reposRes.ok || !commitsRes.ok || !pullsRes.ok || !eventsRes.ok) {
                    if (reposRes.status === 403) throw new Error('GitHub API rate limit exceeded.');
                    throw new Error('Failed to fetch data from GitHub.');
                }

                const reposData = await reposRes.json();
                const commitsData = await commitsRes.json();
                const pullsData = await pullsRes.json();
                const eventsData = await eventsRes.json();
                
                const nonForkedRepos = reposData.filter(r => !r.fork);
                setAllRepos(nonForkedRepos);

                setStats({
                    stars: nonForkedRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0),
                    commits: commitsData.total_count,
                    prs: pullsData.total_count,
                    repos: nonForkedRepos.length
                });

                const filteredEvents = eventsData.filter(event => eventConfig[event.type]).slice(0, 3);
                setLatestActivity(filteredEvents);

                setError(null);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubData();
    }, [username]);

    const displayedRepos = useMemo(() => {
        return allRepos
            .filter(repo => repo.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                if (sortBy === 'popular') {
                    return b.stargazers_count - a.stargazers_count;
                }
                return new Date(b.pushed_at) - new Date(a.pushed_at);
            })
            .slice(0, 3);
    }, [allRepos, searchTerm, sortBy]);


    const Skeleton = ({ className }) => <div className={`animate-pulse bg-slate-200 rounded-md ${className}`}></div>;
    
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
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)
                            ) : error ? (
                                <p className="text-red-500 text-xs col-span-full">{error}</p>
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
                                <p className="text-slate-500 text-sm col-span-full text-center py-8">No repositories found for "{searchTerm}".</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-900">Live Activity</h3>
                            <LiveIndicator />
                        </div>
                        <div className="space-y-3">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)
                            ) : latestActivity.length > 0 ? (
                                latestActivity.map(event => (
                                    <div key={event.id} className="flex items-center gap-3 text-xs">
                                        <div className="flex-shrink-0">{eventConfig[event.type]?.icon}</div>
                                        <div className="text-slate-600">
                                            {eventConfig[event.type]?.label}{' '}
                                            <a href={`https://github.com/${event.repo.name}`} target="_blank" rel="noopener noreferrer" 
                                               className="font-semibold text-slate-800 hover:underline">
                                               {event.repo.name.split('/')[1]}
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
                            {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-20" />) :
                                Object.entries(stats).map(([key, value]) => (
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
                                {/* <button onClick={handleScrollToTop} className="cursor-pointer text-slate-500 hover:text-blue-600 absolute right-10" title="Back to top">
                                    <FiArrowUp size={20}/>
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}