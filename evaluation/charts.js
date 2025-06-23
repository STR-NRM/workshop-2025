import { getRequiredElement } from '../common/utils.js';

// 차트 관리 및 시각화
class ChartManager {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: 'rgba(99, 102, 241, 0.8)',
            secondary: 'rgba(139, 92, 246, 0.8)',
            accent: 'rgba(59, 130, 246, 0.8)',
            success: 'rgba(16, 185, 129, 0.8)',
            warning: 'rgba(245, 158, 11, 0.8)',
            danger: 'rgba(239, 68, 68, 0.8)',
            pink: 'rgba(236, 72, 153, 0.8)'
        };
    }
    
    initializeCharts(evaluationData) {
        // 차트 데이터 준비
        const chartData = prepareChartData(evaluationData);
        
        // 카테고리별 평균 점수 차트
        this.createCategoryChart(chartData.stats);
        
        // 상위 5개 아이디어 차트
        this.createTopIdeasChart(evaluationData);
        
        // 인사이트 표시
        this.displayInsights(chartData.insights);
        
        // 추천 표시
        this.displayRecommendations(chartData.recommendations);
    }
    
    createCategoryChart(stats) {
        const ctx = getRequiredElement('categoryChart');
        if (!ctx) return;
        
        // 기존 차트 제거
        if (this.charts.category) {
            this.charts.category.destroy();
        }
        
        // 평가 기준별 평균 데이터
        const criteriaData = {
            labels: ['기술 적합성', '수요 적합성', '리소스 적합성', '시장파이'],
            datasets: [{
                label: '평균 점수',
                data: [
                    stats.criteriaAverages.tech?.average || 0,
                    stats.criteriaAverages.demand?.average || 0,
                    stats.criteriaAverages.resource?.average || 0,
                    stats.criteriaAverages.market?.average || 0
                ],
                backgroundColor: [
                    this.chartColors.primary,
                    this.chartColors.secondary,
                    this.chartColors.accent,
                    this.chartColors.success
                ],
                borderColor: [
                    this.chartColors.primary,
                    this.chartColors.secondary,
                    this.chartColors.accent,
                    this.chartColors.success
                ],
                borderWidth: 2
            }]
        };
        
        // 레이더 차트 생성
        this.charts.category = new Chart(ctx, {
            type: 'radar',
            data: criteriaData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.r.toFixed(1) + '점';
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    createTopIdeasChart(evaluationData) {
        const ctx = getRequiredElement('topIdeasChart');
        if (!ctx) return;
        
        // 기존 차트 제거
        if (this.charts.topIdeas) {
            this.charts.topIdeas.destroy();
        }
        
        // 아이디어별 종합 점수 계산
        const ideaScores = [];
        const allIdeas = evaluationData.ideas;
        
        allIdeas.forEach(idea => {
            const scores = resultsManager.calculateIdeaScore(idea.id, evaluationData.evaluations);
            if (scores.evaluationCount > 0) {
                ideaScores.push({
                    title: idea.title,
                    score: scores.overall,
                    tech: scores.tech,
                    demand: scores.demand,
                    resource: scores.resource,
                    market: scores.market
                });
            }
        });
        
        // 상위 5개 선택
        ideaScores.sort((a, b) => b.score - a.score);
        const top5 = ideaScores.slice(0, 5);
        
        // 차트 데이터 구성
        const chartData = {
            labels: top5.map(item => this.truncateLabel(item.title, 30)),
            datasets: [{
                label: '종합 점수',
                data: top5.map(item => item.score),
                backgroundColor: this.chartColors.primary,
                borderColor: this.chartColors.primary,
                borderWidth: 2
            }]
        };
        
        // 막대 차트 생성
        this.charts.topIdeas = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // 가로 막대 차트
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = top5[context.dataIndex];
                                return [
                                    '종합: ' + item.score.toFixed(1) + '점',
                                    '기술: ' + item.tech.toFixed(1),
                                    '수요: ' + item.demand.toFixed(1),
                                    '리소스: ' + item.resource.toFixed(1),
                                    '시장: ' + item.market.toFixed(1)
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 5,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    createDistributionChart(evaluationData) {
        // 점수 분포 히스토그램 (옵션)
        const allScores = [];
        
        Object.values(evaluationData.evaluations).forEach(user => {
            Object.values(user.evaluations).forEach(eval => {
                const avgScore = (eval.scores.tech + eval.scores.demand + 
                                eval.scores.resource + eval.scores.market) / 4;
                allScores.push(avgScore);
            });
        });
        
        // 점수 구간별 집계
        const distribution = {
            '1-2': allScores.filter(s => s >= 1 && s < 2).length,
            '2-3': allScores.filter(s => s >= 2 && s < 3).length,
            '3-4': allScores.filter(s => s >= 3 && s < 4).length,
            '4-5': allScores.filter(s => s >= 4 && s <= 5).length
        };
        
        return distribution;
    }
    
    displayInsights(insights) {
        // 인사이트를 결과 섹션에 추가
        const insightsContainer = document.createElement('div');
        insightsContainer.className = 'insights-section';
        insightsContainer.innerHTML = `
            <h3>주요 인사이트</h3>
            <div class="insights-list">
                ${insights.map(insight => `
                    <div class="insight-item insight-${insight.type}">
                        <span class="insight-icon">${this.getInsightIcon(insight.type)}</span>
                        <span class="insight-text">${insight.message}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 차트 섹션 다음에 추가
        const chartsSection = document.querySelector('.charts-section');
        if (chartsSection && !document.querySelector('.insights-section')) {
            chartsSection.insertAdjacentElement('afterend', insightsContainer);
        }
    }
    
    displayRecommendations(recommendations) {
        // 추천사항을 결과 섹션에 추가
        const recommendationsContainer = document.createElement('div');
        recommendationsContainer.className = 'recommendations-section';
        recommendationsContainer.innerHTML = `
            <h3>추천사항</h3>
            <div class="recommendations-list">
                ${recommendations.map(rec => `
                    <div class="recommendation-item recommendation-${rec.type}">
                        <h4>${rec.title}</h4>
                        <p class="recommendation-reason">${rec.reason}</p>
                        <ul class="recommendation-ideas">
                            ${rec.ideas.map(idea => `
                                <li>${idea.title} (${idea.scores.overall.toFixed(1)}점)</li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
        
        // 인사이트 섹션 다음에 추가
        const insightsSection = document.querySelector('.insights-section');
        if (insightsSection && !document.querySelector('.recommendations-section')) {
            insightsSection.insertAdjacentElement('afterend', recommendationsContainer);
        }
    }
    
    getInsightIcon(type) {
        const icons = {
            'criteria-gap': '📊',
            'high-consensus': '🤝',
            'low-consensus': '🤔',
            'category-strength': '💪'
        };
        return icons[type] || '💡';
    }
    
    truncateLabel(label, maxLength) {
        if (label.length <= maxLength) return label;
        return label.substring(0, maxLength - 3) + '...';
    }
    
    updateCharts(evaluationData) {
        this.initializeCharts(evaluationData);
    }
}

// 전역 차트 매니저 인스턴스
const chartManager = new ChartManager();

// 외부에서 호출할 수 있는 함수
function updateCharts(evaluationData) {
    chartManager.updateCharts(evaluationData);
}

// 추가 스타일 동적 삽입
const additionalStyles = `
<style>
.insights-section, .recommendations-section {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-2xl);
}

.insights-section h3, .recommendations-section h3 {
    font-size: var(--text-2xl);
    margin-bottom: var(--spacing-lg);
}

.insights-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.insight-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--gray-50);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--primary);
}

.insight-icon {
    font-size: var(--text-2xl);
}

.insight-text {
    flex: 1;
    color: var(--text-primary);
    line-height: var(--leading-relaxed);
}

.recommendations-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
}

.recommendation-item {
    padding: var(--spacing-lg);
    background: var(--gray-50);
    border-radius: var(--radius-md);
    border-top: 4px solid var(--primary);
}

.recommendation-priority {
    border-top-color: var(--danger);
}

.recommendation-quick-win {
    border-top-color: var(--success);
}

.recommendation-market-validation {
    border-top-color: var(--warning);
}

.recommendation-partnership {
    border-top-color: var(--secondary);
}

.recommendation-item h4 {
    font-size: var(--text-lg);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.recommendation-reason {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
}

.recommendation-ideas {
    list-style: none;
    padding: 0;
}

.recommendation-ideas li {
    padding: var(--spacing-xs) 0;
    color: var(--primary);
    font-weight: var(--font-medium);
}

@media (max-width: 767px) {
    .recommendations-list {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// 스타일 추가
document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', additionalStyles);
});