import { getDashboardStats, getRecentArticles } from '@/lib/dashboard';
import Link from 'next/link';
import { 
  FileText, 
  Eye, 
  Star, 
  Tags, 
  TrendingUp, 
  PlusCircle, 
  PenSquare, 
  FileEdit,
  Newspaper,
  Info,
  Share2
} from 'lucide-react';

// Force dynamic or let Next.js cache depending on needs (Revalidating every hour fits CMS)
export const revalidate = 3600;
 
// Safe date formatter for admin dashboard
const formatAdminDate = (dateVal: string | number | undefined) => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  } catch (e) {
    return 'Error';
  }
};

export default async function AdminDashboard() {
  const statsData = await getDashboardStats();
  const recentArticles = await getRecentArticles(6);

  // KPIs
  const stats = [
    {
      label: 'Published Articles',
      value: statsData.publishedCount,
      trend: statsData.growth.published > 0 ? `+${statsData.growth.published}% this month` : 'Updated just now',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100/50',
    },
    {
      label: 'Total Views',
      value: statsData.totalViews.toLocaleString(),
      trend: 'Real-time sync',
      icon: Eye,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100/50',
    },
    {
      label: 'Featured Stories',
      value: statsData.featuredArticles,
      trend: `${statsData.featuredArticles} Active`,
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-100/50',
    },
    {
      label: 'Active Categories',
      value: statsData.totalCategories,
      trend: 'Live Database',
      icon: Tags,
      color: 'text-purple-600',
      bg: 'bg-purple-100/50',
    },
    {
      label: 'Total Shares',
      value: statsData.totalShares.toLocaleString(),
      trend: 'Viral Engagement',
      icon: Share2, // I need to import this if not already there
      color: 'text-pink-600',
      bg: 'bg-pink-100/50',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            Overview of your newsroom's performance, recent publications, and pending editorial tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/about"
            className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-sm hover:bg-secondary transition-colors inline-flex items-center gap-2"
          >
            <Info size={16} /> About
          </Link>
          <Link
            href="/admin/categories"
            className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-sm hover:bg-secondary transition-colors inline-flex items-center gap-2"
          >
            <Tags size={16} /> Manage
          </Link>
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <PlusCircle size={16} /> New Story
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-background border border-border/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <div className={`p-2 rounded-md ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-serif font-bold text-foreground">
                {stat.value}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 flex items-center font-medium">
              <TrendingUp size={12} className="mr-1 text-emerald-500" /> {stat.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Main Latest Articles Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-foreground">Recent Publications</h2>
            <Link href="/admin/articles" className="text-sm text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          
          <div className="bg-background border border-border/60 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
             {recentArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                  <Newspaper size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No articles published</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Your newsroom is currently empty. Start writing your first story to see it appear on the live site.
                </p>
                <Link
                  href="/admin/articles/new"
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors inline-block"
                >
                  Write a Story
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/30 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="py-4 px-6 font-semibold">Title</th>
                      <th className="py-4 px-6 font-semibold hidden md:table-cell">Status</th>
                      <th className="py-4 px-6 font-semibold">Date</th>
                      <th className="py-4 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recentArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-secondary/20 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-medium text-foreground line-clamp-1 mb-1">
                            {article.title}
                          </div>
                          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2">
                             {/* Category and tag parsing from mock structure */}
                             {article.tags?.slice(0, 1).join(',')} 
                            {article.status === 'published' && article.featured && <span className="text-red-500">• Featured</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                           {article.status === 'published' ? (
                             <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold bg-emerald-100 text-emerald-800">
                               Published
                             </span>
                           ) : article.status === 'review' ? (
                             <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold bg-amber-100 text-amber-800">
                               In Review
                             </span>
                           ) : (
                             <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold bg-secondary/80 text-foreground">
                               Draft
                             </span>
                           )}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                          {formatAdminDate(article.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link 
                            href={`/admin/articles/${article.id}/edit`}
                            className="text-muted-foreground hover:text-primary transition-colors inline-flex p-2"
                            title="Edit Article"
                          >
                            <FileEdit size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 4. Right Sidebar / Activity Panel */}
        <div className="space-y-6">
          <div className="bg-background border border-border/60 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-foreground mb-4">Editorial Health</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-muted-foreground">Publishing Health</span>
                  <span className="font-bold text-foreground">{statsData.publishedCount > 0 ? 'Optimal' : 'Low'}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className={`h-2 rounded-full ${statsData.publishedCount > 10 ? 'bg-emerald-500 w-full' : 'bg-amber-500 w-1/2'}`}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-muted-foreground">Database Coverage</span>
                  <span className="font-bold text-foreground">{statsData.totalCategories > 0 ? '100%' : '0%'}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className={`h-2 rounded-full bg-blue-500 ${statsData.totalCategories > 0 ? 'w-full' : 'w-0'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background border border-border/60 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-foreground">Drafts & Pending</h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-sm">
                {statsData.draftCount + statsData.reviewCount} Items
              </span>
            </div>
            
            {/* Display actual pending items from mock data */}
            <div className="space-y-4">
               {statsData.pendingArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending items.</p>
               ) : (
                  <div className="flex flex-col gap-4">
                    {statsData.pendingArticles.map((article: any) => (
                      <div key={article.id} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                        <PenSquare className="mt-0.5 text-muted-foreground shrink-0" size={16} />
                        <div>
                          <p className="text-sm font-medium text-foreground leading-tight mb-1">{article.title}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-tighter font-bold">
                            {article.status === 'review' ? 'Under Review' : 'Draft'} • {formatAdminDate(article.updatedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
               )}
            </div>
            
            <button className="w-full mt-4 py-2 border border-border rounded-sm text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              View All Drafts
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
