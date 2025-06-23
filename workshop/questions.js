// 워크샵 질문 데이터
const WORKSHOP_QUESTIONS = {
    agendas: [
        {
            id: 1,
            title: "미래 AI 비즈니스",
            questions: [
                {
                    id: "1-1",
                    text: "전략팀 구성원 각자가 생각하는 2~3년 후 학술 산업의 미래는 무엇인가?",
                    hint: "AI 기술의 발전이 학술 산업에 미칠 영향과 변화를 자유롭게 작성해주세요."
                },
                {
                    id: "1-2",
                    text: "단기간에 사라지지 않을 AI 사업을 추진하려면, 어떻게 해야 할까?",
                    hint: "지속가능한 AI 비즈니스 모델과 전략에 대한 의견을 공유해주세요."
                }
            ]
        },
        {
            id: 2,
            title: "팀/팀원의 역할과 목표",
            questions: [
                {
                    id: "2-1",
                    text: "AI 전략팀은 2025년 하반기에 어떤 역할을 수행해야 하는가? 목표는 무엇인가?",
                    hint: "팀의 방향성과 구체적인 목표에 대해 작성해주세요."
                },
                {
                    id: "2-2",
                    text: "팀원 각자는 해당 목표 달성을 위해 어떤 역할을 중점적으로 수행하고 싶은가? 어떤 일을 맡아서 하고 싶은가?",
                    hint: "개인의 강점과 관심사를 바탕으로 희망하는 역할을 작성해주세요."
                }
            ]
        },
        {
            id: 3,
            title: "차세대 AI 서비스",
            questions: [
                {
                    id: "3-1",
                    text: "팀원 각자가 생각하는 추진해볼 만한 차세대 AI 서비스 3가지와 그 이유는?",
                    hint: "혁신적이고 실현 가능한 AI 서비스 아이디어를 3가지 제안해주세요."
                },
                {
                    id: "3-2",
                    text: "기술, 수요, 리소스, 시장파이 측면에서 점수를 매겨 본다면?",
                    hint: "위에서 제안한 3가지 아이디어에 대해 각 측면별로 평가해주세요."
                },
                {
                    id: "3-3",
                    text: "AI 전략팀이 곧은 차세대 AI 서비스 3가지는?",
                    hint: "팀 차원에서 우선적으로 추진해야 할 AI 서비스를 선정해주세요."
                }
            ]
        }
    ],
    
    // 전체 질문 개수 계산
    getTotalQuestions() {
        return this.agendas.reduce((total, agenda) => total + agenda.questions.length, 0);
    },
    
    // 질문 ID로 질문 정보 가져오기
    getQuestionById(questionId) {
        for (const agenda of this.agendas) {
            const question = agenda.questions.find(q => q.id === questionId);
            if (question) {
                return {
                    ...question,
                    agendaId: agenda.id,
                    agendaTitle: agenda.title
                };
            }
        }
        return null;
    },
    
    // 현재 질문의 순서 번호 가져오기
    getQuestionIndex(questionId) {
        let index = 0;
        for (const agenda of this.agendas) {
            for (const question of agenda.questions) {
                index++;
                if (question.id === questionId) {
                    return index;
                }
            }
        }
        return 0;
    }
};