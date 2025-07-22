import { Link } from 'react-router-dom';
import { FiBox, FiArrowUp, FiStar, FiGitPullRequest } from 'react-icons/fi';
import { VscRepo, VscGitCommit } from 'react-icons/vsc';
import { usePortfolioData } from '../hooks/usePortfolioData';
import SocialLinks from '../components/ui/SocialLinks';
import React, { useState, useEffect } from 'react';

export default function Footer() {
  const { links } = usePortfolioData();
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- START: GitHub Data Fetching for Stat Bar ---
  const username = "sibisiddharth8";
  const [devStats, setDevStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevMetrics = async () => {
      try {
        setLoading(true);
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        
        const [reposRes, commitsRes, pullsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers }),
          fetch(`https://api.github.com/search/commits?q=author:${username}`, { headers }),
          fetch(`https://api.github.com/search/issues?q=author:${username}+is:pr`, { headers }),
        ]);

        if (!reposRes.ok || !commitsRes.ok || !pullsRes.ok) {
            throw new Error('Failed to fetch GitHub metrics.');
        }

        const reposData = await reposRes.json();
        const commitsData = await commitsRes.json();
        const pullsData = await pullsRes.json();

        const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);

        const stats = [
          {
            id: 'stars',
            icon: <FiStar className="text-slate-500" />,
            value: totalStars,
            label: 'Stars',
          },
          {
            id: 'commits',
            icon: <VscGitCommit className="text-slate-500" />,
            value: commitsData.total_count,
            label: 'Commits',
          },
          {
            id: 'prs',
            icon: <FiGitPullRequest className="text-slate-500" />,
            value: pullsData.total_count,
            label: 'PRs',
          },
          {
            id: 'repos',
            icon: <VscRepo className="text-slate-500" />,
            value: reposData.filter(r => !r.fork).length, // Counting non-forked repos
            label: 'Repos',
          },
        ];
        
        setDevStats(stats);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDevMetrics();
  }, [username]);
  
  const StatBadge = ({ stat }) => (
    <div className="flex items-center gap-2 bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-300 transition-colors">
        {stat.icon}
        <span className="font-bold text-sm">{stat.value.toLocaleString()}</span>
        <span className="text-xs text-slate-600">{stat.label}</span>
    </div>
  );
  
  const SkeletonBadge = () => <div className="animate-pulse bg-slate-200 h-9 w-24 rounded-md"></div>;

  const LiveIndicator = () => (
    <div className="flex items-center gap-2 text-sm text-green-600">
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Live from GitHub
    </div>
  );
  // --- END: GitHub Data Fetching ---

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6">
        {/* --- Top Section: Branding and GitHub Snapshot --- */}
        <div className="py-10 flex flex-col md:flex-row justify-between md:items-start gap-8">
            {/* Branding Section */}
            <div className="flex-shrink-0">
                <Link to="/" className="flex items-center gap-2 mb-2">
                    <FiBox className="w-7 h-7 text-blue-600" />
                    <span className="text-xl font-bold text-slate-800">MyMind</span>
                </Link>
                <p className="text-slate-500 text-sm max-w-xs">
                    A personal space for thoughts, projects, and professional insights.
                </p>
            </div>

            {/* GitHub Snapshot Section */}
            <div className="w-full md:w-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">GitHub Snapshot</h3>
                    <LiveIndicator />
                </div>
                 <div className="flex flex-wrap items-center justify-start gap-3">
                    {loading ? 
                        Array.from({ length: 4 }).map((_, i) => <SkeletonBadge key={i} />) : 
                        error ? <p className="text-red-500 text-xs">{error}</p> :
                        devStats.map(stat => <StatBadge key={stat.id} stat={stat} />)
                    }
                </div>
            </div>
        </div>

        {/* --- Bottom Bar: Copyright, Social & Utility Links --- */}
        <div className="border-t border-slate-200 py-5 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
                 <p className="text-sm text-slate-500">
                    &copy; {currentYear} Sibi Siddharth S. All Rights Reserved.
                 </p>
            </div>
            <div className="flex items-center gap-x-6 gap-y-4 flex-col sm:flex-row ">
                <SocialLinks links={links} />
                 <Link to="/terms" className="text-sm text-slate-500 hover:text-blue-600 hover:underline">
                    Terms & Conditions
                 </Link>
                <button onClick={handleScrollToTop} className="text-slate-500 hover:text-blue-600 hidden sm:block" title="Back to top">
                    <FiArrowUp size={20}/>
                </button>
            </div>
        </div>
      </div>
    </footer>
  );
}