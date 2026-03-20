// Wizard State Management
const state = {
    currentStep: 0,
    answers: {
        location: null,
        careLevel: null
    },
    recommendations: [],
    direction: 'forward'
};

const STEP_TRANSITION_MS = 360;
const STEP_FEEDBACK_MS = 220;

let pendingStepTimer = null;
let transitionCleanupTimer = null;

// Plan Catalog
const PLAN_CATALOG = {
    vip: {
        key: 'vip',
        name: 'VIP',
        badge: 'BEST',
        title: 'VIP 풀케어',
        subtitle: '입양 및 평생 건강 프리미엄 솔루션',
        price: '160,000원',
        value: '304만원+',
        href: 'membership_vip_detail.html',
        features: [
            '필수 예방접종 (강아지 6회/고양이 4회)',
            '중성화 수술 (5kg 미만)',
            '심장사상충 예방 (12회)',
            '기초 건강검진 + 항체가 검사',
            '유기농 사료+패드+간식 배송',
            '가르쳐 주오 (방문 훈련 1회)',
            '주오몰 최고 등급 (30% 할인)'
        ],
        theme: 'vip'
    },
    gold: {
        key: 'gold',
        name: 'Gold',
        badge: 'SPECIAL',
        title: 'Gold 케어',
        subtitle: '유기견/성견 질병 케어 특화',
        price: '70,000원',
        value: '75만원+',
        href: 'membership_gold_detail.html',
        features: [
            '질병/상해 의료비 지원 (30만원)',
            '기초 건강검진',
            '동물등록 내장형칩',
            '주오몰 20% 할인',
            '종합 건강검진 전환 가능'
        ],
        theme: 'gold'
    },
    silver: {
        key: 'silver',
        name: 'Silver',
        badge: 'POPULAR',
        title: 'Silver 케어',
        subtitle: '수도권 기본 의료 완비',
        price: '100,000원',
        value: '132만원+',
        href: 'membership_silver_detail.html',
        features: [
            '필수 예방접종 (강아지 6회/고양이 4회)',
            '중성화 수술 (5kg 미만)',
            '항체가 검사',
            '동물등록 내장형칩',
            '주오몰 20% 할인',
            '2년차 전환: 종합 검진, 방문 훈련'
        ],
        theme: 'silver'
    },
    white: {
        key: 'white',
        name: 'White',
        badge: 'BASIC',
        title: 'White 케어',
        subtitle: '지방 실속 생활 케어',
        price: '100,000원',
        value: '147만원+',
        href: 'membership_white_detail.html',
        features: [
            '심장사상충 예방 (12회)',
            '기초 건강검진',
            '유기농 사료+패드+간식 배송',
            '동물등록 내장형칩',
            '주오몰 20% 할인'
        ],
        theme: 'white'
    }
};

// Step Configuration
const STEP_CONFIG = [
    { id: 0, name: '시작', label: '시작' },
    { id: 1, name: '지역', label: '지역' },
    { id: 2, name: '케어', label: '케어' },
    { id: 3, name: '결과', label: '결과' }
];

// Helper: Format Money
function formatMoney(amount) {
    if (amount >= 10000) {
        const man = Math.floor(amount / 10000);
        const chun = Math.floor((amount % 10000) / 1000);
        return `${man}만${chun > 0 ? chun + '천' : ''}`;
    }
    return amount.toLocaleString();
}

// Get DOM Elements
function getElements() {
    return {
        wizard: document.getElementById('wizard'),
        wizardStage: document.getElementById('wizard-stage'),
        steps: document.querySelectorAll('.wizard-step'),
        resultsContainer: document.getElementById('results-container'),
        resultTemplate: document.getElementById('result-card-template'),
        announcer: document.getElementById('wizard-announcer')
    };
}

// Recommendation Logic
function getRecommendations(answers) {
    const { location, careLevel } = answers;
    let recommendations = [];

    if (location === 'capital') {
        if (careLevel === 'premium') {
            recommendations = ['vip', 'silver', 'white'];
        } else if (careLevel === 'adult_care') {
            recommendations = ['vip', 'silver', 'white', 'gold'];
        }
    } else if (location === 'regional') {
        if (careLevel === 'premium') {
            recommendations = ['vip', 'white'];
        } else if (careLevel === 'adult_care') {
            recommendations = ['vip', 'white', 'gold'];
        }
    }

    return recommendations;
}

