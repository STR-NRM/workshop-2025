// 결과 관련 추가 기능
class ResultsManager {
    constructor() {
        this.chartInstances = {};
    }
    
    // 상세 통계 계산
    calculateStatistics(evaluationData) {
        const stats = {
            totalEvaluators: Object.keys(evaluationData.evaluations).length,
            totalEvaluations: 0,
            criteriaAverages: {
                tech: [],
                demand: [],
                resource: [],
                market: []
            },
            categoryStats: {},
            topIdeas: [],
            consensusScore: 0
        };
        
        // 평가자별 통계
        Object.values(evaluationData.evaluations).forEach(user => {
            stats.totalEvaluations += Object.keys(user.evaluations).length;
            
            Object.values(user.evaluations).forEach(evaluation => {
                stats.criteriaAverages.tech.push(evaluation.scores.tech);
                stats.criteriaAverages.demand.push(evaluation.scores.demand);
                stats.criteriaAverages.resource.push(evaluation.scores.resource);
                stats.criteriaAverages.market.push(evaluation.scores.market);
            });
        });
        
        // 평균 계산
        Object.keys(stats.criteriaAverages).forEach(criteria => {
            const values = stats.criteriaAverages[criteria];
            if (values.length > 0) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
                stats.criteriaAverages[criteria] = {
                    average: avg,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    stdDev: Math.sqrt(variance),
                    count: values.length
                };
            }
        });
        
        // 카테고리별 통계
        evaluationData.ideas.forEach(idea => {
            const category = idea.category || '기타';
            if (!stats.categoryStats[category]) {
                stats.categoryStats[category] = {
                    count: 0,
                    totalScore: 0,
                    ideas: []
                };
            }
            
            const scores = this.calculateIdeaScore(idea.id, evaluationData.evaluations);
            if (scores.evaluationCount > 0) {
                stats.categoryStats[category].count++;
                stats.categoryStats[category].totalScore += scores.overall;
                stats.categoryStats[category].ideas.push({
                    id: idea.id,
                    title: idea.title,
                    score: scores.overall
                });
            }
        });
        
        // 카테고리 평균 계산
        Object.keys(stats.categoryStats).forEach(category => {
            const catStats = stats.categoryStats[category];
            catStats.average = catStats.count > 0 ? catStats.totalScore / catStats.count : 0;
            // 카테고리 내 아이디어 정렬
            catStats.ideas.sort((a, b) => b.score - a.score);
        });
        
        // 합의도 계산 (표준편차가 낮을수록 합의도가 높음)
        const allStdDevs = Object.values(stats.criteriaAverages)
            .filter(stat => stat.stdDev !== undefined)
            .map(stat => stat.stdDev);
        
        if (allStdDevs.length > 0) {
            const avgStdDev = allStdDevs.reduce((a, b) => a + b, 0) / allStdDevs.length;
            // 표준편차가 0-5 범위라고 가정하고 합의도 점수 계산
            stats.consensusScore = Math.max(0, Math.min(100, (1 - avgStdDev / 2.5) * 100));
        }
        
