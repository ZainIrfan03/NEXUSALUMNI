import { Briefcase, TrendingUp, Users } from "lucide-react";
import DashboardStatCard from "../../../../components/common/DashboardStatCard";

export default function JobStats({ stats }) {
  return (
    <div className="grid sm:grid-cols-3 gap-5 mb-8">
      <DashboardStatCard
        variant="jobs"
        icon={Briefcase}
        note={stats.newThisWeek ? `+${stats.newThisWeek} this week` : null}
        value={stats.totalPostings}
        label="Total Postings"
      />
      <DashboardStatCard
        variant="jobs"
        icon={Users}
        note={stats.unreadApplicants ? `${stats.unreadApplicants} unread` : null}
        value={stats.totalApplicants}
        label="Total Applicants"
      />
      <DashboardStatCard
        variant="jobs"
        icon={TrendingUp}
        value={`${stats.fillRate}%`}
        label="Fill Rate"
      />
    </div>
  );
}
