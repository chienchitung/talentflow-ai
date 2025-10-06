import React, { useState, useCallback, useMemo } from 'react';
import { Applicant, Job, RecruitmentStage, ApplicantSource, JobStatus, Feedback, Interviewer } from './types';
import Dashboard from './components/Dashboard';
import Jobs from './components/Jobs';
import Applicants from './components/Applicants';
import Login from './components/Login';
import { LogOutIcon, LogoIcon, ChartBarIcon, BriefcaseIcon, UsersIcon, ChevronDoubleLeftIcon, GlobeIcon, SparklesIcon } from './components/Icons';
import { LanguageProvider, useTranslation } from './i18n';
import Chatbot from './components/Chatbot';

// MOCK DATA
const initialJobs: Job[] = [
    { 
        id: 'job1', 
        title: '前端 React 工程師', 
        department: '技術部', 
        description: '- 使用 React、TypeScript 開發與維護公司產品的前端介面。\n- 與 UI/UX 設計師及後端工程師緊密協作，打造一流的使用者體驗。\n- 持續優化現有應用的性能、可維護性與使用者體驗。\n- 參與 Code Review，確保團隊程式碼品質。', 
        requirements: '- 兩年以上前端開發經驗，精通 React 與 TypeScript。\n- 熟悉現代前端生態系，如 Redux/MobX、Webpack、Jest。\n- 具備串接 RESTful API 的豐富經驗。\n- 對前端性能優化有深入了解。', 
        benefits: '- 彈性上下班時間，無需打卡。\n- 年度全薪病假 12 天。\n- 年度旅遊補助及健康檢查。\n- 提供全新 MacBook Pro 與 27吋 4K 螢幕。', 
        status: JobStatus.PUBLISHED, 
        views: 120, 
        createdAt: '2025-10-01T10:00:00Z',
        niceToHave: '- 具備 Next.js 或其他 SSR 框架經驗。\n- 熟悉 GraphQL。\n- 有處理大型、高流量網站的經驗。',
        teamIntro: '我們是一個充滿活力、熱愛技術的團隊。團隊氛圍開放，鼓勵成員分享新知、互相學習。我們相信好的產品來自於緊密的團隊合作與對技術的熱情。',
        techStack: '- 前端: React, TypeScript, Next.js, Tailwind CSS\n- 測試: Jest, React Testing Library\n- CI/CD: GitHub Actions',
        growthOpportunities: '我們提供豐富的線上學習資源與線下技術分享會，並鼓勵同仁參與國內外技術研討會。您將有機會接觸到最新的前端技術，並在專案中實際應用。'
    },
    { 
        id: 'job2', 
        title: '產品經理', 
        department: '產品部', 
        description: '- 負責產品路線圖規劃與迭代。\n- 撰寫產品需求文件 (PRD) 與使用者故事。\n- 跨部門溝通協調，確保專案順利進行。', 
        requirements: '- 3年以上產品經理經驗，熟悉敏捷開發流程。\n- 具備出色的 logique 分析與溝通能力。\n- 對市場與使用者有高度敏感度。', 
        benefits: '- 績效獎金、股票選擇權。\n- 參與國內外產品經理社群活動補助。\n- 每季產品創新獎金。', 
        status: JobStatus.PUBLISHED, 
        views: 250, 
        createdAt: '2025-10-05T10:00:00Z',
        niceToHave: '- 具備數據分析能力，能從數據中發現問題。\n- 熟悉使用者研究方法。\n- 有 B2B 產品經驗。',
        teamIntro: '產品部門是公司的核心驅動力，我們緊密合作，充滿熱情，致力於打造用戶喜愛的產品。',
        techStack: '- 專案管理: Jira, Confluence\n- 數據分析: Google Analytics, Mixpanel\n- 原型設計: Figma',
        growthOpportunities: '您將有機會主導重要產品線的發展，並與跨國團隊合作，積累國際化的產品管理經驗。'
    },
    { 
        id: 'job4', 
        title: '數位行銷專員', 
        department: '行銷部', 
        description: '- 負責規劃與執行數位行銷活動，提升品牌知名度。\n- 管理與優化社群媒體內容。\n- 分析行銷活動成效並提出改善方案。', 
        requirements: '- 熟悉社群媒體操作、SEO/SEM、Google Analytics。\n- 具備內容行銷與文案撰寫能力。\n- 兩年以上數位行銷相關經驗。', 
        benefits: '- 行銷績效獎金、學習補助。\n- 彈性的工作地點選擇。\n- 團隊定期舉辦創意工作坊。', 
        status: JobStatus.PUBLISHED, 
        views: 180, 
        createdAt: '2025-10-20T10:00:00Z',
        niceToHave: '- 具備影音內容企劃與製作能力。\n- 熟悉 CRM 工具操作。\n- 有電商行銷經驗。',
        teamIntro: '行銷團隊是一個充滿創意與活力的團隊，我們鼓勵大膽嘗試，用數據驅動決策，打造有影響力的品牌活動。',
        techStack: '- 分析工具: Google Analytics, SEMrush\n- 廣告平台: Google Ads, Meta Ads\n- 社群管理: Hootsuite',
        growthOpportunities: '您將負責多元的行銷專案，並有機會成長為全方位的數位行銷專家。公司提供充足的學習資源與預算支持。'
    },
    { 
        id: 'job5', 
        title: '後端 Java 工程師', 
        department: '技術部', 
        description: '- 負責開發與維護後端服務與 API。\n- 設計與優化資料庫結構。\n- 確保系統的穩定性與效能。', 
        requirements: '- 精通 Java, Spring Boot。\n- 熟悉 SQL/NoSQL 資料庫，如 PostgreSQL, Redis。\n- 具備 RESTful API 設計與開發經驗。', 
        benefits: '- 年度技術研討會補助。\n- 提供遠端工作選項。\n- 技術書籍採購補助。', 
        status: JobStatus.PUBLISHED, 
        views: 210, 
        createdAt: '2025-10-18T10:00:00Z',
        niceToHave: '- 熟悉雲端服務 (AWS/GCP/Azure)。\n- 具備微服務架構設計經驗。\n- 了解 DevOps 流程 (CI/CD)。',
        teamIntro: '後端團隊負責打造穩定、高效能的系統架構。我們重視程式碼品質與架構設計，並定期舉辦技術分享會。',
        techStack: '- 語言: Java 11+, Kotlin\n- 框架: Spring Boot, Spring Cloud\n- 資料庫: PostgreSQL, Redis, MongoDB\n- 容器化: Docker, Kubernetes',
        growthOpportunities: '您將參與核心系統的設計與開發，有機會接觸到高併發、大數據的挑戰，並成長為資深的系統架構師。'
    },
    { 
        id: 'job6', 
        title: '資料科學家', 
        department: '數據分析部', 
        description: '- 透過數據分析與機器學習模型，提供商業洞察。\n- 開發與部署機器學習模型。\n- 與產品團隊合作，將數據應用於產品優化。', 
        requirements: '- 熟悉 Python/R, 機器學習框架 (TensorFlow/PyTorch)。\n- 具備優秀的統計與數學基礎。\n- 兩年以上資料科學相關經驗。', 
        benefits: '- 參加國際數據科學會議機會。\n- 提供高效能運算資源。\n- 每週一次的論文研討會。', 
        status: JobStatus.DRAFT, 
        views: 25, 
        createdAt: '2025-10-22T10:00:00Z',
        niceToHave: '- 具備大數據處理經驗 (Spark, Hadoop)。\n- 熟悉深度學習模型。\n- 有 A/B 測試與實驗設計的經驗。',
        teamIntro: '數據分析部是公司的大腦，我們透過數據挖掘、機器學習為公司的商業決策提供關鍵洞見。團隊成員背景多元，學術氛圍濃厚。',
        techStack: '- 語言: Python, R, SQL\n- 框架: TensorFlow, PyTorch, Scikit-learn\n- 平台: Databricks, JupyterHub',
        growthOpportunities: '您將有機會解決真實世界的複雜商業問題，將最新的演算法應用於產品中，並在國際頂級會議上發表研究成果。'
    },
    { 
        id: 'job3', 
        title: 'UI/UX 設計師', 
        department: '設計部', 
        description: '- 負責公司產品的介面 (UI) 與使用者體驗 (UX) 設計。\n- 進行使用者研究與易用性測試。\n- 建立與維護設計系統 (Design System)。', 
        requirements: '- 精通 Figma, Sketch 等設計工具。\n- 熟悉使用者研究方法與流程。\n- 具備三年以上 UI/UX 設計經驗。', 
        benefits: '- 提供最新設計軟硬體。\n- 國內外設計研討會參與補助。\n- 訂閱專業設計資源網站。', 
        status: JobStatus.CLOSED, 
        views: 300, 
        createdAt: '2025-09-15T10:00:00Z',
        niceToHave: '- 具備使用者訪談與質化研究經驗。\n- 了解前端基礎技術 (HTML/CSS)。\n- 有動態設計 (Motion Design) 的能力。',
        teamIntro: '設計團隊致力於為用戶創造直觀、美觀且流暢的使用者體驗。我們重視使用者研究，並與產品、工程團隊緊密合作，共同打造卓越的產品。',
        techStack: '- 設計工具: Figma, Sketch, Adobe Creative Suite\n- 原型工具: ProtoPie, Framer\n- 協作工具: Zeplin, Miro',
        growthOpportunities: '您將主導核心產品的設計，建立與維護設計系統 (Design System)，並有機會成長為設計團隊的領導者。'
    },
];