// Get Plan Href
function getPlanHref(planKey) {
    return PLAN_CATALOG[planKey]?.href || '#';
}

function clearPendingStepTimer() {
    if (pendingStepTimer) {
        clearTimeout(pendingStepTimer);
        pendingStepTimer = null;
    }
}

function queueStepChange(callback, delay = STEP_FEEDBACK_MS) {
    clearPendingStepTimer();
    pendingStepTimer = setTimeout(() => {
        pendingStepTimer = null;
        callback();
    }, delay);
}

function resetStepClasses(step) {
    step.classList.remove(
        'is-active',
        'is-exiting',
        'enter-from-right',
        'enter-from-left',
        'exit-to-left',
        'exit-to-right'
    );
}

// Navigation Functions
function goToStep(stepIndex, direction = 'forward') {
    const elements = getElements();
    const totalSteps = STEP_CONFIG.length;

    // Validate step index
    if (stepIndex < 0 || stepIndex >= totalSteps) return;

    // Check if can proceed
    if (direction === 'forward' && !canProceedToStep(stepIndex)) return;

    // Update state
    state.direction = direction;
    const previousStep = state.currentStep;
    state.currentStep = stepIndex;

    // Render
    renderStepTransition(elements, previousStep, stepIndex);

    // Announce for accessibility
    announceStep(elements, stepIndex);

    // Sync history
    syncHistory(stepIndex);
}

function goBack() {
    clearPendingStepTimer();
    if (state.currentStep > 0) {
        goToStep(state.currentStep - 1, 'back');
    }
}

function restartWizard() {
    clearPendingStepTimer();
    const previousStep = state.currentStep;

    // Reset state
    state.currentStep = 0;
    state.answers = { location: null, careLevel: null };
    state.recommendations = [];
    state.direction = 'back';

    // Reset UI
    const elements = getElements();

    // Clear selections
    document.querySelectorAll('.option-card.is-selected').forEach(card => {
        card.classList.remove('is-selected');
    });

    // Go to first step
    renderStepTransition(elements, previousStep, 0);

    // Sync history
    syncHistory(0);
}

function canProceedToStep(stepIndex) {
    if (stepIndex === 0) return true;
    if (stepIndex === 1) return true; // Can always go to location question
    if (stepIndex === 2) return state.answers.location !== null;
    if (stepIndex === 3) {
        return state.answers.location !== null && state.answers.careLevel !== null;
    }
    return false;
}

function selectLocation(value) {
    state.answers.location = value;
    
    // Update UI
    document.querySelectorAll('[data-option="location"]').forEach(card => {
        card.classList.toggle('is-selected', card.dataset.value === value);
    });

    // Keep the selected state visible briefly, then move forward once.
    queueStepChange(() => {
        goToStep(2, 'forward');
    });
}

function selectCare(value) {
    state.answers.careLevel = value;

    // Update UI
    document.querySelectorAll('[data-option="care"]').forEach(card => {
        card.classList.toggle('is-selected', card.dataset.value === value);
    });

    // Calculate recommendations
    state.recommendations = getRecommendations(state.answers);
    
    // Update tab visibility based on recommendations
    updateTabVisibility(state.recommendations);
    
    // Select the first recommendation by default
    switchTab(state.recommendations[0]);

    // Keep the selected state visible briefly, then show results once.
    queueStepChange(() => {
        renderResults(getElements());
        goToStep(3, 'forward');
    });
}

function updateTabVisibility(recommendations) {
    document.querySelectorAll('.tab-btn').forEach(tab => {
        const plan = tab.dataset.tab;
        if (recommendations.includes(plan)) {
            tab.style.display = 'flex';
        } else {
            tab.style.display = 'none';
        }
    });
}