        return stats;
    }
    
    calculateIdeaScore(ideaId, allEvaluations) {
        const evaluations = [];
        
        Object.values(allEvaluations).forEach(user => {
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
    
    // 평가자 간 일치도 분석
    analyzeAgreement(evaluationData) {
        const agreementMatrix = {};
        const evaluators = Object.keys(evaluationData.evaluations);
        
        // 각 아이디어에 대한 평가자 간 점수 차이 계산
        evaluationData.ideas.forEach(idea => {
            const evaluatorScores = {};
            
            evaluators.forEach(evaluatorId => {
                const evaluation = evaluationData.evaluations[evaluatorId].evaluations[idea.id];
                if (evaluation) {
                    evaluatorScores[evaluatorId] = evaluation.scores;
                }
            });
            
            // 평가자 쌍별 점수 차이 계산
            const evaluatorIds = Object.keys(evaluatorScores);
            for (let i = 0; i < evaluatorIds.length; i++) {
                for (let j = i + 1; j < evaluatorIds.length; j++) {
                    const eval1 = evaluatorScores[evaluatorIds[i]];
                    const eval2 = evaluatorScores[evaluatorIds[j]];
                    
                    const diff = Math.abs(
                        ((eval1.tech + eval1.demand + eval1.resource + eval1.market) / 4) -
                        ((eval2.tech + eval2.demand + eval2.resource + eval2.market) / 4)
                    );
                    
                    const pairKey = `${evaluatorIds[i]}-${evaluatorIds[j]}`;
                    if (!agreementMatrix[pairKey]) {
                        agreementMatrix[pairKey] = [];
                    }
                    agreementMatrix[pairKey].push(diff);
                }
            }
        });
        
        // 평균 일치도 계산
        const agreementScores = {};
        Object.entries(agreementMatrix).forEach(([pair, diffs]) => {
            const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            // 차이가 작을수록 일치도가 높음 (5점 척도에서 평균 차이를 일치도로 변환)
            agreementScores[pair] = Math.max(0, (1 - avgDiff / 4) * 100);
        });
        
        return agreementScores;
    }
    
    // 아이디어 클러스터링 (유사 점수 패턴)
    clusterIdeas(evaluationData) {
        const clusters = {
            highPotential: [], // 모든 항목 높음
            techReady: [],     // 기술만 높음
            marketReady: [],   // 수요/시장 높음
            resourceHeavy: [], // 리소스만 낮음
            lowPotential: []   // 모든 항목 낮음
        };
        
        evaluationData.ideas.forEach(idea => {
            const scores = this.calculateIdeaScore(idea.id, evaluationData.evaluations);
            if (scores.evaluationCount === 0) return;
            
            const ideaInfo = {
                id: idea.id,
                title: idea.title,
                scores: scores
            };
            
            // 클러스터 분류 로직
            const avgScore = scores.overall;
            const techBias = scores.tech - avgScore;
            const marketBias = ((scores.demand + scores.market) / 2) - avgScore;
            const resourceBias = scores.resource - avgScore;
            
            if (avgScore >= 4) {
                clusters.highPotential.push(ideaInfo);
            } else if (avgScore <= 2) {
                clusters.lowPotential.push(ideaInfo);
            } else if (techBias > 0.5 && marketBias < -0.3) {
                clusters.techReady.push(ideaInfo);
            } else if (marketBias > 0.5 && techBias < -0.3) {
                clusters.marketReady.push(ideaInfo);
            } else if (resourceBias < -0.5) {
                clusters.resourceHeavy.push(ideaInfo);
            }
        });
        
        return clusters;
    }
    
    // 추천 시스템
    generateRecommendations(evaluationData) {
        const stats = this.calculateStatistics(evaluationData);
        const clusters = this.clusterIdeas(evaluationData);
        const recommendations = [];
        
        // 고잠재력 아이디어 추천
        if (clusters.highPotential.length > 0) {
            recommendations.push({
                type: 'priority',
                title: '우선 추진 추천',
                ideas: clusters.highPotential.slice(0, 3),
                reason: '모든 평가 항목에서 높은 점수를 받은 아이디어입니다.'
            });
        }
        
        // 빠른 실행 가능 아이디어
        if (clusters.techReady.length > 0) {
            recommendations.push({
                type: 'quick-win',
                title: '빠른 실행 가능',
                ideas: clusters.techReady.slice(0, 2),
                reason: '기술적으로 준비되어 있어 빠르게 시작할 수 있습니다.'
            });
        }
        
        // 시장 검증 필요
        if (clusters.marketReady.length > 0) {
            recommendations.push({
                type: 'market-validation',
                title: '시장 검증 우선',
                ideas: clusters.marketReady.slice(0, 2),
                reason: '수요는 높지만 기술 개발이 필요한 아이디어입니다.'
            });
        }
        
        // 파트너십 고려
        const resourceHeavyHighScore = clusters.resourceHeavy
            .filter(idea => idea.scores.overall > 3)
            .sort((a, b) => b.scores.overall - a.scores.overall);
            
        if (resourceHeavyHighScore.length > 0) {
            recommendations.push({
                type: 'partnership',
                title: '파트너십 추천',
                ideas: resourceHeavyHighScore.slice(0, 2),
                reason: '좋은 아이디어지만 리소스가 많이 필요합니다. 협업을 고려해보세요.'
            });
        }
        
        return recommendations;
    }
    
    // 인사이트 생성
    generateInsights(evaluationData) {
        const stats = this.calculateStatistics(evaluationData);
        const insights = [];
        
        // 평가 기준별 인사이트
        const criteriaOrder = Object.entries(stats.criteriaAverages)
            .sort((a, b) => (b[1].average || 0) - (a[1].average || 0));
        
        if (criteriaOrder[0][1].average - criteriaOrder[3][1].average > 1) {
            insights.push({
                type: 'criteria-gap',
                message: `${EVALUATION_CRITERIA[criteriaOrder[0][0]].name}은 평균 ${criteriaOrder[0][1].average.toFixed(1)}점으로 가장 높게 평가되었지만, ${EVALUATION_CRITERIA[criteriaOrder[3][0]].name}은 ${criteriaOrder[3][1].average.toFixed(1)}점으로 개선이 필요합니다.`
            });
        }
        
        // 합의도 인사이트
        if (stats.consensusScore > 80) {
            insights.push({
                type: 'high-consensus',
                message: '평가자들 간의 의견 일치도가 높습니다. 결과의 신뢰성이 높다고 볼 수 있습니다.'
            });
        } else if (stats.consensusScore < 50) {
            insights.push({
                type: 'low-consensus',
                message: '평가자들 간의 의견 차이가 큽니다. 추가 논의가 필요할 수 있습니다.'
            });
        }
        
        // 카테고리별 인사이트
        const topCategory = Object.entries(stats.categoryStats)
            .sort((a, b) => (b[1].average || 0) - (a[1].average || 0))[0];
        
        if (topCategory) {
            insights.push({
                type: 'category-strength',
                message: `'${topCategory[0]}' 카테고리의 아이디어들이 평균 ${topCategory[1].average.toFixed(1)}점으로 가장 높은 평가를 받았습니다.`
            });
        }
        
        return insights;
    }
}

// 전역 인스턴스 생성
const resultsManager = new ResultsManager();

// 차트 업데이트 함수 (charts.js에서 호출)
function prepareChartData(evaluationData) {
    const stats = resultsManager.calculateStatistics(evaluationData);
    const recommendations = resultsManager.generateRecommendations(evaluationData);
    const insights = resultsManager.generateInsights(evaluationData);
    
    return {
        stats: stats,
        recommendations: recommendations,
        insights: insights
    };
}