const initialApplicants: Applicant[] = [
    { id: 'app1', name: '王小明', email: 'ming@example.com', phone: '0912345678', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-10T10:00:00Z', feedback: [] },
    { id: 'app2', name: '陳美麗', email: 'mei@example.com', phone: '0987654321', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.SCREENING, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-11T11:00:00Z', feedback: [{id: 'fb1', author: 'HR 小雅', comment: '經驗符合，可以安排面試。', rating: 4}] },
    { id: 'app3', name: '李大衛', email: 'david@example.com', phone: '0911223344', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.REFERRAL, applicationDate: '2025-10-12T12:00:00Z', feedback: [{id: 'fb2', author: 'HR 小雅', comment: '初試印象不錯。', rating: 5}, {id: 'fb3', author: '用人主管 老張', comment: '產品sense很好，需要再深入了解專案細節。', rating: 4}] },
    { id: 'app4', name: '張心怡', email: 'joy@example.com', phone: '0955667788', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.OFFER, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-13T13:00:00Z', feedback: [] },
    { id: 'app5', name: '黃志強', email: 'john@example.com', phone: '0933445566', resumeUrl: '#', jobId: 'job3', stage: RecruitmentStage.HIRED, source: ApplicantSource.LINKEDIN, applicationDate: '2025-09-20T14:00:00Z', feedback: [] },
    { id: 'app6', name: '吳佩芬', email: 'fen@example.com', phone: '0922334455', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.REJECTED, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-14T14:00:00Z', feedback: [] },
    { id: 'app7', name: '林家豪', email: 'hao@example.com', phone: '0912111222', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-25T10:00:00Z', feedback: [] },
    { id: 'app8', name: '許雅婷', email: 'tina@example.com', phone: '0912333444', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.SCREENING, source: ApplicantSource.REFERRAL, applicationDate: '2025-10-25T11:00:00Z', feedback: [] },
    { id: 'app9', name: '蔡明宏', email: 'hong@example.com', phone: '0912555666', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-25T12:00:00Z', feedback: [] },
    { id: 'app10', name: '鄭怡君', email: 'june@example.com', phone: '0912777888', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-26T09:00:00Z', feedback: [] },
    { id: 'app11', name: '郭志偉', email: 'wei@example.com', phone: '0912999000', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.OFFER, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-22T15:00:00Z', feedback: [] },
    { id: 'app12', name: '曾琬婷', email: 'wan@example.com', phone: '0988111222', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-26T10:00:00Z', feedback: [] },
    { id: 'app13', name: '賴建宇', email: 'yu@example.com', phone: '0988333444', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.HIRED, source: ApplicantSource.REFERRAL, applicationDate: '2025-10-20T16:00:00Z', feedback: [] },
    { id: 'app14', name: '周淑芬', email: 'fen@example.com', phone: '0988555666', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.SCREENING, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-26T11:00:00Z', feedback: [] },
    { id: 'app15', name: '徐文雄', email: 'xiong@example.com', phone: '0988777888', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-24T10:00:00Z', feedback: [] },
    { id: 'app16', name: '蕭美玲', email: 'ling@example.com', phone: '0988999000', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.REJECTED, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-23T14:00:00Z', feedback: [] },
    { id: 'app17', name: '方志明', email: 'ming.fang@example.com', phone: '0977111222', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-27T09:00:00Z', feedback: [] },
    { id: 'app18', name: '江秀蘭', email: 'lan@example.com', phone: '0977333444', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.SCREENING, source: ApplicantSource.REFERRAL, applicationDate: '2025-10-27T10:00:00Z', feedback: [] },
    { id: 'app19', name: '葉俊傑', email: 'jay@example.com', phone: '0977555666', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-27T11:00:00Z', feedback: [] },
    { id: 'app20', name: '彭靜宜', email: 'ann@example.com', phone: '0977777888', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-27T12:00:00Z', feedback: [] },
    { id: 'app21', name: '程偉倫', email: 'lun@example.com', phone: '0966111222', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.SCREENING, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-28T09:00:00Z', feedback: [] },
    { id: 'app22', name: '羅惠君', email: 'june.lo@example.com', phone: '0966333444', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-28T10:00:00Z', feedback: [] },
    { id: 'app23', name: '潘文傑', email: 'wen@example.com', phone: '0966555666', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-28T11:00:00Z', feedback: [] },
    { id: 'app24', name: '何美惠', email: 'mei.he@example.com', phone: '0966777888', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.REFERRAL, applicationDate: '2025-10-26T15:00:00Z', feedback: [] },
    { id: 'app25', name: '高明輝', email: 'hui@example.com', phone: '0955111222', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-29T09:00:00Z', feedback: [] },
    { id: 'app26', name: '簡芳如', email: 'fang@example.com', phone: '0955333444', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-29T10:00:00Z', feedback: [] },
    { id: 'app27', name: '林志玲', email: 'chiling@example.com', phone: '0911111111', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-30T09:00:00Z', feedback: [] },
    { id: 'app28', name: '周杰倫', email: 'jay.chou@example.com', phone: '0922222222', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.SCREENING, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-30T10:00:00Z', feedback: [] },
    { id: 'app29', name: '蔡依林', email: 'jolin.tsai@example.com', phone: '0933333333', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.REFERRAL, applicationDate: '2025-10-30T11:00:00Z', feedback: [] },
    { id: 'app30', name: '陳奕迅', email: 'eason.chan@example.com', phone: '0944444444', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-30T12:00:00Z', feedback: [] },
    { id: 'app31', name: '張惠妹', email: 'a-mei@example.com', phone: '0955555555', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.SCREENING, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-31T09:00:00Z', feedback: [] },
    { id: 'app32', name: '王力宏', email: 'leehom@example.com', phone: '0966666666', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-10-31T10:00:00Z', feedback: [] },
    { id: 'app33', name: '孫燕姿', email: 'stefanie.sun@example.com', phone: '0977777777', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.REJECTED, source: ApplicantSource.REFERRAL, applicationDate: '2025-10-31T11:00:00Z', feedback: [] },
    { id: 'app34', name: '五月天阿信', email: 'ashin@example.com', phone: '0988888888', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.LINKEDIN, applicationDate: '2025-10-31T12:00:00Z', feedback: [] },
    { id: 'app35', name: '田馥甄', email: 'hebe@example.com', phone: '0919191919', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-01T09:00:00Z', feedback: [] },
    { id: 'app36', name: '林俊傑', email: 'jj.lin@example.com', phone: '0928282828', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-01T10:00:00Z', feedback: [] },
    { id: 'app37', name: '鄧紫棋', email: 'gem@example.com', phone: '0937373737', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.SCREENING, source: ApplicantSource.LINKEDIN, applicationDate: '2025-11-01T11:00:00Z', feedback: [] },
    { id: 'app38', name: '李宗盛', email: 'jonathan.lee@example.com', phone: '0952525252', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.REFERRAL, applicationDate: '2025-11-01T12:00:00Z', feedback: [] },
    { id: 'app39', name: '梁靜茹', email: 'fish.leong@example.com', phone: '0915151515', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-02T09:00:00Z', feedback: [] },
    { id: 'app40', name: '陶喆', email: 'david.tao@example.com', phone: '0925252525', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.SCREENING, source: ApplicantSource.LINKEDIN, applicationDate: '2025-11-02T10:00:00Z', feedback: [] },
    { id: 'app41', name: '莫文蔚', email: 'karen.mok@example.com', phone: '0935353535', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-02T11:00:00Z', feedback: [] },
    { id: 'app42', name: '張學友', email: 'jacky.cheung@example.com', phone: '0953535353', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.REFERRAL, applicationDate: '2025-11-02T12:00:00Z', feedback: [] },
    { id: 'app43', name: '王菲', email: 'faye.wong@example.com', phone: '0913131313', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.SCREENING, source: ApplicantSource.LINKEDIN, applicationDate: '2025-11-03T09:00:00Z', feedback: [] },
    { id: 'app44', name: '劉德華', email: 'andy.lau@example.com', phone: '0923232323', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-03T10:00:00Z', feedback: [] },
    { id: 'app45', name: '鄭秀文', email: 'sammi.cheng@example.com', phone: '0932323232', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-03T11:00:00Z', feedback: [] },
    { id: 'app46', name: '郭富城', email: 'aaron.kwok@example.com', phone: '0954545454', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.SCREENING, source: ApplicantSource.LINKEDIN, applicationDate: '2025-11-03T12:00:00Z', feedback: [] },
    { id: 'app47', name: '黎明', email: 'leon.lai@example.com', phone: '0914141414', resumeUrl: '#', jobId: 'job1', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.REFERRAL, applicationDate: '2025-11-04T09:00:00Z', feedback: [] },
    { id: 'app48', name: '楊丞琳', email: 'rainie.yang@example.com', phone: '0924242424', resumeUrl: '#', jobId: 'job5', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-04T10:00:00Z', feedback: [] },
    { id: 'app49', name: '羅志祥', email: 'show.lo@example.com', phone: '0934343434', resumeUrl: '#', jobId: 'job4', stage: RecruitmentStage.INTERVIEW, source: ApplicantSource.LINKEDIN, applicationDate: '2025-11-04T11:00:00Z', feedback: [] },
    { id: 'app50', name: '潘瑋柏', email: 'will.pan@example.com', phone: '0956565656', resumeUrl: '#', jobId: 'job2', stage: RecruitmentStage.NEW_APPLICATION, source: ApplicantSource.WEBSITE, applicationDate: '2025-11-04T12:00:00Z', feedback: [] },
];

const interviewers: Interviewer[] = [
    { id: 'user1', name: 'HR 小雅' },
    { id: 'user2', name: '用人主管 老張' },
    { id: 'user3', name: '技術主管 大牛' },
    { id: 'user4', name: '產品總監 小王' },
];


type View = 'DASHBOARD' | 'JOBS' | 'APPLICANTS';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; isCollapsed: boolean; }> = ({ icon, label, isActive, onClick, isCollapsed }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
      } ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? label : undefined}
    >
        {icon}
        <span className={`ml-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{label}</span>
    </button>
);

const AppContent: React.FC = () => {
    const { t, setLanguage, language } = useTranslation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [view, setView] = useState<View>('DASHBOARD');
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [selectedJobIdForFilter, setSelectedJobIdForFilter] = useState<string>('all');
    
    const handleViewChange = (newView: View) => {
        setView(newView);
        setSelectedJob(null); // Reset selected job when changing main view
        if (newView !== 'APPLICANTS') {
            setSelectedJobIdForFilter('all');
        }
    };

    const addJob = useCallback((jobData: Omit<Job, 'id' | 'views' | 'createdAt'>) => {
        const newJob: Job = {
            ...jobData,
            id: `job${Date.now()}`,
            views: 0,
            createdAt: new Date().toISOString(),
        };
        setJobs(prev => [newJob, ...prev]);
    }, []);

    const updateJobStatus = useCallback((jobId: string, status: JobStatus) => {
        setJobs(prev => prev.map(job => job.id === jobId ? {...job, status} : job));
    }, []);

    const addApplicant = useCallback((applicantData: Omit<Applicant, 'id' | 'feedback'>) => {
        const newApplicant: Applicant = {
            ...applicantData,
            id: `app${Date.now()}`,
            feedback: []
        };
        setApplicants(prev => [...prev, newApplicant]);
    }, []);

    const updateApplicantStage = useCallback((applicantId: string, newStage: RecruitmentStage) => {
        setApplicants(prev => prev.map(app => app.id === applicantId ? { ...app, stage: newStage } : app));
        const applicant = applicants.find(a => a.id === applicantId);
        if(applicant) {
            console.log(`[Notification] Sending email to ${applicant.email}: Your application status has been updated to ${newStage}.`);
        }
    }, [applicants]);

    const addFeedback = useCallback((applicantId: string, feedbackData: Omit<Feedback, 'id'>) => {
        setApplicants(prev => prev.map(app => {
            if (app.id === applicantId) {
                const newFeedback: Feedback = { ...feedbackData, id: `fb${Date.now()}`};
                return { ...app, feedback: [...app.feedback, newFeedback]};
            }
            return app;
        }));
    }, []);

    const scheduleInterview = useCallback((applicantId: string, time: string, selectedInterviewers: Interviewer[]) => {
        setApplicants(prev => prev.map(app => 
            app.id === applicantId 
            ? { ...app, interviewTime: time, interviewers: selectedInterviewers } 
            : app
        ));
        console.log(`[Notification] Interview for ${applicantId} scheduled at ${time} with ${selectedInterviewers.map(i => i.name).join(', ')}. Invites sent.`);
    }, []);
    
    const handleLogin = useCallback((username: string, password: string): boolean => {
        if (username === 'admin' && password === 'password') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, []);

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
    }, []);
    
    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    };

    const AppHeader: React.FC = () => {
        const titles: Record<View, string> = {
            DASHBOARD: t('nav.dashboard'),
            JOBS: t('nav.jobs'),
            APPLICANTS: t('nav.applicants')
        };
    
        return (
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-800">{selectedJob ? selectedJob.title : titles[view]}</h1>
                <div className="flex items-center gap-4">
                    {view === 'APPLICANTS' && (
                        <div>
                            <label htmlFor="job-filter" className="sr-only">{t('applicants.filterLabel')}</label>
                            <select
                                id="job-filter"
                                value={selectedJobIdForFilter}
                                onChange={e => setSelectedJobIdForFilter(e.target.value)}
                                className="block pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                            >
                                <option value="all">{t('applicants.allJobs')}</option>
                                {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={() => setIsChatbotOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <SparklesIcon />
                        {t('chatbot.title')}
                    </button>
                </div>
            </header>
        );
    };

    const memoizedApplicants = useMemo(() => applicants, [applicants]);
    const memoizedJobs = useMemo(() => jobs, [jobs]);

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-slate-100">
            <aside className={`bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div>
                    <div className={`px-2 mb-8 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
                        <LogoIcon isCollapsed={isSidebarCollapsed} />
                    </div>
                    <nav className="space-y-2">
                        <NavItem icon={<ChartBarIcon className="w-5 h-5 flex-shrink-0"/>} label={t('nav.dashboard')} isActive={view === 'DASHBOARD'} onClick={() => handleViewChange('DASHBOARD')} isCollapsed={isSidebarCollapsed} />
                        <NavItem icon={<BriefcaseIcon className="w-5 h-5 flex-shrink-0"/>} label={t('nav.jobs')} isActive={view === 'JOBS'} onClick={() => handleViewChange('JOBS')} isCollapsed={isSidebarCollapsed} />
                        <NavItem icon={<UsersIcon className="w-5 h-5 flex-shrink-0"/>} label={t('nav.applicants')} isActive={view === 'APPLICANTS'} onClick={() => handleViewChange('APPLICANTS')} isCollapsed={isSidebarCollapsed} />
                    </nav>
                </div>
                <div className="space-y-2 p-2 border-t">
                    <button onClick={toggleLanguage} className={`w-full inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                       <GlobeIcon className="w-4 h-4 flex-shrink-0" />
                       {!isSidebarCollapsed && t('toggleLanguage')}
                    </button>
                    <button onClick={handleLogout} className={`w-full inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOutIcon className="w-4 h-4 flex-shrink-0" />
                        {!isSidebarCollapsed && t('logout')}
                    </button>
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full text-slate-500 hover:bg-slate-100 p-2 rounded-md">
                        <ChevronDoubleLeftIcon className={`w-5 h-5 mx-auto transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col min-w-0">
                <AppHeader />
                <div className="flex flex-1 overflow-hidden">
                    <main className="flex-1 h-full overflow-y-auto">
                        {view === 'DASHBOARD' && <Dashboard applicants={memoizedApplicants} jobs={memoizedJobs} />}
                        {view === 'JOBS' && <Jobs jobs={memoizedJobs} applicants={memoizedApplicants} addJob={addJob} updateJobStatus={updateJobStatus} selectedJob={selectedJob} onSelectJob={setSelectedJob} onClearSelectedJob={() => setSelectedJob(null)} />}
                        {view === 'APPLICANTS' && <Applicants applicants={memoizedApplicants} jobs={memoizedJobs} updateApplicantStage={updateApplicantStage} addFeedback={addFeedback} interviewers={interviewers} scheduleInterview={scheduleInterview} selectedJobId={selectedJobIdForFilter} />}
                    </main>
                    <aside className={`transition-[width] duration-300 ease-in-out flex-shrink-0 overflow-hidden ${isChatbotOpen ? 'w-[400px]' : 'w-0'}`}>
                        <div className="w-[400px] h-full border-l border-slate-200">
                           <Chatbot 
                                isOpen={isChatbotOpen} 
                                onClose={() => setIsChatbotOpen(false)} 
                                jobs={memoizedJobs} 
                                applicants={memoizedApplicants}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
)

export default App;