import React from 'react';
import { LogoIcon } from './Icons';

const ApplicantPortal: React.FC = () => {
  // This is a placeholder for a future feature.
  // It demonstrates the concept of a portal where applicants can track their status.

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <LogoIcon />
            <h1 className="mt-4 text-2xl font-bold text-slate-800">應徵者入口</h1>
            <p className="mt-1 text-sm text-slate-500">查看您的申請狀態</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input type="email" id="email" required className="w-full px-3 py-2 border rounded-md" placeholder="您的 Email" defaultValue="ming@example.com" />
            </div>
            <div>
              <label htmlFor="access-code" className="sr-only">Access Code</label>
              <input type="text" id="access-code" required className="w-full px-3 py-2 border rounded-md" placeholder="您的存取碼" defaultValue="123456" />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-sky-600 text-white rounded-md hover:bg-sky-700">登入</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <LogoIcon />
            <button className="text-sm text-slate-600 hover:underline">登出</button>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Hi, 王小明</h1>
        <p className="text-slate-500 mt-1">這是您在 TalentFlow AI 的申請狀態。</p>

        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">您的申請：前端 React 工程師</h2>
            <ol className="relative border-l border-slate-200">
                <li className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-green-200 rounded-full -left-3 ring-8 ring-white">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-semibold text-slate-900">申請已提交 <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">完成</span></h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-slate-400">2025年10月10日</time>
                </li>
                 <li className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-sky-200 rounded-full -left-3 ring-8 ring-white">
                        <svg className="w-3 h-3 text-sky-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                    </span>
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">HR 篩選中</h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-slate-400">2025年10月11日</time>
                    <p className="text-base font-normal text-slate-500">我們的招募團隊正在審閱您的履歷，請耐心等候。</p>
                </li>
                <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full -left-3 ring-8 ring-white">
                         <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.028.658a.78.78 0 01-.357.542zM10 11a4 4 0 100-8 4 4 0 000 8zM12 10a2 2 0 114 0 2 2 0 01-4 0zM18.51 15.326a.78.78 0 01-.358-.442 3 3 0 01-4.308-3.516 6.484 6.484 0 001.905 3.959c.023.222.014.442-.028.658a.78.78 0 01.357.542z"></path></svg>
                    </span>
                    <h3 className="mb-1 text-lg font-semibold text-slate-400">面試</h3>
                </li>
            </ol>
        </div>
    </div>
  );
};

export default ApplicantPortal;