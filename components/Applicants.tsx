import React, { useState } from 'react';
import { Applicant, Feedback, Job, RecruitmentStage, Interviewer } from '../types';
import { DocumentTextIcon, XIcon, CalendarIcon } from './Icons';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import { useTranslation } from '../i18n';

// Applicant Detail Modal
interface ApplicantDetailModalProps {
    applicant: Applicant;
    job: Job | undefined;
    onClose: () => void;
    addFeedback: (applicantId: string, feedback: Omit<Feedback, 'id'>) => void;
    interviewers: Interviewer[];
}

const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({ applicant, job, onClose, addFeedback, interviewers }) => {
    const { t } = useTranslation();
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(3);
    const [author, setAuthor] = useState(interviewers.length > 0 ? interviewers[0].name : '');

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!comment.trim() || !author) return;
        addFeedback(applicant.id, { author, comment, rating });
        setComment('');
        setRating(3);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                 <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{applicant.name} - <span className="text-base font-normal text-slate-600">{job?.title}</span></h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </div>
                <div className="flex-grow flex overflow-hidden">
                    {/* Left panel */}
                    <div className="w-1/3 border-r p-6 space-y-4 overflow-y-auto">
                        <h3 className="font-semibold text-lg">{applicant.name}</h3>
                        <p className="text-sm text-slate-500">{applicant.email}</p>
                        <p className="text-sm text-slate-500">{applicant.phone}</p>
                        <hr/>
                        <p className="text-sm"><span className="font-medium">{t('applicants.detailModal.job')}:</span> {job?.title}</p>
                        <p className="text-sm"><span className="font-medium">{t('applicants.detailModal.date')}:</span> {new Date(applicant.applicationDate).toLocaleDateString()}</p>
                        <p className="text-sm"><span className="font-medium">{t('applicants.detailModal.source')}:</span> {t(`applicantSource.${applicant.source}`)}</p>
                         {applicant.interviewTime && (
                            <div className="bg-sky-50 p-3 rounded-md border border-sky-200">
                                <p className="text-sm font-semibold text-sky-800">{t('applicants.detailModal.interviewScheduled')}</p>
                                <p className="text-xs text-sky-700">{new Date(applicant.interviewTime).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                                <p className="text-xs text-sky-700 mt-1">{t('applicants.detailModal.interviewers')}: {applicant.interviewers?.map(i => i.name).join(', ')}</p>
                            </div>
                        )}
                        <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700">
                           <DocumentTextIcon/> {t('applicants.detailModal.viewResume')}
                        </a>
                    </div>
                    {/* Right panel */}
                    <div className="w-2/3 p-6 flex flex-col overflow-y-auto">
                        <h3 className="font-semibold text-lg mb-4">{t('applicants.detailModal.collaboration.title')}</h3>
                        <div className="flex-grow space-y-4">
                           {applicant.feedback.length === 0 && <p className="text-sm text-slate-400">{t('applicants.detailModal.collaboration.noFeedback')}</p>}
                           {applicant.feedback.map(f => (
                                <div key={f.id} className="bg-slate-50 p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm">{f.author}</p>
                                        <div className="flex items-center text-sm">
                                            {'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}
                                        </div>
                                    </div>
                                    <p className="text-sm mt-1 text-slate-700">{f.comment}</p>
                                </div>
                           ))}
                        </div>
                        <form onSubmit={handleFeedbackSubmit} className="mt-4 pt-4 border-t">
                             <h4 className="font-medium mb-2">{t('applicants.detailModal.collaboration.addFeedbackTitle')}</h4>
                             <div className="flex items-center gap-4 mb-2">
                                <select value={author} onChange={(e) => setAuthor(e.target.value)} className="border-slate-300 rounded-md shadow-sm text-sm">
                                    {interviewers.map(interviewer => (
                                        <option key={interviewer.id} value={interviewer.name}>{interviewer.name}</option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-1">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-slate-300'}`}>★</button>
                                    ))}
                                </div>
                             </div>
                             <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder={t('applicants.detailModal.collaboration.feedbackPlaceholder')} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
                             <button type="submit" className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 float-right">{t('applicants.detailModal.collaboration.submitButton')}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Applicant Card
const ApplicantCard: React.FC<{
  applicant: Applicant;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, applicantId: string) => void;
  onCardClick: () => void;
  onScheduleClick: () => void;
}> = ({ applicant, onDragStart, onCardClick, onScheduleClick }) => {
  const { t } = useTranslation();
  
  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onCardClick from firing
    onScheduleClick();
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, applicant.id)}
      onClick={onCardClick}
      className="bg-white p-3 rounded-md shadow-sm border border-slate-200 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-sky-300 transition-all"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-slate-600">{applicant.name.charAt(0)}</span>
            </div>
            <div className="flex-1 truncate">
                <p className="font-semibold text-sm text-slate-800 truncate">{applicant.name}</p>
                <p className="text-xs text-slate-500 truncate">{applicant.email}</p>
            </div>
        </div>

        {applicant.stage === RecruitmentStage.INTERVIEW && !applicant.interviewTime && (
          <button onClick={handleScheduleClick} title={t('applicants.scheduleInterview')} className="flex-shrink-0 text-sky-600 hover:text-sky-800 p-1 rounded-full hover:bg-sky-100 transition-colors">
            <CalendarIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {applicant.interviewTime && (
        <div className="mt-2 text-xs text-slate-600 bg-slate-100 p-1.5 rounded flex items-center gap-1.5">
          <CalendarIcon className="w-3 h-3 text-slate-500 flex-shrink-0"/>
          <span className="truncate">{new Date(applicant.interviewTime).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</span>
        </div>
      )}
    </div>
  );
};

// Kanban Column
const KanbanColumn: React.FC<{ 
    stage: RecruitmentStage; 
    applicants: Applicant[]; 
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void; 
    onDrop: (e: React.DragEvent<HTMLDivElement>, stage: RecruitmentStage) => void; 
    onCardClick: (applicant: Applicant) => void; 
    onScheduleClick: (applicant: Applicant) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, applicantId: string) => void; 
}> = ({ stage, applicants, onDragOver, onDrop, onCardClick, onScheduleClick, onDragStart }) => {
  const { t } = useTranslation();
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
      className="bg-slate-100 rounded-lg p-3 w-72 flex-shrink-0 flex flex-col"
    >
      <h3 className="font-semibold text-md text-slate-700 mb-3 px-1">{t(`recruitmentStage.${stage}`)} ({applicants.length})</h3>
      <div className="space-y-3">
        {applicants.map(applicant => (
          <ApplicantCard 
            key={applicant.id} 
            applicant={applicant} 
            onDragStart={onDragStart} 
            onCardClick={() => onCardClick(applicant)}
            onScheduleClick={() => onScheduleClick(applicant)}
          />
        ))}
      </div>
    </div>
  );
};