// Rendering Functions
function renderStepTransition(elements, fromStep, toStep) {
    const { steps } = elements;
    const fromStepEl = steps[fromStep];
    const toStepEl = steps[toStep];

    if (!toStepEl) return;

    if (transitionCleanupTimer) {
        clearTimeout(transitionCleanupTimer);
        transitionCleanupTimer = null;
    }

    steps.forEach((step, index) => {
        resetStepClasses(step);
        step.hidden = index !== fromStep && index !== toStep;
    });

    if (!fromStepEl || fromStep === toStep) {
        toStepEl.hidden = false;
        toStepEl.classList.add('is-active');
        return;
    }

    const exitClass = state.direction === 'forward' ? 'exit-to-left' : 'exit-to-right';
    const enterClass = state.direction === 'forward' ? 'enter-from-right' : 'enter-from-left';

    fromStepEl.hidden = false;
    fromStepEl.classList.add('is-exiting', exitClass);
    toStepEl.hidden = false;
    
    requestAnimationFrame(() => {
        toStepEl.classList.add('is-active', enterClass);
    });

    transitionCleanupTimer = setTimeout(() => {
        fromStepEl.hidden = true;
        resetStepClasses(fromStepEl);
        toStepEl.classList.remove('enter-from-right', 'enter-from-left');
        toStepEl.classList.add('is-active');
        transitionCleanupTimer = null;
    }, STEP_TRANSITION_MS);
}

function renderResults(elements) {
    // Get primary recommendation (first one)
    const planKey = state.recommendations[0];
    if (!planKey) return;
    
    const plan = PLAN_CATALOG[planKey];
    if (!plan) return;
    
    // Parse price (remove '원' and commas)
    const monthlyPrice = parseInt(plan.price.replace(/[^0-9]/g, ''));
    const yearlyPrice = monthlyPrice * 12;
    
    // Parse benefit value
    const benefitValue = plan.value;
    const benefitNum = parseInt(benefitValue.replace(/[^0-9]/g, ''));
    const benefitUnit = benefitValue.includes('만') ? 10000 : 1;
    const totalBenefit = benefitNum * benefitUnit;
    
    // Calculate savings (estimated: benefit - yearly price)
    const savings = totalBenefit - yearlyPrice;
    const savingsText = savings >= 10000 ? `${Math.floor(savings / 10000)}만${savings % 10000 > 0 ? (savings % 10000) / 1000 + '천' : ''}` : `${savings.toLocaleString()}`;
    
    // Calculate ROI
    const roi = Math.round((totalBenefit / yearlyPrice) * 100);
    
    // Update dashboard header
    const planNameEl = document.getElementById('dashboard-plan-name');
    const reasonEl = document.getElementById('dashboard-reason');
    if (planNameEl) planNameEl.textContent = plan.title;
    if (reasonEl) {
        reasonEl.textContent = plan.subtitle;
    }

    // Update main card
    const tierEl = document.getElementById('membership-tier');
    const monthlyEl = document.getElementById('price-monthly');
    const detailsBtn = document.getElementById('btn-details');
    
    if (tierEl) tierEl.textContent = plan.name;
    if (monthlyEl) monthlyEl.textContent = plan.price.replace('/월', '').replace('원', '');
    if (detailsBtn) detailsBtn.href = plan.href;
    
    // Update stats row
    const statMonthlyEl = document.getElementById('stat-monthly');
    const statYearlyEl = document.getElementById('stat-yearly');
    const savingsEl = document.getElementById('savings-amount');
    
    if (statMonthlyEl) statMonthlyEl.textContent = `${formatMoney(monthlyPrice)}원`;
    if (statYearlyEl) statYearlyEl.textContent = `${formatMoney(totalBenefit)}원`;
    if (savingsEl) savingsEl.textContent = `${formatMoney(savings)}원`;
    
    // Update quick benefits (top 4)
    const benefitsContainer = document.getElementById('quick-benefits');
    if (benefitsContainer) {
        benefitsContainer.innerHTML = plan.features.slice(0, 4).map(feature => `
            <div class="benefit-item">
                <i data-lucide="check-circle-2"></i>
                <span>${feature}</span>
            </div>
        `).join('');
    }
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function announceStep(elements, stepIndex) {
    const { announcer } = elements;
    const stepName = STEP_CONFIG[stepIndex]?.name || '';
    announcer.textContent = `${stepName} 단계로 이동했습니다.`;
}

// History Management
function syncHistory(stepIndex) {
    const url = new URL(window.location.href);
    url.searchParams.set('step', stepIndex);
    window.history.pushState({ step: stepIndex }, '', url);
}

function handlePopState(event) {
    if (event.state && typeof event.state.step === 'number') {
        const targetStep = event.state.step;
        const direction = targetStep < state.currentStep ? 'back' : 'forward';
        goToStep(targetStep, direction);
    }
}

// Event Handlers
function handleActionClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;

    switch (action) {
        case 'start':
            goToStep(1, 'forward');
            break;
        case 'select-location': {
            const locationValue = button.dataset.value;
            selectLocation(locationValue);
            break;
        }
        case 'select-care': {
            const careValue = button.dataset.value;
            selectCare(careValue);
            break;
        }
        case 'toggle-counseling':
            toggleCounselingForm();
            break;
        case 'save-customer':
            saveCustomerInfo();
            break;
        case 'print-quote':
            printQuote();
            break;
        case 'share-result':
            shareResult();
            break;
        case 'start-consult':
            startConsultation();
            break;
        case 'switch-tab': {
            const tabPlan = button.dataset.tab;
            switchTab(tabPlan);
            break;
        }
        case 'back':
            goBack();
            break;
        case 'restart':
            restartWizard();
            break;
    }
}

