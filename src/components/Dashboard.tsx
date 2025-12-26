import React from 'react';
import { 
  FileText, 
  AlertCircle, 
  Users, 
  Clock, 
  Calendar,
  Activity,
  CheckCircle2
} from 'lucide-react';
import '../styles/index.css';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'teal' | 'orange' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorMap = {
    blue: { bg: 'rgba(0, 102, 204, 0.1)', text: 'var(--clinical-blue)' },
    teal: { bg: 'rgba(0, 137, 123, 0.1)', text: 'var(--clinical-teal)' },
    orange: { bg: 'rgba(255, 107, 53, 0.1)', text: 'var(--alert-orange)' },
    green: { bg: 'rgba(76, 175, 80, 0.1)', text: 'var(--status-success)' },
  };

  return (
    <div className="dashboard-card" style={{ 
      background: 'var(--bg-card)',
      padding: '20px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>{title}</span>
        <div style={{ 
          padding: '8px', 
          borderRadius: '8px', 
          background: colorMap[color].bg,
          color: colorMap[color].text 
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{subtitle}</div>
    </div>
  );
};

const QuickAction: React.FC<{ label: string; icon: React.ReactNode; onClick?: () => void }> = ({ label, icon, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '20px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: 'var(--text-secondary)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--clinical-blue)';
      e.currentTarget.style.background = 'var(--bg-hover)';
      e.currentTarget.style.color = 'var(--clinical-blue)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border-color)';
      e.currentTarget.style.background = 'var(--bg-card)';
      e.currentTarget.style.color = 'var(--text-secondary)';
    }}
  >
    <div style={{ transform: 'scale(1.2)' }}>{icon}</div>
    <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
  </button>
);

const ActivityItem: React.FC<{ title: string; time: string; type: 'report' | 'alert' | 'note' }> = ({ title, time, type }) => {
  const iconMap = {
    report: <FileText size={16} />,
    alert: <AlertCircle size={16} />,
    note: <CheckCircle2 size={16} />
  };
  
  const colorMap = {
    report: 'var(--clinical-blue)',
    alert: 'var(--alert-orange)',
    note: 'var(--clinical-teal)'
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '12px 0',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{ 
        color: colorMap[type],
        background: `rgba(0,0,0,0.03)`,
        padding: '8px',
        borderRadius: '50%'
      }}>
        {iconMap[type]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{time}</div>
      </div>
    </div>
  );
};

interface DashboardProps {
  onCreateNote: (type: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateNote }) => {
  return (
    <div className="dashboard-container" style={{ 
      padding: '32px', 
      height: '100%', 
      overflowY: 'auto',
      background: 'var(--bg-sidebar)' 
    }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Nurse Station Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Welcome back, Nurse Manager. Here's your shift overview.
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <StatCard 
          title="Pending Tasks" 
          value="12" 
          subtitle="4 high priority items" 
          icon={<Clock size={24} />} 
          color="orange"
        />
        <StatCard 
          title="Active Staff" 
          value="28" 
          subtitle="Full shift coverage" 
          icon={<Users size={24} />} 
          color="blue"
        />
        <StatCard 
          title="Today's Reports" 
          value="8" 
          subtitle="All systems normal" 
          icon={<FileText size={24} />} 
          color="teal"
        />
        <StatCard 
          title="Patient Alerts" 
          value="2" 
          subtitle="Requires attention" 
          icon={<Activity size={24} />} 
          color="green"
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Quick Actions & Recent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Quick Actions
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
              gap: '16px' 
            }}>
              <QuickAction 
                label="New Shift Report" 
                icon={<FileText size={24} />} 
                onClick={() => onCreateNote('Shift Report')}
              />
              <QuickAction 
                label="Incident Report" 
                icon={<AlertCircle size={24} />} 
                onClick={() => onCreateNote('Incident Report')}
              />
              <QuickAction 
                label="Staff Note" 
                icon={<Users size={24} />} 
                onClick={() => onCreateNote('Staff Note')}
              />
              <QuickAction 
                label="Schedule Update" 
                icon={<Calendar size={24} />} 
                onClick={() => onCreateNote('Schedule')}
              />
            </div>
          </section>

          <section style={{ 
            background: 'var(--bg-card)', 
            padding: '24px', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
             <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <ActivityItem title="Shift Report - Morning A" time="10 mins ago" type="report" />
              <ActivityItem title="Medication Incident #402" time="1 hour ago" type="alert" />
              <ActivityItem title="Staff Meeting Notes" time="3 hours ago" type="note" />
              <ActivityItem title="Weekly Supply Check" time="Yesterday" type="report" />
              <ActivityItem title="Patient Transfer Record" time="Yesterday" type="note" />
            </div>
          </section>
        </div>

        {/* Side Panel Info (e.g. Notices) */}
        <div style={{ 
          background: 'var(--clinical-blue)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Shift Notice</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9, marginBottom: '20px' }}>
            Please ensure all staff have completed the mandatory compliance training by end of week.
            <br/><br/>
            Dr. Smith will be visiting Ward 3 at 14:00 today.
          </p>
          <button style={{ 
            background: 'white', 
            color: 'var(--clinical-blue)', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            fontWeight: 600, 
            fontSize: '13px',
            cursor: 'pointer'
          }}>
            View All Notices
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