// Main Applicants Component
interface ApplicantsProps {
  applicants: Applicant[];
  jobs: Job[];
  updateApplicantStage: (applicantId: string, newStage: RecruitmentStage) => void;
  addFeedback: (applicantId: string, feedback: Omit<Feedback, 'id'>) => void;
  interviewers: Interviewer[];
  scheduleInterview: (applicantId: string, time: string, interviewers: Interviewer[]) => void;
  selectedJobId: string;
}

const Applicants: React.FC<ApplicantsProps> = ({ applicants, jobs, updateApplicantStage, addFeedback, interviewers, scheduleInterview, selectedJobId }) => {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [schedulingApplicant, setSchedulingApplicant] = useState<Applicant | null>(null);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, applicantId: string) => {
    e.dataTransfer.setData('applicantId', applicantId);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStage: RecruitmentStage) => {
    const applicantId = e.dataTransfer.getData('applicantId');
    updateApplicantStage(applicantId, newStage);
  };

  const filteredApplicants = selectedJobId === 'all'
    ? applicants
    : applicants.filter(a => a.jobId === selectedJobId);

  const stages = Object.values(RecruitmentStage);
  
  return (
    <div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-4 items-start">
          {stages.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              applicants={filteredApplicants.filter(a => a.stage === stage)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onCardClick={(applicant) => setSelectedApplicant(applicant)}
              onScheduleClick={(applicant) => setSchedulingApplicant(applicant)}
            />
          ))}
        </div>
      </div>
      {selectedApplicant && (
        <ApplicantDetailModal 
            applicant={selectedApplicant}
            job={jobs.find(j => j.id === selectedApplicant.jobId)}
            onClose={() => setSelectedApplicant(null)}
            addFeedback={addFeedback}
            interviewers={interviewers}
        />
      )}
      {schedulingApplicant && (
          <ScheduleInterviewModal
            applicant={schedulingApplicant}
            allInterviewers={interviewers}
            onClose={() => setSchedulingApplicant(null)}
            onSchedule={(time, selectedInterviewers) => {
                scheduleInterview(schedulingApplicant.id, time, selectedInterviewers);
                setSchedulingApplicant(null);
            }}
          />
      )}
    </div>
  );
};

export default Applicants;