// Tab Switching
function switchTab(planKey) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.toggle('is-active', tab.dataset.tab === planKey);
    });
    
    // Update dashboard content
    const plan = PLAN_CATALOG[planKey];
    if (!plan) return;
    
    // Update header
    const planNameEl = document.getElementById('dashboard-plan-name');
    if (planNameEl) planNameEl.textContent = plan.title;
    
    // Update main card
    const tierEl = document.getElementById('membership-tier');
    const monthlyEl = document.getElementById('price-monthly');
    const detailsBtn = document.getElementById('btn-details');
    
    if (tierEl) tierEl.textContent = plan.name;
    if (monthlyEl) monthlyEl.textContent = plan.price.replace('/월', '').replace('원', '');
    if (detailsBtn) detailsBtn.href = plan.href;
    
    // Update stats row
    const monthlyPrice = parseInt(plan.price.replace(/[^0-9]/g, ''));
    const benefitNum = parseInt(plan.value.replace(/[^0-9]/g, ''));
    const benefitUnit = plan.value.includes('만') ? 10000 : 1;
    const totalBenefit = benefitNum * benefitUnit;
    
    const statMonthlyEl = document.getElementById('stat-monthly');
    const statYearlyEl = document.getElementById('stat-yearly');
    const savingsEl = document.getElementById('savings-amount');
    
    const savings = totalBenefit - (monthlyPrice * 12);
    const savingsText = savings >= 10000 ? 
        `${Math.floor(savings / 10000)}만${savings % 10000 > 0 ? Math.floor((savings % 10000) / 1000) + '천' : ''}` : 
        `${savings.toLocaleString()}`;
        
    if (statMonthlyEl) statMonthlyEl.textContent = `${formatMoney(monthlyPrice)}원`;
    if (statYearlyEl) statYearlyEl.textContent = `${formatMoney(totalBenefit)}원`;
    if (savingsEl) savingsEl.textContent = `${formatMoney(savings)}원`;
    
    // Update quick benefits
    const benefitsContainer = document.getElementById('quick-benefits');
    if (benefitsContainer) {
        benefitsContainer.innerHTML = plan.features.slice(0, 4).map(feature => `
            <div class="benefit-item">
                <i data-lucide="check-circle-2"></i>
                <span>${feature}</span>
            </div>
        `).join('');
    }
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Dashboard Functions
function toggleCounselingForm() {
    const form = document.getElementById('counseling-form');
    const toggle = document.querySelector('[data-action="toggle-counseling"]');
    if (form && toggle) {
        const isHidden = form.hidden;
        form.hidden = !isHidden;
        toggle.classList.toggle('is-open', isHidden);
    }
}

function saveCustomerInfo() {
    const name = document.getElementById('customer-name')?.value;
    const phone = document.getElementById('customer-phone')?.value;
    const petName = document.getElementById('pet-name')?.value;
    const petAge = document.getElementById('pet-age')?.value;
    const notes = document.getElementById('counselor-notes')?.value;
    
    if (!name && !phone) {
        alert('고객명과 연락처를 입력해주세요.');
        return;
    }
    
    const customerData = {
        name,
        phone,
        petName,
        petAge,
        notes,
        recommendation: state.recommendations[0],
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('juo_counselings') || '[]');
    saved.push(customerData);
    localStorage.setItem('juo_counselings', JSON.stringify(saved));
    
    alert('상담 정보가 저장되었습니다.');
}

