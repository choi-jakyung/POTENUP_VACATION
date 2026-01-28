// 아코디언 기능
const accordionButton = document.getElementById('courseAccordion');
const accordionContent = document.getElementById('courseContent');
const accordionItems = document.querySelectorAll('.accordion-item');

accordionButton.addEventListener('click', function() {
    accordionContent.classList.toggle('show');
    accordionButton.classList.toggle('active');
});

accordionItems.forEach(item => {
    item.addEventListener('click', function() {
        const courseName = this.getAttribute('data-course');
        accordionButton.textContent = courseName;
        accordionContent.classList.remove('show');
        accordionButton.classList.remove('active');
    });
});

// 아코디언 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    if (!accordionContainer.contains(event.target)) {
        accordionContent.classList.remove('show');
        accordionButton.classList.remove('active');
    }
});

const accordionContainer = document.querySelector('.accordion-container');

// 전화번호 010-0000-0000 형식 자동 포맷
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 3 && v.length <= 7) {
        v = v.slice(0, 3) + '-' + v.slice(3);
    } else if (v.length > 7) {
        v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11);
    }
    e.target.value = v;
});

// 서명 기능
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearSignature');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// 캔버스 크기 조정 (고해상도 디스플레이 대응)
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // 실제 캔버스 크기 설정
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // 컨텍스트 스케일 조정 (논리적 좌표계로 변환)
    ctx.scale(dpr, dpr);
    
    // 스타일 재설정
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 마우스 이벤트
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// 터치 이벤트 (모바일 지원)
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });
canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

function getEventPos(e) {
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    // 캔버스의 표시 크기 기준으로 좌표 계산 (ctx.scale이 이미 적용되어 있으므로)
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    return { x, y };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getEventPos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getEventPos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    lastX = pos.x;
    lastY = pos.y;
}

function stopDrawing(e) {
    if (e) e.preventDefault();
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    if (e.type === 'touchstart') {
        startDrawing(e);
    } else if (e.type === 'touchmove') {
        draw(e);
    } else if (e.type === 'touchend' || e.type === 'touchcancel') {
        stopDrawing(e);
    }
}

// 서명 지우기
clearButton.addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas();
});

// PDF 변환 기능 (화면 그대로 캡처하여 한글 깨짐 방지)
document.getElementById('generatePDF').addEventListener('click', function() {
    const button = this;
    const originalText = button.textContent;
    
    // 로딩 상태 표시
    button.disabled = true;
    button.textContent = 'PDF 생성 중...';
    
    accordionContent.classList.remove('show');
    accordionButton.classList.remove('active');
    document.body.classList.add('pdf-capture');
    
    const element = document.querySelector('.container');
    
    // 모바일 감지
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 1.5 : 2;
    
    var done = function() {
        document.body.classList.remove('pdf-capture');
        button.disabled = false;
        button.textContent = originalText;
    };
    
    requestAnimationFrame(function() {
        html2pdf().set({
            margin: isMobile ? [5, 5, 5, 5] : [10, 10, 10, 10],
            filename: '휴가신청서.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: scale,
                useCORS: true,
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save().then(done).catch(function(error) {
            console.error('PDF 생성 오류:', error);
            alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            done();
        });
    });
});
