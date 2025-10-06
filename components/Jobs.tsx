import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import { PlusIcon, SparklesIcon, XIcon, ArrowLeftIcon, SparklesLoadingIcon, PlayIcon, LockClosedIcon, LockOpenIcon } from './Icons';
import { generateJobDescription } from '../services/geminiService';
import { useTranslation } from '../i18n';

const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
    const { t } = useTranslation();
    const statusMap = {
      [JobStatus.DRAFT]: 'bg-slate-200 text-slate-800',
      [JobStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [JobStatus.CLOSED]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[status]}`}>{t(`jobStatus.${status}`)}</span>;
};

interface JobDetailProps {
    job: Job;
    onBack: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onBack }) => {
    const { t } = useTranslation();

    const DetailSection: React.FC<{ title: string; children: React.ReactNode; show?: boolean }> = ({ title, children, show = true }) => {
        if (!show) return null;
        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-3">{title}</h3>
                <div className="prose prose-sm max-w-none text-slate-600">
                    {children}
                </div>
            </div>
        );
    }
    
    const renderTextWithList = (text: string | undefined) => {
        if (!text) return null;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const isList = lines.some(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));

        if (isList) {
            return (
                <ul className="list-disc pl-5 space-y-1">
                    {lines.map((line, index) => (
                        <li key={index}>{line.replace(/[-*]\s*/, '')}</li>
                    ))}
                </ul>
            );
        }
        return lines.map((line, index) => <p key={index}>{line}</p>);
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-800">
                    <ArrowLeftIcon className="w-4 h-4" />
                    {t('jobs.backToList')}
                </button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">{job.title}</h1>
                        <p className="text-md text-slate-500 mt-1">{job.department}</p>
                    </div>
                    <StatusBadge status={job.status} />
                </div>
                
                <hr className="my-6" />

                <DetailSection title={t('jobs.detail.teamIntro')} show={!!job.teamIntro}>{renderTextWithList(job.teamIntro)}</DetailSection>
                <DetailSection title={t('jobs.detail.responsibilities')}>{renderTextWithList(job.description)}</DetailSection>
                <DetailSection title={t('jobs.detail.requirements')}>{renderTextWithList(job.requirements)}</DetailSection>
                <DetailSection title={t('jobs.detail.niceToHave')} show={!!job.niceToHave}>{renderTextWithList(job.niceToHave)}</DetailSection>
                <DetailSection title={t('jobs.detail.techStack')} show={!!job.techStack}>{renderTextWithList(job.techStack)}</DetailSection>
                <DetailSection title={t('jobs.detail.benefits')}>{renderTextWithList(job.benefits)}</DetailSection>
                <DetailSection title={t('jobs.detail.growthOpps')} show={!!job.growthOpportunities}>{renderTextWithList(job.growthOpportunities)}</DetailSection>
            </div>
        </div>
    );
};


interface JobCreationModalProps {
  onClose: () => void;
  addJob: (job: Omit<Job, 'id' | 'views' | 'createdAt'>) => void;
}

const JobCreationModal: React.FC<JobCreationModalProps> = ({ onClose, addJob }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');
    const [benefits, setBenefits] = useState('');
    const [niceToHave, setNiceToHave] = useState('');
    const [teamIntro, setTeamIntro] = useState('');
    const [techStack, setTechStack] = useState('');
    const [growthOpportunities, setGrowthOpportunities] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateDesc = async () => {
        if (!title || !department) {
            alert(t('jobs.createModal.alert'));
            return;
        }
        setIsGenerating(true);
        const result = await generateJobDescription(title, department);
        
        setDescription(result.description);
        setRequirements(result.requirements);
        setBenefits(result.benefits);
        setNiceToHave(result.niceToHave);
        setTeamIntro(result.teamIntro);
        setTechStack(result.techStack);
        setGrowthOpportunities(result.growthOpportunities);

        setIsGenerating(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addJob({
            title,
            department,
            description,
            requirements,
            benefits,
            niceToHave,
            teamIntro,
            techStack,
            growthOpportunities,
            status: JobStatus.DRAFT,
        });
        onClose();
    };
    
    const TextAreaField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number, required?: boolean}> = ({label, value, onChange, rows = 4, required = true}) => (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <textarea value={value} onChange={onChange} rows={rows} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" required={required} />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('jobs.createModal.title')}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">{t('jobs.createModal.jobTitleLabel')}</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">{t('jobs.createModal.departmentLabel')}</label>
                                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" required />
                            </div>
                        </div>
                        <div>
                            <button type="button" onClick={handleGenerateDesc} disabled={isGenerating} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400">
                                {isGenerating ? <SparklesLoadingIcon /> : <SparklesIcon />}
                                {isGenerating ? t('jobs.createModal.generatingButton') : t('jobs.createModal.generateButton')}
                            </button>
                        </div>
                        <TextAreaField label={t('jobs.createModal.teamIntroLabel')} value={teamIntro} onChange={e => setTeamIntro(e.target.value)} rows={3} required={false} />
                        <TextAreaField label={t('jobs.createModal.responsibilitiesLabel')} value={description} onChange={e => setDescription(e.target.value)} />
                        <TextAreaField label={t('jobs.createModal.requirementsLabel')} value={requirements} onChange={e => setRequirements(e.target.value)} />
                        <TextAreaField label={t('jobs.createModal.niceToHaveLabel')} value={niceToHave} onChange={e => setNiceToHave(e.target.value)} rows={3} required={false} />
                        <TextAreaField label={t('jobs.createModal.techStackLabel')} value={techStack} onChange={e => setTechStack(e.target.value)} rows={2} required={false} />
                        <TextAreaField label={t('jobs.createModal.benefitsLabel')} value={benefits} onChange={e => setBenefits(e.target.value)} rows={3} />
                        <TextAreaField label={t('jobs.createModal.growthOppsLabel')} value={growthOpportunities} onChange={e => setGrowthOpportunities(e.target.value)} rows={2} required={false} />
                    </div>
                    <div className="p-6 bg-slate-50 border-t text-right">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">{t('jobs.createModal.cancelButton')}</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">{t('jobs.createModal.saveButton')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface JobsProps {
  jobs: Job[];
  applicants: any[];
  addJob: (job: Omit<Job, 'id' | 'views' | 'createdAt'>) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  onClearSelectedJob: () => void;
}

const Jobs: React.FC<JobsProps> = ({ jobs, applicants, addJob, updateJobStatus, selectedJob, onSelectJob, onClearSelectedJob }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const baseButtonStyle = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";


  if (selectedJob) {
      return <JobDetail job={selectedJob} onBack={onClearSelectedJob} />
  }

  const getApplicantCount = (jobId: string) => applicants.filter(a => a.jobId === jobId).length;

  return (
    <div className="p-8">
      <div className="flex justify-end items-center mb-6">
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
          <PlusIcon className="w-5 h-5" />
          {t('jobs.newJob')}
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('jobs.jobTitle')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('jobs.status')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('jobs.applicants')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('jobs.postedDate')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('jobs.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => onSelectJob(job)} className="text-sm font-medium text-sky-600 hover:text-sky-800 hover:underline text-left focus:outline-none">
                    {job.title}
                  </button>
                  <div className="text-sm text-slate-500">{job.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={job.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getApplicantCount(job.id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                   {job.status === JobStatus.DRAFT && (
                      <button onClick={() => updateJobStatus(job.id, JobStatus.PUBLISHED)} className={`${baseButtonStyle} bg-sky-100 text-sky-700 hover:bg-sky-200 focus:ring-sky-500`}>
                          <PlayIcon className="w-4 h-4" />
                          {t('jobs.publish')}
                      </button>
                   )}
                   {job.status === JobStatus.PUBLISHED && (
                      <button onClick={() => updateJobStatus(job.id, JobStatus.CLOSED)} className={`${baseButtonStyle} bg-amber-100 text-amber-700 hover:bg-amber-200 focus:ring-amber-500`}>
                          <LockClosedIcon className="w-4 h-4" />
                          {t('jobs.close')}
                      </button>
                   )}
                   {job.status === JobStatus.CLOSED && (
                      <button onClick={() => updateJobStatus(job.id, JobStatus.PUBLISHED)} className={`${baseButtonStyle} bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500`}>
                          <LockOpenIcon className="w-4 h-4" />
                          {t('jobs.reopen')}
                      </button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <JobCreationModal onClose={() => setIsModalOpen(false)} addJob={addJob} />}
    </div>
  );
};

export default Jobs;