function getActivePlanKey() {
    const activeTab = document.querySelector('.tab-btn.is-active');
    return activeTab ? activeTab.dataset.tab : state.recommendations[0];
}

function printQuote() {
    const planKey = getActivePlanKey();
    const plan = PLAN_CATALOG[planKey];
    if (!plan) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>JUO 멤버십 견적서 - ${plan.name}</title>
            <style>
                body { font-family: 'Pretendard', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                h1 { color: #18243f; border-bottom: 3px solid #FF7A00; padding-bottom: 10px; }
                .plan-name { font-size: 24px; font-weight: bold; color: #FF7A00; margin: 20px 0; }
                .price { font-size: 32px; font-weight: bold; color: #18243f; margin: 10px 0; }
                .features { margin: 20px 0; }
                .features li { margin: 8px 0; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>JUO Total Pet Care</h1>
            <div class="plan-name">${plan.name} 멤버십</div>
            <div class="price">${plan.price}/월</div>
            <p>연간 혜택 가치: ${plan.value}</p>
            <div class="features">
                <h3>주요 혜택</h3>
                <ul>
                    ${plan.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>
            <div class="footer">
                <p>문의: 1588-0000 | 주오컴퍼니</p>
                <p>본 견적서는 상담용입니다.</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function shareResult() {
    const planKey = getActivePlanKey();
    const plan = PLAN_CATALOG[planKey];
    if (!plan) return;
    
    const shareText = `JUO ${plan.name} 멤버십 추천! 월 ${plan.price}으로 ${plan.value} 혜택을 누려보세요.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'JUO 멤버십 추천',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Copy to clipboard
        navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
            alert('클립보드에 복사되었습니다.');
        });
    }
}

function startConsultation() {
    const planKey = getActivePlanKey();
    const plan = PLAN_CATALOG[planKey];
    if (plan) {
        window.open(plan.href, '_blank');
    }
}

// Bind Events
function bindEvents() {
    const wizard = document.getElementById('wizard');

    if (wizard) {
        wizard.addEventListener('click', handleActionClick);
    }

    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState);
}

// Initialize
function init() {
    const elements = getElements();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Bind events
    bindEvents();
    bindCompareModal();

    // Check URL for step parameter
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    let startStep = 0; // Default: start from landing (step 0)
    
    if (stepParam !== null) {
        const stepIndex = parseInt(stepParam, 10);
        if (!isNaN(stepIndex) && stepIndex >= 0 && stepIndex < STEP_CONFIG.length) {
            startStep = stepIndex;
        }
    }
    
    // Set initial state without animation
    state.currentStep = startStep;

    // Show the target step immediately without animation
    const { steps } = elements;

    // Update step visibility
    steps.forEach((step, index) => {
        step.hidden = index !== startStep;
        step.classList.remove('is-exiting', 'exit-to-left', 'exit-to-right', 'enter-from-right', 'enter-from-left');
        if (index === startStep) {
            step.classList.add('is-active');
        } else {
            step.classList.remove('is-active');
        }
    });

    // Only sync history if step is explicitly set in URL
    // Don't modify URL on initial load to avoid file:// protocol issues
    if (stepParam !== null) {
        syncHistory(startStep);
    }
}

// Compare modal
function openComparisonTable() {
    const modal = document.getElementById('compare-modal');
    if (!modal) return;

    document.querySelectorAll('.compare-pill').forEach(pill => {
        const plan = pill.dataset.compare;
        if (state.recommendations.includes(plan)) {
            pill.style.display = '';
            pill.classList.add('is-active');
        } else {
            pill.style.display = 'none';
            pill.classList.remove('is-active');
        }
    });

    modal.hidden = false;
}

function closeCompareModal() {
    const modal = document.getElementById('compare-modal');
    if (modal) modal.hidden = true;
}

function bindCompareModal() {
    const backdrop = document.getElementById('compare-backdrop');
    const cancelBtn = document.getElementById('compare-cancel');
    const openBtn = document.getElementById('compare-open');
    const pills = document.querySelectorAll('.compare-pill');
    const MIN = 2;

    if (backdrop) backdrop.addEventListener('click', closeCompareModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeCompareModal);

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const activeCount = document.querySelectorAll('.compare-pill.is-active').length;
            if (pill.classList.contains('is-active') && activeCount <= MIN) return;
            pill.classList.toggle('is-active');
        });
    });

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            const selected = [...document.querySelectorAll('.compare-pill.is-active')]
                .map(p => p.dataset.compare);
            
            openFullscreenCompare(selected);
            closeCompareModal();
        });
    }

    // Fullscreen Compare Logic
    const fullscreenModal = document.getElementById('fullscreen-compare-modal');
    const btnCloseFullscreen = document.getElementById('btn-close-fullscreen');
    const compareTable = document.getElementById('compare-table');
    const tableCard = document.querySelector('.table-card');
    const PLANS = ['white', 'silver', 'vip', 'gold'];

    function openFullscreenCompare(selectedPlans) {
        if (!fullscreenModal) return;
        
        const selected = new Set(selectedPlans.length > 0 ? selectedPlans : PLANS);

        // Hide anything not selected and resize card
        if (tableCard) tableCard.setAttribute('data-plans', selected.size);
        if (compareTable) {
            PLANS.forEach(plan => {
                compareTable.classList.toggle(`hide-${plan}`, !selected.has(plan));
            });
        }

        fullscreenModal.hidden = false;
        
        // Ensure canvas matches screen size
        if (typeof updateCanvasSize === 'function') {
            updateCanvasSize();
        }
    }

    if (btnCloseFullscreen) {
        btnCloseFullscreen.addEventListener('click', () => {
            if (fullscreenModal) fullscreenModal.hidden = true;
        });
    }

    // Canvas Drawing Logic
    const canvas = document.getElementById('drawing-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const btnToggle = document.getElementById('btn-toggle-pen');
        const btnClear = document.getElementById('btn-clear-pen');

        let isDrawingMode = false;
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // 크기 연동 (화면 크기 변경 시마다 캔버스 동기화)
        window.updateCanvasSize = function() {
            if (!canvas) return;
            // 기존 그림 백업
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tCtx = tempCanvas.getContext('2d');
            if(canvas.width > 0 && canvas.height > 0) tCtx.drawImage(canvas, 0, 0);

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // 펜 스타일 설정
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#FF0000'; // 빨간색

            // 백업한 그림 복구
            if(canvas.width > 0 && canvas.height > 0) ctx.drawImage(tempCanvas, 0, 0);
        };
        
        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function startDraw(e) {
            if (!isDrawingMode) return;
            // 터치 기기에서 그리기 중엔 스크롤이 발생하지 않도록 방지
            if(e.type === 'touchstart') e.preventDefault(); 
            isDrawing = true;
            const pos = getPos(e);
            lastX = pos.x;
            lastY = pos.y;
        }

        function draw(e) {
            if (!isDrawing || !isDrawingMode) return;
            if(e.type === 'touchmove') e.preventDefault();
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastX = pos.x;
            lastY = pos.y;
        }

        function stopDraw() {
            isDrawing = false;
        }

        // 이벤트 바인딩
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDraw); // 화면 밖에서 떼면 멈춤 대응

        canvas.addEventListener('touchstart', startDraw, {passive: false});
        canvas.addEventListener('touchmove', draw, {passive: false});
        window.addEventListener('touchend', stopDraw);

        // 펜 모드 켜기/끄기
        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                isDrawingMode = !isDrawingMode;
                btnToggle.classList.toggle('is-active', isDrawingMode);
                
                // CSS 통과 제어
                canvas.style.pointerEvents = isDrawingMode ? 'auto' : 'none';
                canvas.style.touchAction = isDrawingMode ? 'none' : 'auto';
                
                if (btnClear) btnClear.style.display = isDrawingMode ? 'inline-flex' : 'none';
                
                btnToggle.innerHTML = isDrawingMode 
                    ? `<i data-lucide="mouse-pointer-2"></i> <span>펜 끄기 (ON)</span>` 
                    : `<i data-lucide="pen-tool"></i> <span>펜 쓰기 (OFF)</span>`;
                
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        }

        // 모두 지우기
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
