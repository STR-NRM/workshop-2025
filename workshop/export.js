import { escapeHtml } from '../common/utils.js';

// PDF 내보내기 기능
function exportToPdf(participantName, responses) {
    // 간단한 PDF 내보내기 구현 (브라우저 인쇄 API 사용)
    // 실제 PDF 생성을 위해서는 jsPDF 라이브러리를 사용할 수 있습니다
    
    // 인쇄용 스타일 적용
    const printContent = generatePrintContent(participantName, responses);
    
    // 새 창에서 인쇄
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>워크샵 응답 - ${participantName}</title>
            <style>
                @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css');
                
                body {
                    font-family: 'Pretendard', -apple-system, sans-serif;
                    line-height: 1.6;
                    color: #111827;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                
                h1 {
                    color: #6366f1;
                    font-size: 28px;
                    margin-bottom: 10px;
                    text-align: center;
                }
                
                .subtitle {
                    text-align: center;
                    color: #6b7280;
                    margin-bottom: 30px;
                }
                
                .participant-info {
                    background: #f3f4f6;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    text-align: center;
                }
                
                .agenda-section {
                    margin-bottom: 40px;
                    page-break-inside: avoid;
                }
                
                .agenda-title {
                    color: #4f46e5;
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e5e7eb;
                }
                
                .question-block {
                    margin-bottom: 25px;
                    page-break-inside: avoid;
                }
                
                .question {
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 10px;
                    font-size: 16px;
                }
                
                .answer {
                    color: #4b5563;
                    white-space: pre-wrap;
                    background: #f9fafb;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #6366f1;
                }
                
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    color: #9ca3af;
                    font-size: 14px;
                }
                
                @media print {
                    body {
                        padding: 20px;
                    }
                    
                    .agenda-section {
                        page-break-after: auto;
                    }
                    
                    h1 {
                        color: #000;
                    }
                    
                    .agenda-title {
                        color: #000;
                    }
                }
            </style>
        </head>
        <body>
            ${printContent}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    }
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function generatePrintContent(participantName, responses) {
    let content = `
        <h1>2025년 상반기 팀 워크샵</h1>
        <p class="subtitle">응답 결과 보고서</p>
        
        <div class="participant-info">
            <strong>참가자:</strong> ${participantName}<br>
            <strong>작성일:</strong> ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}
        </div>
    `;
    
    WORKSHOP_QUESTIONS.agendas.forEach(agenda => {
        content += `<div class="agenda-section">`;
        content += `<h2 class="agenda-title">안건 ${agenda.id}: ${agenda.title}</h2>`;
        
        agenda.questions.forEach(question => {
            const answer = responses[question.id] || '(응답 없음)';
            content += `
                <div class="question-block">
                    <div class="question">${question.text}</div>
                    <div class="answer">${escapeHtml(answer)}</div>
                </div>
            `;
        });
        
        content += `</div>`;
    });
    
    content += `
        <div class="footer">
            <p>이 문서는 2025년 상반기 AI 전략팀 워크샵에서 작성되었습니다.</p>
        </div>
    `;
    
    return content;
}

// jsPDF를 사용한 고급 PDF 내보내기 (옵션)
// CDN: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
function exportToPdfAdvanced(participantName, responses) {
    // jsPDF가 로드되어 있는지 확인
    if (typeof window.jspdf === 'undefined') {
        // jsPDF가 없으면 기본 인쇄 방식 사용
        exportToPdf(participantName, responses);
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // 폰트 설정 (한글 지원을 위해 필요)
    doc.setFont('helvetica');
    
    // 제목
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // Primary color
    doc.text('2025년 상반기 팀 워크샵', 105, 20, { align: 'center' });
    
    // 부제목
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray
    doc.text('응답 결과 보고서', 105, 30, { align: 'center' });
    
    // 참가자 정보
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`참가자: ${participantName}`, 20, 45);
    doc.text(`작성일: ${new Date().toLocaleDateString('ko-KR')}`, 20, 52);
    
    let yPosition = 65;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    
    // 각 안건별 응답 추가
    WORKSHOP_QUESTIONS.agendas.forEach((agenda, agendaIndex) => {
        // 페이지 확인
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }
        
        // 안건 제목
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229); // Primary dark
        doc.text(`안건 ${agenda.id}: ${agenda.title}`, margin, yPosition);
        yPosition += 10;
        
        agenda.questions.forEach((question, questionIndex) => {
            // 페이지 확인
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }
            
            // 질문
            doc.setFontSize(11);
            doc.setTextColor(55, 65, 81); // Gray-700
            const questionLines = doc.splitTextToSize(question.text, 170);
            doc.text(questionLines, margin, yPosition);
            yPosition += questionLines.length * lineHeight;
            
            // 답변
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99); // Gray-600
            const answer = responses[question.id] || '(응답 없음)';
            const answerLines = doc.splitTextToSize(answer, 170);
            
            // 답변 배경 (간단한 박스)
            doc.setDrawColor(229, 231, 235); // Gray-200
            doc.setLineWidth(0.5);
            doc.rect(margin, yPosition - 2, 170, answerLines.length * lineHeight + 4);
            
            doc.text(answerLines, margin + 2, yPosition + 3);
            yPosition += answerLines.length * lineHeight + 15;
        });
        
        yPosition += 10; // 안건 간 간격
    });
    
    // 푸터
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175); // Gray-400
        doc.text(
            `${i} / ${totalPages}`,
            105,
            pageHeight - 10,
            { align: 'center' }
        );
    }
    
    // PDF 저장
    doc.save(`workshop_responses_${participantName}_${Date.now()}.pdf`);
}