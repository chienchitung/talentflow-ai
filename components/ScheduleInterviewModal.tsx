import React, { useState, useEffect } from 'react';
import { Applicant, Interviewer } from '../types';
import { XIcon, CalendarIcon, LoadingCalendarIcon } from './Icons';
import { findAvailableSlots } from '../services/calendarService';
import { useTranslation } from '../i18n';

interface ScheduleInterviewModalProps {
  applicant: Applicant;
  allInterviewers: Interviewer[];
  onClose: () => void;
  onSchedule: (time: string, interviewers: Interviewer[]) => void;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ applicant, allInterviewers, onClose, onSchedule }) => {
    const { t, language } = useTranslation();
    const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSlots = async () => {
            if (selectedInterviewerIds.length > 0) {
                setIsLoading(true);
                const selected = allInterviewers.filter(i => selectedInterviewerIds.includes(i.id));
                const slots = await findAvailableSlots(selected);
                setAvailableSlots(slots);
                setIsLoading(false);
                setSelectedSlot(null);
            } else {
                setAvailableSlots([]);
            }
        };
        fetchSlots();
    }, [selectedInterviewerIds, allInterviewers]);

    const handleInterviewerToggle = (id: string) => {
        setSelectedInterviewerIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (selectedSlot) {
            const selected = allInterviewers.filter(i => selectedInterviewerIds.includes(i.id));
            onSchedule(selectedSlot, selected);
        }
    };
    
    const formatDate = (isoString: string) => {
        // FIX: The `toLocaleString` method was reported to cause an error.
        // Replaced with `Intl.DateTimeFormat` for better compatibility and to respect the user's selected language.
        const locale = language === 'zh' ? 'zh-TW' : 'en-US';
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return new Intl.DateTimeFormat(locale, options).format(new Date(isoString));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon />
                        {t('scheduleModal.title', { applicantName: applicant.name })}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XIcon /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">{t('scheduleModal.step1')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {allInterviewers.map(interviewer => (
                                <label key={interviewer.id} className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors ${selectedInterviewerIds.includes(interviewer.id) ? 'bg-sky-50 border-sky-400' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedInterviewerIds.includes(interviewer.id)}
                                        onChange={() => handleInterviewerToggle(interviewer.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{interviewer.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">{t('scheduleModal.step2')}</h3>
                        <div className="border rounded-md p-3 h-64 overflow-y-auto bg-slate-50">
                            {isLoading && (
                                <div className="flex flex-col justify-center items-center h-full">
                                    <LoadingCalendarIcon className="w-10 h-10 text-sky-600" />
                                    <p className="mt-2 text-slate-500">{t('scheduleModal.loadingSlots')}</p>
                                </div>
                            )}
                            {!isLoading && availableSlots.length > 0 && (
                                <div className="space-y-2">
                                    {availableSlots.map(slot => (
                                        <label key={slot} className={`block p-3 rounded-md cursor-pointer transition-colors ${selectedSlot === slot ? 'bg-sky-100 border border-sky-500' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}>
                                            <input
                                                type="radio"
                                                name="time-slot"
                                                value={slot}
                                                checked={selectedSlot === slot}
                                                onChange={() => setSelectedSlot(slot)}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-medium text-slate-700">{formatDate(slot)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {!isLoading && availableSlots.length === 0 && selectedInterviewerIds.length > 0 && (
                                <div className="flex justify-center items-center h-full text-center p-4">
                                    <p className="text-slate-500">{t('scheduleModal.noSlotsFound')}</p>
                                </div>
                            )}
                            {!isLoading && selectedInterviewerIds.length === 0 && (
                                <div className="flex justify-center items-center h-full">
                                    <p className="text-slate-500">{t('scheduleModal.selectFirst')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t text-right">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">{t('scheduleModal.cancelButton')}</button>
                    <button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={!selectedSlot}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {t('scheduleModal.confirmButton')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleInterviewModal;