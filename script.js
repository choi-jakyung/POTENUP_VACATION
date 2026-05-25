const supabaseUrl = 'https://hpbklkbusmbdurkfkqgz.supabase.co'

const supabaseKey = 'sb_publishable_1Tsmq49PGPJAoOhxiQKPPw_bGCwDwJA'

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
)
console.log('Supabase 연결 성공');
// 아코디언 기능
const accordionButton = document.getElementById('courseAccordion');
const accordionContent = document.getElementById('courseContent');
const accordionItems = document.querySelectorAll('.accordion-item');

accordionButton.addEventListener('click', function () {
    accordionContent.classList.toggle('show');
    accordionButton.classList.toggle('active');
});

accordionItems.forEach(item => {
    item.addEventListener('click', function () {
        const courseName = this.getAttribute('data-course');
        accordionButton.textContent = courseName;
        accordionContent.classList.remove('show');
        accordionButton.classList.remove('active');
    });
});

// 아코디언 외부 클릭 시 닫기
document.addEventListener('click', function (event) {
    if (!accordionContainer.contains(event.target)) {
        accordionContent.classList.remove('show');
        accordionButton.classList.remove('active');
    }
});

const accordionContainer = document.querySelector('.accordion-container');

// 전화번호 010-0000-0000 형식 자동 포맷
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function (e) {
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

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // ⭐ 핵심 (누적 scale 제거)
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
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
clearButton.addEventListener('click', function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas();
});

const PDF_MARGIN_MM = 10;
const PDF_CAPTURE_SCALE = 3;
const PDF_LAYOUT_WIDTH_PX = 800;
const HTML2CANVAS_CDN = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
const JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';

function loadPdfScript(src, id) {
    return new Promise(function (resolve, reject) {
        if (id && document.getElementById(id)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = false;
        script.onload = function () { resolve(); };
        script.onerror = function () { reject(new Error(src)); };
        document.head.appendChild(script);
    });
}

async function ensurePdfLibraries() {
    if (typeof html2canvas !== 'function') {
        try {
            await loadPdfScript(HTML2CANVAS_CDN, 'lib-html2canvas');
        } catch (error) {
            console.error(error);
            return {
                ok: false,
                message: 'html2canvas를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 페이지를 새로고침해 주세요.'
            };
        }
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        try {
            await loadPdfScript(JSPDF_CDN, 'lib-jspdf');
        } catch (error) {
            console.error(error);
            return {
                ok: false,
                message: 'jsPDF를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 페이지를 새로고침해 주세요.'
            };
        }
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        return {
            ok: false,
            message: 'PDF 생성 모듈이 준비되지 않았습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.'
        };
    }

    return { ok: true };
}

function createPdfTextSpan(clonedDoc, text, className) {
    const span = clonedDoc.createElement('span');
    span.className = 'pdf-print-value ' + className;
    span.textContent = text;
    return span;
}

function preparePdfElementForCapture(root) {
    root.querySelectorAll('input.inline-input').forEach(function (input) {
        input.replaceWith(createPdfTextSpan(document, input.value, 'pdf-print-value--inline'));
    });

    root.querySelectorAll('input.input-field').forEach(function (input) {
        const valueClass = input.classList.contains('application-field')
            ? 'pdf-print-value--application'
            : 'pdf-print-value--field';
        input.replaceWith(createPdfTextSpan(document, input.value, valueClass));
    });

    const courseBtn = root.querySelector('#courseAccordion');
    if (courseBtn) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'pdf-course-value';
        courseDiv.textContent = courseBtn.textContent.trim();
        courseBtn.replaceWith(courseDiv);
    }

    const courseContent = root.querySelector('#courseContent');
    if (courseContent) {
        courseContent.remove();
    }

    const clearBtn = root.querySelector('#clearSignature');
    if (clearBtn) {
        clearBtn.remove();
    }

    const originalCanvas = document.getElementById('signatureCanvas');
    const clonedCanvas = root.querySelector('#signatureCanvas');
    if (originalCanvas && clonedCanvas) {
        const signatureImg = document.createElement('img');
        signatureImg.className = 'pdf-signature-img';
        signatureImg.alt = '서명';
        signatureImg.src = originalCanvas.toDataURL('image/png');
        clonedCanvas.replaceWith(signatureImg);
    }
}

async function createPdfBlobFromElement(sourceElement) {
    const libs = await ensurePdfLibraries();
    if (!libs.ok) {
        return { ok: false, message: libs.message };
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-capture-wrapper';
    const clone = sourceElement.cloneNode(true);
    preparePdfElementForCapture(clone);
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    let canvas;

    try {
        await new Promise(function (resolve) { setTimeout(resolve, 200); });
        await new Promise(function (resolve) { requestAnimationFrame(resolve); });

        const targetHeight = clone.scrollHeight;
        const targetWidth = clone.scrollWidth;

        console.log('[PDF] 캡처 대상 크기(px)', {
            width: targetWidth,
            height: targetHeight
        });

        canvas = await html2canvas(clone, {
            scale: PDF_CAPTURE_SCALE,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: '#ffffff',
            width: targetWidth,
            height: targetHeight,
            windowWidth: targetWidth,
            windowHeight: targetHeight
        });
    } finally {
        wrapper.remove();
    }

    const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - PDF_MARGIN_MM * 2;
    const maxHeight = pageHeight - PDF_MARGIN_MM * 2;
    const imgData = canvas.toDataURL('image/png');

    const aspect = canvas.height / canvas.width;
    let renderWidth = maxWidth;
    let renderHeight = renderWidth * aspect;

    if (renderHeight > maxHeight) {
        const fitScale = maxHeight / renderHeight;
        renderWidth *= fitScale;
        renderHeight *= fitScale;
    }

    const offsetX = PDF_MARGIN_MM + (maxWidth - renderWidth) / 2;
    const offsetY = PDF_MARGIN_MM;

    console.log('[PDF] 캡처 비율', {
        canvasPx: { w: canvas.width, h: canvas.height, aspect: aspect },
        renderMm: { w: renderWidth, h: renderHeight },
        offsetMm: { x: offsetX, y: offsetY }
    });

    pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight);

    const blob = pdf.output('blob');
    if (!blob || blob.size === 0) {
        return { ok: false, message: 'PDF 파일 생성에 실패했습니다. 다시 시도해 주세요.' };
    }

    return { ok: true, blob: blob };
}

function logSupabaseError(step, error, extra) {
    const lines = [
        `[Supabase:${step}] 요청 실패`,
        `  message: ${error?.message ?? '(없음)'}`,
        `  code: ${error?.code ?? '(없음)'}`,
        `  statusCode: ${error?.statusCode ?? error?.status ?? '(없음)'}`,
        `  details: ${error?.details ?? '(없음)'}`,
        `  hint: ${error?.hint ?? '(없음)'}`
    ];

    const msg = (error?.message || '').toLowerCase();
    const code = String(error?.code || error?.statusCode || error?.status || '');

    if (
        msg.includes('row-level security') ||
        msg.includes('rls') ||
        msg.includes('permission denied') ||
        msg.includes('not authorized') ||
        code === '42501' ||
        code === '403' ||
        error?.statusCode === 403 ||
        error?.status === 403
    ) {
        lines.push('  → RLS(행 수준 보안) 정책으로 거부된 것으로 보입니다.');
        if (step === 'storage-upload') {
            lines.push('  → Storage 버킷 "leave-pdfs"에 INSERT 정책(anon/authenticated)이 있는지 확인하세요.');
        }
        if (step === 'db-insert') {
            lines.push('  → 테이블 "leave_requests"에 INSERT 정책(anon/authenticated)이 있는지 확인하세요.');
        }
    }

    if (msg.includes('bucket not found') || msg.includes('object not found')) {
        lines.push('  → Storage 버킷 "leave-pdfs" 이름·존재 여부를 확인하세요.');
    }

    if (msg.includes('jwt') || msg.includes('apikey') || msg.includes('invalid key')) {
        lines.push('  → Supabase API 키(anon/publishable)가 올바른지 확인하세요.');
    }

    if (extra) {
        lines.push('  extra:', extra);
    }

    console.error(lines.join('\n'));
    console.error(`[Supabase:${step}] raw error 객체:`, error);
}

function getSupabaseFailMessage(step, error) {
    const base = formatSupabaseError(step, error);
    if ((error?.message || '').toLowerCase().includes('row-level security') || error?.statusCode === 403) {
        return `${base}\n\nRLS 정책을 Supabase 대시보드에서 확인해 주세요.`;
    }
    return base;
}

function formatSupabaseError(step, error) {
    if (step === 'storage-upload') {
        return 'PDF Storage 업로드에 실패했습니다.';
    }
    if (step === 'db-insert') {
        return '휴가 신청 DB 저장에 실패했습니다.';
    }
    return `Supabase ${step} 단계에서 실패했습니다.`;
}

document.getElementById('generatePDF').addEventListener('click', async function () {
    const button = this;
    const originalText = button.textContent;
    const element = document.querySelector('#pdfSource');

    button.disabled = true;
    button.textContent = 'PDF 제출 중...';

    accordionContent.classList.remove('show');
    accordionButton.classList.remove('active');
    document.body.classList.add('pdf-capture');

    function finish() {
        document.body.classList.remove('pdf-capture');
        button.disabled = false;
        button.textContent = originalText;
    }

    const pageContainer = document.querySelector('.container');
    const prevContainerOverflow = pageContainer.style.overflow;
    pageContainer.style.overflow = 'visible';

    try {
        console.log('[제출 1/4] PDF blob 생성 시작');

        const pdfResult = await createPdfBlobFromElement(element);
        if (!pdfResult.ok) {
            console.error('[제출 1/4] PDF blob 생성 실패:', pdfResult.message);
            alert(pdfResult.message);
            return;
        }

        const pdfBlob = pdfResult.blob;
        if (!pdfBlob || pdfBlob.size === 0) {
            console.error('[제출 1/4] PDF blob이 비어 있습니다.', { pdfBlob });
            alert('PDF 파일이 비어 있어 제출할 수 없습니다.');
            return;
        }

        console.log('[제출 1/4] PDF blob 생성 완료', {
            type: pdfBlob.type,
            size: pdfBlob.size
        });

        const fileName = `leave_${Date.now()}.pdf`;
        console.log('[제출 2/4] Storage 업로드 시작', {
            bucket: 'leave-pdfs',
            fileName: fileName
        });

        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('leave-pdfs')
            .upload(fileName, pdfBlob, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            logSupabaseError('storage-upload', uploadError, { fileName, bucket: 'leave-pdfs' });
            alert(getSupabaseFailMessage('storage-upload', uploadError) + '\n\n콘솔(F12)에서 상세 오류를 확인하세요.');
            return;
        }

        if (!uploadData || !uploadData.path) {
            console.error('[제출 2/4] Storage 업로드 응답 data 없음', { uploadData, uploadError });
            alert('PDF 업로드 응답이 비정상입니다. 콘솔(F12) 로그를 확인해 주세요.');
            return;
        }

        console.log('[제출 2/4] Storage 업로드 완료', uploadData);

        console.log('[제출 3/4] public URL 생성 시작', { path: uploadData.path });

        const { data: urlData } = supabaseClient.storage
            .from('leave-pdfs')
            .getPublicUrl(uploadData.path);

        const pdfUrl = urlData?.publicUrl;
        if (!pdfUrl) {
            console.error('[제출 3/4] public URL 생성 실패', { urlData, path: uploadData.path });
            alert('PDF 공개 URL을 만들지 못했습니다. Storage 버킷 public 설정을 확인해 주세요.');
            return;
        }

        console.log('[제출 3/4] public URL 생성 완료', { pdfUrl });

        const name = document.getElementById('name').value.trim();
        const startDate = document.getElementById('startDate').value.trim();
        const endDate = document.getElementById('endDate').value.trim();
        const leaveType = accordionButton.textContent.trim();

        const insertPayload = {
            name,
            leave_type: leaveType,
            start_date: startDate,
            end_date: endDate,
            pdf_url: pdfUrl
        };
        

        console.log('[제출 4/4] DB insert 시작', insertPayload);

        const { data: insertData, error: dbError } = await supabaseClient
            .from('leave_requests')
            .insert([insertPayload])
            .select();

        if (dbError) {
            logSupabaseError('db-insert', dbError, { insertPayload });
            alert(getSupabaseFailMessage('db-insert', dbError) + '\n\n콘솔(F12)에서 상세 오류를 확인하세요.');
            return;
        }

        if (!insertData || insertData.length === 0) {
            console.error('[제출 4/4] DB insert 응답 data 없음', { insertData, dbError, insertPayload });
            console.error('  → INSERT는 통과했으나 .select() 결과가 비었습니다. leave_requests 테이블 SELECT RLS 정책을 확인하세요.');
            alert(
                'DB 저장 결과를 확인하지 못했습니다.\n' +
                'INSERT/SELECT RLS 정책을 Supabase에서 확인해 주세요.\n\n' +
                '콘솔(F12)에서 [제출 4/4] 로그를 확인하세요.'
            );
            return;
        }

        console.log('[제출 4/4] DB insert 완료', insertData);

await fetch('https://n8n-bizdev.wanted.jobs/webhook-test/leave-request', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(insertPayload)
});

console.log('[Webhook] n8n 호출 완료');
        
        console.log('[제출 완료] Storage + DB 저장 성공', {
            fileName,
            pdfUrl,
            rowId: insertData[0]?.id ?? null
        });

        alert('휴가 신청서가 제출되었습니다!');
    } catch (error) {
        console.error('[제출 예외] 처리 중 오류 발생:', error);
        alert('PDF 제출 중 오류가 발생했습니다. 콘솔(F12) 로그를 확인해 주세요.');
    } finally {
        pageContainer.style.overflow = prevContainerOverflow;
        finish();
    }
});