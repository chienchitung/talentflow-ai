import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell, LineChart, Line } from 'recharts';
import { Applicant, Job, ApplicantSource, RecruitmentStage } from '../types';
import { JobStatus } from '../types';
import { useTranslation } from '../i18n';

interface DashboardProps {
  applicants: Applicant[];
  jobs: Job[];
}

const KpiCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{description}</p>
  </div>
);

const FUNNEL_COLORS = ['#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

const CustomFunnelTooltip = ({ active, payload }: any) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isFirstStage = data.originalName === RecruitmentStage.NEW_APPLICATION;
        return (
            <div className="bg-white p-3 rounded-md shadow-lg border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">{data.name}</p>
                <p className="text-sm text-slate-600">{`${t('dashboard.applicantCount')}: ${data.value}`}</p>
                {!isFirstStage && (
                    <p className="text-sm text-slate-600">{`${t('dashboard.conversionRate')}: ${data.conversion}%`}</p>
                )}
            </div>
        );
    }
    return null;
};


const Dashboard: React.FC<DashboardProps> = ({ applicants, jobs }) => {
  const { t, language } = useTranslation();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [sourceFilter, setSourceFilter] = useState<ApplicantSource | 'all'>('all');
  const [timeUnit, setTimeUnit] = useState<'daily' | 'monthly' | 'yearly'>('daily');


  const activeJobs = useMemo(() => jobs.filter(j => j.status === JobStatus.PUBLISHED).length, [jobs]);
  const totalApplicants = useMemo(() => applicants.length, [applicants]);
  
  const avgRecruitmentCycle = useMemo(() => {
    const cycleTimes = jobs.map(j => (j.title.length * 3) % 25 + 10);
    if (cycleTimes.length === 0) return 0;
    const totalDays = cycleTimes.reduce((acc, curr) => acc + curr, 0);
    return (totalDays / cycleTimes.length).toFixed(1);
  }, [jobs]);

  const applicantSourceData = useMemo(() => {
    const sourceCounts = applicants.reduce((acc, applicant) => {
      acc[applicant.source] = (acc[applicant.source] || 0) + 1;
      return acc;
    }, {} as Record<ApplicantSource, number>);

    return Object.entries(sourceCounts).map(([name, value]) => ({ 
        name: t(`applicantSource.${name}`), 
        [t('dashboard.applicantCount')]: value 
    }));
  }, [applicants, t]);

  const { offerAcceptanceRate, funnelData } = useMemo(() => {
    const hiredCount = applicants.filter(a => a.stage === RecruitmentStage.HIRED).length;
    const offerCount = applicants.filter(a => a.stage === RecruitmentStage.OFFER).length;
    const totalWithOffers = hiredCount + offerCount;
    const rate = totalWithOffers > 0 ? `${((hiredCount / totalWithOffers) * 100).toFixed(1)}%` : 'N/A';

    const stageOrder = [
        RecruitmentStage.NEW_APPLICATION,
        RecruitmentStage.SCREENING,
        RecruitmentStage.INTERVIEW,
        RecruitmentStage.OFFER,
        RecruitmentStage.HIRED,
    ];

    const stageCounts = applicants.reduce((acc, applicant) => {
        acc[applicant.stage] = (acc[applicant.stage] || 0) + 1;
        return acc;
    }, {} as Record<RecruitmentStage, number>);
    
    const data = stageOrder.map((stage, index) => {
        const count = stageCounts[stage] || 0;
        let conversion = 100;
        if (index > 0) {
            const prevStageName = stageOrder[index-1];
            const prevCount = stageCounts[prevStageName] || 0;
            conversion = prevCount > 0 ? (count / prevCount) * 100 : 0;
        }
        return { 
            name: t(`recruitmentStage.${stage}`),
            originalName: stage,
            value: count,
            conversion: conversion.toFixed(1)
        };
    });

    return { offerAcceptanceRate: rate, funnelData: data };
  }, [applicants, t]);

  const trendData = useMemo(() => {
    const sourceFilteredApplicants = applicants.filter(a => sourceFilter === 'all' || a.source === sourceFilter);

    if (sourceFilteredApplicants.length === 0) return [];
    
    const now = new Date();
    
    // Determine the end date for the chart range. It should be the later of today or the latest application date.
    const latestApplicationTimestamp = Math.max(...sourceFilteredApplicants.map(a => new Date(a.applicationDate).getTime()));
    const latestDate = new Date(latestApplicationTimestamp);
    const endDate = now > latestDate ? now : latestDate;
    endDate.setHours(23, 59, 59, 999);

    let startDate: Date;
    if (dateRange !== 'all') {
        // For relative date ranges, calculate from the endDate.
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - (parseInt(dateRange, 10) - 1));
        startDate.setHours(0, 0, 0, 0);
    } else {
        const firstApplicationTimestamp = Math.min(...sourceFilteredApplicants.map(a => new Date(a.applicationDate).getTime()));
        startDate = new Date(firstApplicationTimestamp);
        startDate.setHours(0, 0, 0, 0);
    }
    
    const relevantApplicants = sourceFilteredApplicants.filter(a => {
        const appDate = new Date(a.applicationDate);
        // Ensure date is within the calculated start and end range.
        return appDate >= startDate && appDate <= endDate;
    });
    
    if (timeUnit === 'daily') {
        const submissionsByDate = relevantApplicants.reduce((acc, applicant) => {
            const dateStr = new Date(applicant.applicationDate).toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const data = [];
        let currentDate = new Date(startDate);
        // Loop from the calculated start date to the calculated end date.
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            data.push({ date: dateStr, [t('dashboard.submissions')]: submissionsByDate[dateStr] || 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }

    if (timeUnit === 'monthly') {
        const submissionsByMonth = relevantApplicants.reduce((acc, applicant) => {
            const monthStr = new Date(applicant.applicationDate).toISOString().substring(0, 7); // YYYY-MM
            acc[monthStr] = (acc[monthStr] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const data = [];
        let currentYear = startDate.getFullYear();
        let currentMonth = startDate.getMonth(); // 0-11
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();

        while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
            const monthStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
            data.push({ date: monthStr, [t('dashboard.submissions')]: submissionsByMonth[monthStr] || 0 });
            
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        return data;
    }
    
    if (timeUnit === 'yearly') {
        const submissionsByYear = relevantApplicants.reduce((acc, applicant) => {
            const yearStr = new Date(applicant.applicationDate).getFullYear().toString();
            acc[yearStr] = (acc[yearStr] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const data = [];
        let currentYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        // Loop from the calculated start year to the calculated end year.
        while (currentYear <= endYear) {
            const yearStr = currentYear.toString();
            data.push({ date: yearStr, [t('dashboard.submissions')]: submissionsByYear[yearStr] || 0 });
            currentYear++;
        }
        return data;
    }
    
    return [];

  }, [applicants, dateRange, sourceFilter, timeUnit, t]);

  const renderCustomizedLabel = (props: any) => {
      const { x, y, width, height, index } = props;
      if (index === undefined || !funnelData[index]) {
          return null;
      }
      const { name, value } = funnelData[index];
      if (width < 120 || value === 0) {
          return null;
      }
      return (
          <text x={x + width / 2} y={y + height / 2 + 5} fill="#fff" textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium pointer-events-none">
              {`${name} (${value})`}
          </text>
      );
  };
  
  const formatTick = (tick: string) => {
      const locale = language === 'zh' ? 'zh-CN' : 'en-US';
      if (timeUnit === 'yearly') {
          return tick;
      }
      if (timeUnit === 'monthly') {
          const [year, month] = tick.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return date.toLocaleDateString(locale, { year: 'numeric', month: 'short' });
      }
      // daily
      return new Date(tick).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };


  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t('dashboard.activeJobs')} value={activeJobs} description={t('dashboard.activeJobsDesc')} />
        <KpiCard title={t('dashboard.totalApplicants')} value={totalApplicants} description={t('dashboard.totalApplicantsDesc')} />
        <KpiCard title={t('dashboard.avgCycle')} value={avgRecruitmentCycle} description={t('dashboard.avgCycleDesc')} />
        <KpiCard title={t('dashboard.acceptanceRate')} value={offerAcceptanceRate} description={t('dashboard.acceptanceRateDesc')} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">{t('dashboard.sourceAnalysis')}</h2>
          {applicantSourceData.length > 0 ? (
             <div style={{ width: '100%', height: 300 }}>
               <ResponsiveContainer>
                  <BarChart data={applicantSourceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-md !shadow-lg" />
                    <Legend />
                    <Bar dataKey={t('dashboard.applicantCount')} fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              {t('dashboard.noApplicantData')}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">{t('dashboard.funnelAnalysis')}</h2>
          {funnelData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <FunnelChart>
                  <Tooltip content={<CustomFunnelTooltip />} />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                    lastShapeType="triangle"
                    nameKey="name"
                  >
                    <LabelList content={renderCustomizedLabel} />
                    {
                      funnelData.map((entry, index) => <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} stroke="#FFFFFF" strokeWidth={2}/>)
                    }
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              {t('dashboard.noApplicantData')}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h2 className="text-lg font-semibold text-slate-700">{t('dashboard.applicantTrend')}</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                 {(['daily', 'monthly', 'yearly'] as const).map((unit) => (
                  <button key={unit} onClick={() => setTimeUnit(unit)} className={`px-3 py-1 text-xs font-medium rounded transition-colors ${timeUnit === unit ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                    {t(`dashboard.${unit}`)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                {(['7', '30', '90', 'all'] as const).map((range) => (
                  <button key={range} onClick={() => setDateRange(range)} className={`px-3 py-1 text-xs font-medium rounded transition-colors ${dateRange === range ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                    {t(`dashboard.${range === 'all' ? 'allTime' : `last${range}Days`}`)}
                  </button>
                ))}
              </div>
              <div>
                <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)} className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 py-1.5">
                  <option value="all">{t('dashboard.allSources')}</option>
                  {Object.values(ApplicantSource).map(source => (
                    <option key={source} value={source}>{t(`applicantSource.${source}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {trendData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={formatTick} />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-md !shadow-lg" />
                  <Legend />
                  <Line type="monotone" dataKey={t('dashboard.submissions')} stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              {t('dashboard.noApplicantData')}
            </div>
          )}
        </div>

    </div>
  );
};

export default Dashboard;