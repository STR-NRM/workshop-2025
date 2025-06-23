// AI 서비스 아이디어 데이터
const AI_IDEAS_DATA = [
    {
        id: 'idea-1',
        title: '카드도 기반 논문 주제 추천',
        description: '텍스트 카드도를 입력하면 연관 개념을 마인드맵 형태로 확장하거나, 이를 기반으로 구체적인 논문 주제를 추천',
        category: '연구 주제 탐색 및 아이디어 발굴',
        details: '연관 검색어 확장 서비스, 카드도 기반 논문 주제 추천 서비스'
    },
    {
        id: 'idea-2',
        title: '자능형 논문 큐레이션 및 요약',
        description: '사용자의 주장이나 가설에 대한 근거가 될 논문을 자동으로 찾아주거나, 수업 커리큘럼과 연계된 논문을 추천',
        category: '자료 조사 및 문헌 연구',
        details: '큰거 논문 자동 탐색 서비스, 수업 커리큘럼 연계 논문 추천 서비스'
    },
    {
        id: 'idea-3',
        title: '멀티모달 학술자료 검색',
        description: '텍스트뿐만 아니라 이미지, 표, 그래프 등 다양한 형태의 학술 자료를 검색하고 이해하는 기능',
        category: '자료 조사 및 문헌 연구',
        details: '멀티모달 학술자료 검색 기능, GPT 멀티모달 지원 대기'
    },
    {
        id: 'idea-4',
        title: 'AI 논문 작성 지원 도구',
        description: '논문에 적합한 학술적 어투로 교정/교열하고, 탐구 주제 입력 시 자동 목차와 서술의 틀을 제공하며, 참고문헌을 관리/추천',
        category: '논문 작성 및 콘텐츠 생성',
        details: '논문 작성 지원 서비스, 최적 결과 위한 프롬프트 엔지니어링 필요'
    },
    {
        id: 'idea-5',
        title: '문헌 리뷰 초안 자동 생성',
        description: '특정 주제의 핵심 선행 연구를 요약, 분석하여 문헌 연구(Literature Review) 파트의 초안을 자동 생성',
        category: '논문 작성 및 콘텐츠 생성',
        details: '문헌 리뷰 초안 생성 서비스, DBpia 콘텐츠 사용 라이선스 검토 필요'
    },
    {
        id: 'idea-6',
        title: '실험/연구 흐름도 생성 AI',
        description: '연구 설계나 실험 과정을 입력하면, 이를 명확한 흐름도(Flowchart)나 다이어그램 형태로 자동 생성',
        category: '실험/연구 흐름도 생성 AI',
        details: '실험, 연구 흐름도 AI 생성, 워크플로우 템플릿 구축 필요'
    },
    {
        id: 'idea-7',
        title: '자동화 설문조사 서비스',
        description: '연구 목적에 맞는 설문 문항 설계, 적합한 응답자 모집, 수집된 데이터의 통계 분석 및 결과 보고서 생성을 자동화',
        category: '데이터 분석 및 방법론',
        details: '설문조사 서비스, 이화여대, 한양대, 한양대 등의 피드백 활용'
    },
    {
        id: 'idea-8',
        title: '데이터셋 추천 플랫폼',
        description: '연구 주제나 분석 목적에 맞는 공개 데이터셋이나 내부 데이터를 추천하고 연계',
        category: '데이터셋 추천 플랫폼품',
        details: '데이터셋 추천 플랫폼, 외부 공개 데이터 연계 모듈 필요'
    },
    {
        id: 'idea-9',
        title: '논문 내 통계 자료 추출',
        description: '논문 본문이나 표에 포함된 통계 수치, 자료, 핵심 데이터를 자동으로 인식하고 수출하여 재사용 가능한 형태로 정리',
        category: '논문 내 통계 자료 추출',
        details: '논문 내 통계 자료 추출 서비스, KSDC 데이터 연동 필요'
    },
    {
        id: 'idea-10',
        title: 'ChatGPT 결과물 검증 서비스',
        description: '생성형 AI가 만든 결과물의 사실관계, 표절 여부 등을 교차 검증하는 서비스',
        category: '검토, 교정 및 피드백',
        details: 'ChatGPT 결과 검증 서비스, Turnitin, 카피킬러 유사 서비스 존재'
    },
    {
        id: 'idea-11',
        title: 'AI 학업 지원 Agent 플랫폼',
        description: '강의녹음 및 정리, 자료조사 딥리서치, 질의응답 GPT, 학습자료 관리 Cloud 등 쓰임 – 과제 – 시험 나눠 대응 Agent 플랫폼',
        category: '학업/연구 활동 전반 지원',
        details: '대학생 특화 Agent Platform, Vertical Agent AI Platform 발표자료 참고'
    },
    {
        id: 'idea-12',
        title: 'AI 논문/학업 멘토 챗봇',
        description: '논문 작성법, 연구 방법론 등 학업 및 연구 전반에 대한 질문에 답변하는 대화형 챗봇 또는 Q&A 서비스',
        category: '학업/연구 활동 전반 지원',
        details: '논문 도우미 챗봇, GPT 활용 초기 프로토타입 구축 가능'
    },
    {
        id: 'idea-13',
        title: '네트워킹 지원 서비스',
        description: '연구 주제나 관심사를 기반으로 협업할 만한 다른 연구자나 전문가를 찾아 연결해주는 SNS 또는 매칭 기능',
        category: '공유 서재 및 협업 지원',
        details: '연구자 SNS 매칭 서비스, 개인정보 이슈 및 프로필 데이터 정합성 검토 필요'
    },
    {
        id: 'idea-14',
        title: '공유 서재 및 협업 지원',
        description: '팀원 간에 논문, 자료, 메모를 공유할 수 있는 공동의 서재를 구축하고, 유사 주제의 논문을 추천하여 협업 연구를 지원',
        category: '공유 서재 및 협업 지원',
        details: '공유 서재 서비스, 제안: 이화여대, 서강대, 한양대 등과의 파트너십'
    }
];

// 평가 기준 정보
const EVALUATION_CRITERIA = {
    tech: {
        name: '기술 적합성',
        description: '현재 기술로 구현 가능한 정도',
        icon: '⚙️'
    },
    demand: {
        name: '수요 적합성',
        description: '시장의 필요성과 사용자 수요',
        icon: '📊'
    },
    resource: {
        name: '리소스 적합성',
        description: '필요한 인력, 시간, 비용 대비 효율성',
        icon: '💰'
    },
    market: {
        name: '시장파이',
        description: '잠재 시장 규모와 성장 가능성',
        icon: '🎯'
    }
};

// 카테고리별 색상
const CATEGORY_COLORS = {
    '연구 주제 탐색 및 아이디어 발굴': '#6366f1',
    '자료 조사 및 문헌 연구': '#8b5cf6',
    '논문 작성 및 콘텐츠 생성': '#3b82f6',
    '데이터 분석 및 방법론': '#10b981',
    '검토, 교정 및 피드백': '#f59e0b',
    '학업/연구 활동 전반 지원': '#ef4444',
    '공유 서재 및 협업 지원': '#ec4899'
};

window.AI_IDEAS_DATA = AI_IDEAS_DATA;
window.EVALUATION_CRITERIA = EVALUATION_CRITERIA;