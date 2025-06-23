console.log('workshop.js loaded, window.utils:', window.utils);
console.log('workshop.js loaded, window.utils.getRequiredElement:', window.utils && window.utils.getRequiredElement);

// 워크샵 메인 로직
class WorkshopApp {
    constructor() {
        this.currentScreen = 'startScreen';
        this.participantName = '';
        this.responses = {};
        this.totalQuestions = WORKSHOP_QUESTIONS.getTotalQuestions();
        
        this.initializeApp();
    }
    
    initializeApp() {
        // LocalStorage에서 데이터 불러오기
        this.loadFromLocalStorage();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 진행률 초기화
        this.updateProgress();
        
        // 자동 저장 디바운스 함수
        this.autoSave = this.debounce((questionId, value) => {
            this.saveResponse(questionId, value);
        }, 300);
    }
    
    setupEventListeners() {
        // 시작 버튼
        const startBtn = window.utils.getRequiredElement('startBtn');
        startBtn.addEventListener('click', () => this.startWorkshop());
        
        // 참가자 이름 입력 Enter 키 처리
        const nameInput = window.utils.getRequiredElement('participantName');
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startWorkshop();
            }
        });
        
        // 네비게이션 버튼들
        document.querySelectorAll('.nav-prev, .nav-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                this.navigateToScreen(target);
            });
        });
        
        // 질문 입력 필드들
        document.querySelectorAll('.question-input').forEach(textarea => {
            // 자동 저장
            textarea.addEventListener('input', (e) => {
                const questionId = e.target.dataset.questionId;
                this.autoSave(questionId, e.target.value);
            });
            
            // 기존 응답 불러오기
            const questionId = textarea.dataset.questionId;
            if (this.responses[questionId]) {
                textarea.value = this.responses[questionId];
            }
        });
        
        // 내보내기 버튼들
        window.utils.getRequiredElement('exportJson').addEventListener('click', () => {
            this.exportToJson();
        });
        
        window.utils.getRequiredElement('exportPdf').addEventListener('click', () => {
            this.exportToPdf();
        });
        
        // 처음으로 버튼
        window.utils.getRequiredElement('backToStart').addEventListener('click', () => {
            if (confirm('처음으로 돌아가시겠습니까? 모든 응답은 저장되어 있습니다.')) {
                this.navigateToScreen('startScreen');
            }
        });
        
        // 페이지 떠나기 전 경고
        window.addEventListener('beforeunload', (e) => {
            const hasUnsavedChanges = Object.keys(this.responses).some(key => {
                const textarea = document.querySelector(`[data-question-id="${key}"]`);
                return textarea && textarea.value !== (this.responses[key] || '');
            });
            
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    startWorkshop() {
        const nameInput = window.utils.getRequiredElement('participantName');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('참가자 이름을 입력해주세요.');
            nameInput.focus();
            return;
        }
        
        this.participantName = name;
        this.saveToLocalStorage();
        
        // 요약 화면에 이름 표시
        window.utils.getRequiredElement('summaryParticipant').textContent = name;
        
        // 첫 질문으로 이동
        this.navigateToScreen('1-1');
    }
    
    navigateToScreen(screenId) {
        // 현재 화면 숨기기
        const currentScreenEl = document.querySelector('.screen.active');
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }
        
        // 새 화면 표시
        let newScreenEl;
        if (screenId === 'startScreen' || screenId === 'summary') {
            newScreenEl = window.utils.getRequiredElement(screenId);
        } else {
            newScreenEl = document.querySelector(`[data-question="${screenId}"]`);
        }
        
        if (newScreenEl) {
            newScreenEl.classList.add('active', 'transitioning');
            setTimeout(() => {
                newScreenEl.classList.remove('transitioning');
            }, 300);
            
            this.currentScreen = screenId;
            
            // 진행률 업데이트
            this.updateProgress();
            
            // 요약 화면인 경우 응답 내용 표시
            if (screenId === 'summary') {
                this.showSummary();
            }
            
            // 스크롤 맨 위로
            window.scrollTo(0, 0);
        }
    }
    
    updateProgress() {
        const progressFill = window.utils.getRequiredElement('progressFill');
        const currentQuestionSpan = window.utils.getRequiredElement('currentQuestion');
        const totalQuestionsSpan = window.utils.getRequiredElement('totalQuestions');
        
        totalQuestionsSpan.textContent = this.totalQuestions;
        
        if (this.currentScreen === 'startScreen') {
            progressFill.style.width = '0%';
            currentQuestionSpan.textContent = '0';
        } else if (this.currentScreen === 'summary') {
            progressFill.style.width = '100%';
            currentQuestionSpan.textContent = this.totalQuestions;
        } else {
            const currentIndex = WORKSHOP_QUESTIONS.getQuestionIndex(this.currentScreen);
            const progressPercent = (currentIndex / this.totalQuestions) * 100;
            progressFill.style.width = `${progressPercent}%`;
            currentQuestionSpan.textContent = currentIndex;
        }
    }
    
    saveResponse(questionId, value) {
        this.responses[questionId] = value;
        this.saveToLocalStorage();
        
        // 저장 피드백 (옵션)
        this.showSaveIndicator();
    }
    
    showSaveIndicator() {
        // 간단한 저장 표시 (추후 구현 가능)
        console.log('응답이 자동 저장되었습니다.');
    }
    
    saveToLocalStorage() {
        const data = {
            participantName: this.participantName,
            responses: this.responses,
            lastUpdated: new Date().toISOString()
        };
        try {
            localStorage.setItem('workshopData', JSON.stringify(data));
        } catch (error) {
            window.utils.showNotification('저장 실패', '저장 중 오류가 발생했습니다. 브라우저 설정을 확인해주세요.', 'error');
        }
    }
    
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('workshopData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.participantName = data.participantName || '';
                this.responses = data.responses || {};
                
                // 참가자 이름이 있으면 입력 필드에 표시
                if (this.participantName) {
                    window.utils.getRequiredElement('participantName').value = this.participantName;
                }
                
                // 저장된 응답들을 텍스트 영역에 불러오기
                Object.keys(this.responses).forEach(questionId => {
                    const textarea = document.querySelector(`[data-question-id="${questionId}"]`);
                    if (textarea) {
                        textarea.value = this.responses[questionId];
                    }
                });
            } catch (error) {
                window.utils.showNotification('데이터 불러오기 실패', '저장된 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
            }
        }
    }
    
    showSummary() {
        const summaryContainer = window.utils.getRequiredElement('responseSummary');
        summaryContainer.innerHTML = '';
        
        WORKSHOP_QUESTIONS.agendas.forEach(agenda => {
            agenda.questions.forEach(question => {
                const response = this.responses[question.id] || '(응답 없음)';
                
                const responseItem = document.createElement('div');
                responseItem.className = 'response-item';
                responseItem.innerHTML = `
                    <div class="response-agenda">안건 ${agenda.id}: ${agenda.title}</div>
                    <div class="response-question">${question.text}</div>
                    <div class="response-answer">${window.utils.escapeHtml(response)}</div>
                `;
                
                summaryContainer.appendChild(responseItem);
            });
        });
    }
    
    exportToJson() {
        const exportData = {
            workshop: '2025년 상반기 팀 워크샵',
            participant: this.participantName,
            timestamp: new Date().toISOString(),
            responses: []
        };
        
        WORKSHOP_QUESTIONS.agendas.forEach(agenda => {
            agenda.questions.forEach(question => {
                exportData.responses.push({
                    agendaId: agenda.id,
                    agendaTitle: agenda.title,
                    questionId: question.id,
                    questionText: question.text,
                    response: this.responses[question.id] || ''
                });
            });
        });
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `workshop_responses_${this.participantName}_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    exportToPdf() {
        // PDF 내보내기는 export.js에서 구현
        if (typeof exportToPdf === 'function') {
            exportToPdf(this.participantName, this.responses);
        } else {
            // 브라우저 인쇄 기능 사용
            window.print();
        }
    }
    
    // 유틸리티 함수들
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.workshopApp = new WorkshopApp();
});