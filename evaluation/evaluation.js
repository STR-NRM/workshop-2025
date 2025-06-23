import { escapeHtml, getRequiredElement, showNotification } from '../common/utils.js';

// 평가 사이트 메인 로직
class EvaluationApp {
    constructor() {
        this.currentUser = null;
        this.currentIdeaId = null;
        this.allEvaluations = {};
        this.customIdeas = [];
        
        this.initializeApp();
    }
    
    initializeApp() {
        // LocalStorage에서 데이터 불러오기
        this.loadFromLocalStorage();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 초기 화면 렌더링
        this.renderIdeasGrid();
    }
    
    setupEventListeners() {
        // 평가 시작 버튼
        const startButton = document.getElementById('startEvaluation');
        if (startButton) {
            console.log('Start button found, adding event listener');
            startButton.addEventListener('click', () => {
                console.log('Start button clicked');
                this.startEvaluation();
            });
        } else {
            console.error('Start button not found!');
        }
        
        // 이름 입력 Enter 키 처리
        document.getElementById('evaluatorName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startEvaluation();
            }
        });
        
        // 필터 버튼들
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterIdeas(e.target.dataset.filter);
            });
        });
        
        // 커스텀 아이디어 추가
        document.getElementById('addCustomIdea').addEventListener('click', () => {
            document.getElementById('customIdeaForm').style.display = 'block';
            document.getElementById('addCustomIdea').style.display = 'none';
        });
        
        document.getElementById('saveCustomIdea').addEventListener('click', () => {
            this.saveCustomIdea();
        });
        
        document.getElementById('cancelCustomIdea').addEventListener('click', () => {
            this.cancelCustomIdea();
        });
        
        // 평가 완료 버튼
        document.getElementById('completeEvaluation').addEventListener('click', () => {
            this.showResults();
        });
        
        // 모달 관련
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('saveEvaluation').addEventListener('click', () => {
            this.saveEvaluation();
        });
        
        document.getElementById('cancelEvaluation').addEventListener('click', () => {
            this.closeModal();
        });
        
        // 슬라이더 값 표시
        document.querySelectorAll('.score-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueSpan = document.getElementById(e.target.id + 'Value');
                valueSpan.textContent = e.target.value;
            });
        });
        
        // 결과 내보내기
        document.getElementById('exportResults').addEventListener('click', () => {
            this.exportResults();
        });
        
        // 평가 화면으로 돌아가기
        document.getElementById('backToEvaluation').addEventListener('click', () => {
            this.backToEvaluation();
        });
    }
    
    generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    startEvaluation() {
        try {
            console.log('startEvaluation function called');
            const nameInput = getRequiredElement('evaluatorName');
            if (!nameInput) {
                showNotification('이름 입력란을 찾을 수 없습니다.', 'error');
                return;
            }
            const name = nameInput.value.trim();
            console.log('Evaluator name:', name);
            if (!name) {
                showNotification('평가자 이름을 입력해주세요.', 'error');
                nameInput.focus();
                return;
            }
            // 사용자 ID 생성 또는 기존 사용자 찾기
            const existingUser = Object.values(this.allEvaluations).find(user => user.name === name);
            if (existingUser) {
                this.currentUser = existingUser;
            } else {
                this.currentUser = {
                    id: this.generateUserId(),
                    name: name,
                    evaluations: {},
                    customIdeas: [],
                    timestamp: new Date().toISOString()
                };
                this.allEvaluations[this.currentUser.id] = this.currentUser;
            }
            // Check for required DOM elements
            const currentEvaluator = getRequiredElement('currentEvaluator');
            const evaluatorInfo = getRequiredElement('evaluatorInfo');
            const evaluationSection = getRequiredElement('evaluationSection');
            const participantInputGroup = document.querySelector('.participant-input-group');
            if (!participantInputGroup) {
                showNotification('참가자 입력 그룹 요소가 없습니다.', 'error');
                return;
            }
            // Check for global data
            if (typeof AI_IDEAS_DATA === 'undefined' || !Array.isArray(AI_IDEAS_DATA)) {
                showNotification('AI 아이디어 데이터가 로드되지 않았습니다.', 'error');
                return;
            }
            if (typeof EVALUATION_CRITERIA === 'undefined' || typeof EVALUATION_CRITERIA !== 'object') {
                showNotification('평가 기준 데이터가 로드되지 않았습니다.', 'error');
                return;
            }
            // UI 업데이트
            currentEvaluator.textContent = name;
            evaluatorInfo.style.display = 'block';
            evaluationSection.style.display = 'block';
            participantInputGroup.style.display = 'none';
            // 진행률 업데이트
            this.updateProgress();
            // 데이터 저장
            this.saveToLocalStorage();
            console.log('startEvaluation completed successfully');
        } catch (error) {
            console.error('Error in startEvaluation:', error);
            showNotification('초기화 오류: ' + (error.message || error), 'error');
        }
    }
    
    renderIdeasGrid() {
        const grid = document.getElementById('ideasGrid');
        grid.innerHTML = '';
        
        // 기본 아이디어들
        const allIdeas = [...AI_IDEAS_DATA, ...this.customIdeas];
        
        allIdeas.forEach(idea => {
            const card = this.createIdeaCard(idea);
            grid.appendChild(card);
        });
    }
    
    createIdeaCard(idea) {
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.dataset.ideaId = idea.id;
        
        // 평가 여부 확인
        const isEvaluated = this.currentUser && this.currentUser.evaluations[idea.id];
        if (isEvaluated) {
            card.classList.add('evaluated');
        }
        
        // 평균 점수 계산
        const avgScores = this.calculateAverageScores(idea.id);
        
        card.innerHTML = `
            <h3 class="idea-title">${idea.title}</h3>
            <p class="idea-description">${idea.description}</p>
            <div class="idea-meta">
                <span class="idea-category">${idea.category || '기타'}</span>
                <div class="idea-scores">
                    ${this.renderScoreBadges(avgScores)}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (this.currentUser) {
                this.openEvaluationModal(idea);
            } else {
                alert('먼저 평가자 정보를 입력해주세요.');
            }
        });
        
        return card;
    }
    
    renderScoreBadges(scores) {
        if (!scores || Object.keys(scores).length === 0) {
            return '<span class="score-badge">-</span>';
        }
        
        return Object.entries(scores).map(([criteria, score]) => {
            const icon = EVALUATION_CRITERIA[criteria]?.icon || '📊';
            return `<span class="score-badge filled" title="${EVALUATION_CRITERIA[criteria]?.name}">${score.toFixed(1)}</span>`;
        }).join('');
    }
    
    openEvaluationModal(idea) {
        this.currentIdeaId = idea.id;
        
        // 모달 내용 설정
        document.getElementById('modalIdeaTitle').textContent = idea.title;
        document.getElementById('modalIdeaDescription').textContent = idea.description;
        
        // 기존 평가 불러오기
        const existingEval = this.currentUser.evaluations[idea.id];
        if (existingEval) {
            document.getElementById('techScore').value = existingEval.scores.tech;
            document.getElementById('techScoreValue').textContent = existingEval.scores.tech;
            
            document.getElementById('demandScore').value = existingEval.scores.demand;
            document.getElementById('demandScoreValue').textContent = existingEval.scores.demand;
            
            document.getElementById('resourceScore').value = existingEval.scores.resource;
            document.getElementById('resourceScoreValue').textContent = existingEval.scores.resource;
            
            document.getElementById('marketScore').value = existingEval.scores.market;
            document.getElementById('marketScoreValue').textContent = existingEval.scores.market;
            
            document.getElementById('evaluationComment').value = existingEval.comment || '';
        } else {
            // 초기값 설정
            document.querySelectorAll('.score-slider').forEach(slider => {
                slider.value = 3;
                document.getElementById(slider.id + 'Value').textContent = 3;
            });
            document.getElementById('evaluationComment').value = '';
        }
        
        // 모달 표시
        document.getElementById('evaluationModal').style.display = 'flex';
    }
    
    closeModal() {
        document.getElementById('evaluationModal').style.display = 'none';
        this.currentIdeaId = null;
    }
    
    saveEvaluation() {
        if (!this.currentUser || !this.currentIdeaId) return;
        
        const evaluation = {
            scores: {
                tech: parseInt(document.getElementById('techScore').value),
                demand: parseInt(document.getElementById('demandScore').value),
                resource: parseInt(document.getElementById('resourceScore').value),
                market: parseInt(document.getElementById('marketScore').value)
            },
            comment: document.getElementById('evaluationComment').value.trim(),
            timestamp: new Date().toISOString()
        };
        
        this.currentUser.evaluations[this.currentIdeaId] = evaluation;
        
        // UI 업데이트
        this.renderIdeasGrid();
        this.updateProgress();
        this.saveToLocalStorage();
        
        // 모달 닫기
        this.closeModal();
        
        // 피드백
        this.showSaveNotification();
    }
    
    showSaveNotification() {
        // 간단한 알림 표시 (추후 개선 가능)
        const notification = document.createElement('div');
        notification.textContent = '평가가 저장되었습니다!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    saveCustomIdea() {
        const title = document.getElementById('customIdeaTitle').value.trim();
        const description = document.getElementById('customIdeaDescription').value.trim();
        
        if (!title || !description) {
            alert('제목과 설명을 모두 입력해주세요.');
            return;
        }
        
        const customIdea = {
            id: `custom_${Date.now()}`,
            title: title,
            description: description,
            category: '사용자 추가',
            isCustom: true,
            createdBy: this.currentUser.id,
            timestamp: new Date().toISOString()
        };
        
        this.customIdeas.push(customIdea);
        this.currentUser.customIdeas.push(customIdea.id);
        
        // UI 업데이트
        this.renderIdeasGrid();
        this.cancelCustomIdea();
        this.saveToLocalStorage();
    }
    
    cancelCustomIdea() {
        document.getElementById('customIdeaTitle').value = '';
        document.getElementById('customIdeaDescription').value = '';
        document.getElementById('customIdeaForm').style.display = 'none';
        document.getElementById('addCustomIdea').style.display = 'block';
    }
    
    filterIdeas(filter) {
        const cards = document.querySelectorAll('.idea-card');
        
        cards.forEach(card => {
            const isEvaluated = card.classList.contains('evaluated');
            
            switch(filter) {
                case 'all':
                    card.style.display = 'block';
                    break;
                case 'evaluated':
                    card.style.display = isEvaluated ? 'block' : 'none';
                    break;
                case 'pending':
                    card.style.display = !isEvaluated ? 'block' : 'none';
                    break;
            }
        });
    }
    
    updateProgress() {
        if (!this.currentUser) return;
        
        const totalIdeas = AI_IDEAS_DATA.length + this.customIdeas.length;
        const evaluatedCount = Object.keys(this.currentUser.evaluations).length;
        
        document.getElementById('evaluationProgress').textContent = evaluatedCount;
        document.getElementById('totalIdeas').textContent = totalIdeas;
    }
    
    calculateAverageScores(ideaId) {
        const scores = { tech: [], demand: [], resource: [], market: [] };
        
        Object.values(this.allEvaluations).forEach(user => {
            const evaluation = user.evaluations[ideaId];
            if (evaluation) {
                scores.tech.push(evaluation.scores.tech);
                scores.demand.push(evaluation.scores.demand);
                scores.resource.push(evaluation.scores.resource);
                scores.market.push(evaluation.scores.market);
            }
        });
        
        const avgScores = {};
        Object.entries(scores).forEach(([criteria, values]) => {
            if (values.length > 0) {
                avgScores[criteria] = values.reduce((a, b) => a + b, 0) / values.length;
            }
        });
        
        return avgScores;
    }
    
    showResults() {
        // 결과 섹션 표시
        document.getElementById('evaluationSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        
        // 통계 업데이트
        this.updateStatistics();
        
        // 순위 업데이트
        this.updateRankings('overall');
        
        // 차트 업데이트
        if (typeof updateCharts === 'function') {
            updateCharts(this.getAllEvaluationData());
        }
        
        // 의견 목록 업데이트
        this.updateCommentsList();
        
        // 스크롤 맨 위로
        window.scrollTo(0, 0);
    }
    
    updateStatistics() {
        const totalEvaluators = Object.keys(this.allEvaluations).length;
        const allIdeas = [...AI_IDEAS_DATA, ...this.customIdeas];
        
        let totalEvaluations = 0;
        let totalScore = 0;
        let scoreCount = 0;
        
        Object.values(this.allEvaluations).forEach(user => {
            totalEvaluations += Object.keys(user.evaluations).length;
            
            Object.values(user.evaluations).forEach(eval => {
                const scores = Object.values(eval.scores);
                totalScore += scores.reduce((a, b) => a + b, 0);
                scoreCount += scores.length;
            });
        });
        
        const averageScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '0.0';
        
        document.getElementById('totalEvaluators').textContent = totalEvaluators;
        document.getElementById('evaluatedIdeas').textContent = allIdeas.length;
        document.getElementById('averageScore').textContent = averageScore;
    }
    
    updateRankings(viewType = 'overall') {
        const allIdeas = [...AI_IDEAS_DATA, ...this.customIdeas];
        const rankings = [];
        
        allIdeas.forEach(idea => {
            const scores = this.calculateDetailedScores(idea.id);
            if (scores.evaluationCount > 0) {
                rankings.push({
                    idea: idea,
                    scores: scores,
                    total: viewType === 'overall' ? scores.overall : scores[viewType]
                });
            }
        });
        
        // 정렬
        rankings.sort((a, b) => b.total - a.total);
        
        // 순위 표시
        const rankingList = document.getElementById('rankingList');
        rankingList.innerHTML = '';
        
        rankings.forEach((item, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = `ranking-item ${index < 3 ? 'top-3' : ''}`;
            
            rankingItem.innerHTML = `
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-title">${item.idea.title}</div>
                    <div class="ranking-scores">
                        <span>기술: ${item.scores.tech.toFixed(1)}</span>
                        <span>수요: ${item.scores.demand.toFixed(1)}</span>
                        <span>리소스: ${item.scores.resource.toFixed(1)}</span>
                        <span>시장: ${item.scores.market.toFixed(1)}</span>
                        <span>(${item.scores.evaluationCount}명 평가)</span>
                    </div>
                </div>
                <div class="ranking-total">${item.total.toFixed(1)}</div>
            `;
            
            rankingList.appendChild(rankingItem);
        });
        
        // 탭 버튼 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateRankings(e.target.dataset.view);
            });
        });
    }
    
    calculateDetailedScores(ideaId) {
        const evaluations = [];
        
        Object.values(this.allEvaluations).forEach(user => {
            if (user.evaluations[ideaId]) {
                evaluations.push(user.evaluations[ideaId].scores);
            }
        });
        
        if (evaluations.length === 0) {
            return {
                tech: 0,
                demand: 0,
                resource: 0,
                market: 0,
                overall: 0,
                evaluationCount: 0
            };
        }
        
        const result = {
            tech: 0,
            demand: 0,
            resource: 0,
            market: 0,
            evaluationCount: evaluations.length
        };
        
        evaluations.forEach(scores => {
            result.tech += scores.tech;
            result.demand += scores.demand;
            result.resource += scores.resource;
            result.market += scores.market;
        });
        
        result.tech /= evaluations.length;
        result.demand /= evaluations.length;
        result.resource /= evaluations.length;
        result.market /= evaluations.length;
        result.overall = (result.tech + result.demand + result.resource + result.market) / 4;
        
        return result;
    }
    
    updateCommentsList() {
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';
        
        const allIdeas = [...AI_IDEAS_DATA, ...this.customIdeas];
        
        allIdeas.forEach(idea => {
            const comments = [];
            
            Object.values(this.allEvaluations).forEach(user => {
                const evaluation = user.evaluations[idea.id];
                if (evaluation && evaluation.comment) {
                    comments.push({
                        author: user.name,
                        comment: evaluation.comment,
                        timestamp: evaluation.timestamp
                    });
                }
            });
            
            if (comments.length > 0) {
                comments.forEach(commentData => {
                    const commentItem = document.createElement('div');
                    commentItem.className = 'comment-item';
                    
                    commentItem.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-idea">${idea.title}</span>
                            <span class="comment-author">${commentData.author}</span>
                        </div>
                        <div class="comment-text">${escapeHtml(commentData.comment)}</div>
                    `;
                    
                    commentsList.appendChild(commentItem);
                });
            }
        });
        
        if (commentsList.children.length === 0) {
            commentsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">아직 작성된 의견이 없습니다.</p>';
        }
    }
    
    getAllEvaluationData() {
        return {
            evaluations: this.allEvaluations,
            ideas: [...AI_IDEAS_DATA, ...this.customIdeas],
            criteria: EVALUATION_CRITERIA
        };
    }
    
    exportResults() {
        const exportData = {
            workshop: '2025년 상반기 팀 워크샵 - 안건3 평가',
            exportDate: new Date().toISOString(),
            totalEvaluators: Object.keys(this.allEvaluations).length,
            ideas: [],
            evaluatorDetails: []
        };
        
        const allIdeas = [...AI_IDEAS_DATA, ...this.customIdeas];
        
        // 아이디어별 집계
        allIdeas.forEach(idea => {
            const scores = this.calculateDetailedScores(idea.id);
            if (scores.evaluationCount > 0) {
                exportData.ideas.push({
                    id: idea.id,
                    title: idea.title,
                    description: idea.description,
                    category: idea.category,
                    scores: scores,
                    rank: 0 // 나중에 정렬 후 순위 추가
                });
            }
        });
        
        // 순위 정렬
        exportData.ideas.sort((a, b) => b.scores.overall - a.scores.overall);
        exportData.ideas.forEach((idea, index) => {
            idea.rank = index + 1;
        });
        
        // 평가자별 상세 정보
        Object.values(this.allEvaluations).forEach(user => {
            exportData.evaluatorDetails.push({
                name: user.name,
                evaluationCount: Object.keys(user.evaluations).length,
                evaluations: user.evaluations
            });
        });
        
        // JSON 다운로드
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `evaluation_results_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    backToEvaluation() {
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('evaluationSection').style.display = 'block';
    }
    
    saveToLocalStorage() {
        const data = {
            allEvaluations: this.allEvaluations,
            customIdeas: this.customIdeas,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('evaluationData', JSON.stringify(data));
    }
    
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('evaluationData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.allEvaluations = data.allEvaluations || {};
                this.customIdeas = data.customIdeas || [];
            } catch (error) {
                console.error('저장된 데이터 불러오기 실패:', error);
            }
        }
    }
}

// 앱 초기화 - window load 이벤트 사용으로 모든 스크립트 로드 보장
window.addEventListener('load', () => {
    const requiredIds = [
        'startEvaluation', 'evaluatorName', 'currentEvaluator', 'evaluatorInfo', 'evaluationSection',
        'ideasGrid', 'addCustomIdea', 'customIdeaForm', 'saveCustomIdea', 'cancelCustomIdea',
        'completeEvaluation', 'closeModal', 'saveEvaluation', 'cancelEvaluation', 'exportResults', 'backToEvaluation'
    ];
    let missing = false;
    requiredIds.forEach(id => {
        if (!document.getElementById(id)) {
            console.error('Missing element:', id);
            alert('필수 요소가 누락되었습니다: ' + id + '\nHTML을 확인하세요.');
            missing = true;
        }
    });
    if (typeof AI_IDEAS_DATA === 'undefined') {
        console.error('AI_IDEAS_DATA is undefined');
        alert('AI_IDEAS_DATA is undefined. ideas-data.js가 먼저 로드되어야 합니다.');
        missing = true;
    }
    if (typeof EVALUATION_CRITERIA === 'undefined') {
        console.error('EVALUATION_CRITERIA is undefined');
        alert('EVALUATION_CRITERIA is undefined. ideas-data.js가 먼저 로드되어야 합니다.');
        missing = true;
    }
    if (missing) {
        throw new Error('필수 요소 또는 데이터가 누락되어 초기화를 중단합니다.');
    }
    
    console.log('Window load event fired');
    console.log('AI_IDEAS_DATA available:', typeof AI_IDEAS_DATA !== 'undefined');
    console.log('EVALUATION_CRITERIA available:', typeof EVALUATION_CRITERIA !== 'undefined');
    
    // AI_IDEAS_DATA가 없으면 기본 데이터 설정
    if (typeof AI_IDEAS_DATA === 'undefined') {
        console.error('AI_IDEAS_DATA is not loaded!');
        window.AI_IDEAS_DATA = [];
    }
    
    if (typeof EVALUATION_CRITERIA === 'undefined') {
        console.error('EVALUATION_CRITERIA is not loaded!');
        window.EVALUATION_CRITERIA = {};
    }
    
    try {
        window.evaluationApp = new EvaluationApp();
        console.log('EvaluationApp initialized successfully');
    } catch (error) {
        console.error('Error initializing EvaluationApp:', error);
        alert('페이지 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
    }
});

// 디버깅을 위한 전역 함수
window.debugStartEvaluation = function() {
    const nameInput = document.getElementById('evaluatorName');
    const name = nameInput.value.trim();
    console.log('Debug: Name input value:', name);
    
    if (window.evaluationApp) {
        window.evaluationApp.startEvaluation();
    } else {
        console.error('evaluationApp is not initialized');
    }
};