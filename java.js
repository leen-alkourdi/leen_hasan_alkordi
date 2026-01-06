// إنشاء النجوم المتلألئة
function createStars() {
    const container = document.getElementById('stars-container');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        const delay = Math.random() * 5;
        star.style.animationDelay = `${delay}s`;

        const duration = Math.random() * 3 + 3;
        star.style.animationDuration = `${duration}s`;

        container.appendChild(star);
    }
}

// تهيئة المتغيرات
let conversionDirection = 'oldToNew';
const revolutionSong = document.getElementById('revolution-song');
const currencyDenominations = [500, 200, 100, 50, 25, 10];
let isMusicPlaying = false;
let isMusicPaused = false;

// التحقق من المدخلات الرقمية فقط
function validateNumberInput(input) {
    // السماح بالأرقام والنقطة فقط
    input.value = input.value.replace(/[^0-9.]/g, '');
    
    // السماح بنقطة واحدة فقط
    const dots = input.value.split('.').length - 1;
    if (dots > 1) {
        input.value = input.value.slice(0, -1);
    }
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function () {
    createStars();
    updateInputSymbol();
    updateMusicStatus();

    // ⚠️ حدث الإدخال - فقط للتحقق من المدخلات
    document.getElementById('amount').addEventListener('input', function () {
        // فقط التحقق من المدخلات
        validateNumberInput(this);
        
        // ⚠️ لا تحويل تلقائي هنا
    });

    // تحويل عند Enter (اختياري)
    document.getElementById('amount').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            convertCurrency();
        }
    });

    // حدث زر الإيقاف المؤقت/التشغيل
    const pauseBtn = document.getElementById('pause-music');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (!isMusicPlaying || isMusicPaused) {
                // إذا الأغنية متوقفة أو موقوفة مؤقتاً، شغلها
                revolutionSong.play();
                isMusicPlaying = true;
                isMusicPaused = false;
            } else {
                // إذا الأغنية مشتغلة، أوقفها مؤقتاً
                revolutionSong.pause();
                isMusicPaused = true;
            }
            updateMusicStatus();
        });
    }

    // تفريغ الحقل عند التحميل
    document.getElementById('amount').value = '';
    document.getElementById('result-amount').textContent = '٠٫٠٠';
    document.getElementById('breakdown-container').classList.remove('show');
});

// تحديث رمز العملة
function updateInputSymbol() {
    const symbol = document.getElementById('input-symbol');
    if (conversionDirection === 'oldToNew') {
        symbol.textContent = 'ليرة سورية قديمة';
        symbol.style.color = '#FF6B35';
    } else {
        symbol.textContent = 'ليرة سورية جديدة';
        symbol.style.color = '#27AE60';
    }
}

// تبديل اتجاه التحويل
document.getElementById('old-to-new').addEventListener('click', function () {
    setConversionDirection('oldToNew');
});

document.getElementById('new-to-old').addEventListener('click', function () {
    setConversionDirection('newToOld');
});

function setConversionDirection(direction) {
    conversionDirection = direction;

    document.getElementById('old-to-new').classList.toggle('active', direction === 'oldToNew');
    document.getElementById('new-to-old').classList.toggle('active', direction === 'newToOld');

    updateInputSymbol();

    const resultText = document.getElementById('result-text');
    resultText.textContent = direction === 'oldToNew' ? 'ليرة سورية جديدة' : 'ليرة سورية قديمة';

    const conversionRate = document.querySelectorAll('.conversion-rate');
    conversionRate.forEach(span => {
        span.textContent = direction === 'oldToNew' ? '(÷ 100)' : '(× 100)';
    });

    // ⚠️ إزالة التحويل التلقائي هنا أيضاً
    // const amountInput = document.getElementById('amount');
    // if (amountInput.value) {
    //     convertCurrency();
    // }
}

// التحويل عند النقر على الزر
document.getElementById('convert-btn').addEventListener('click', function () {
    convertCurrency();
    this.classList.add('clicked');
    setTimeout(() => {
        this.classList.remove('clicked');
    }, 300);
});

// وظيفة التحويل الرئيسية
function convertCurrency() {
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        showError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
        document.getElementById('breakdown-container').classList.remove('show');
        return;
    }

    let result = conversionDirection === 'oldToNew' ? amount / 100 : amount * 100;
    showResult(result);
    
    // 🎵 تشغيل الأغنية تلقائياً عند الضغط على زر التحويل
    playRevolutionSong();
}

// حساب التوزيع
function calculateCurrencyBreakdown(amount) {
    let remaining = Math.round(amount);
    const breakdown = {};

    for (const denomination of currencyDenominations) {
        breakdown[denomination] = 0;
    }

    for (const denomination of currencyDenominations) {
        if (remaining >= denomination) {
            const count = Math.floor(remaining / denomination);
            breakdown[denomination] = count;
            remaining -= count * denomination;
        }
    }

    if (remaining > 0) {
        breakdown[10] = (breakdown[10] || 0) + 1;
    }

    return breakdown;
}

// عرض التوزيع في القسم المنفصل
function displayCurrencyBreakdown(amount) {
    const breakdown = calculateCurrencyBreakdown(amount);
    const container = document.getElementById('breakdown-container');
    const gridContainer = document.getElementById('breakdown-grid');
    const summaryContainer = document.getElementById('breakdown-summary');

    container.classList.remove('show');

    setTimeout(() => {
        gridContainer.innerHTML = '';
        let totalPieces = 0;
        let totalValue = 0;

        for (const denomination of currencyDenominations) {
            const count = breakdown[denomination];
            if (count > 0) {
                totalPieces += count;
                totalValue += count * denomination;

                const currencyCard = document.createElement('div');
                currencyCard.className = 'breakdown-currency';
                currencyCard.innerHTML = `
                    <div class="currency-image-large" data-value="${denomination}"></div>
                    <div class="currency-details-large">
                        <div class="currency-count-large">${formatNumber(count)} ×</div>
                        <div class="currency-value-large">${formatNumber(denomination)} ليرة</div>
                        <div class="currency-total-large">المجموع: ${formatNumber(count * denomination)} ليرة</div>
                    </div>
                `;
                gridContainer.appendChild(currencyCard);
            }
        }

        summaryContainer.innerHTML = `
            <div class="summary-title">
                <i class="fas fa-chart-pie"></i>
                <span>ملخص التوزيع</span>
            </div>
            <div class="summary-content">
                <div class="summary-item">
                    <h4><i class="fas fa-coins"></i> العدد الإجمالي</h4>
                    <div class="value">${formatNumber(totalPieces)}</div>
                    <div class="unit">قطعة</div>
                </div>
                <div class="summary-item">
                    <h4><i class="fas fa-calculator"></i> القيمة الإجمالية</h4>
                    <div class="value">${formatNumber(totalValue)}</div>
                    <div class="unit">ليرة سورية</div>
                </div>
                <div class="summary-item">
                    <h4><i class="fas fa-balance-scale"></i> المبلغ الأصلي</h4>
                    <div class="value">${formatNumber(Math.round(amount))}</div>
                    <div class="unit">ليرة سورية</div>
                </div>
            </div>
        `;

        setTimeout(() => {
            container.classList.add('show');
        }, 50);
    }, 100);
}

// عرض النتيجة
function showResult(result) {
    const resultContainer = document.getElementById('result-container');
    const resultAmount = document.getElementById('result-amount');
    const breakdownContainer = document.getElementById('breakdown-container');

    resultAmount.textContent = formatNumber(result.toFixed(2));

    resultContainer.classList.remove('show');
    void resultContainer.offsetWidth;
    resultContainer.classList.add('show');

    breakdownContainer.classList.remove('show');

    if (result >= 10 && conversionDirection === 'oldToNew') {
        setTimeout(() => {
            displayCurrencyBreakdown(Math.round(result));
        }, 500);
    }
}

// تنسيق الأرقام
function formatNumber(num) {
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    return new Intl.NumberFormat('ar-SY').format(number);
}

// عرض رسالة خطأ
function showError(message) {
    const resultContainer = document.getElementById('result-container');
    const resultAmount = document.getElementById('result-amount');
    const resultText = document.getElementById('result-text');
    const breakdownContainer = document.getElementById('breakdown-container');

    resultAmount.textContent = '!';
    resultText.textContent = message;
    resultText.style.color = '#FF6B35';

    resultContainer.classList.remove('show');
    void resultContainer.offsetWidth;
    resultContainer.classList.add('show');

    breakdownContainer.classList.remove('show');

    setTimeout(() => {
        resultText.style.color = '#444';
        resultText.textContent = conversionDirection === 'oldToNew' ? 'ليرة سورية جديدة' : 'ليرة سورية قديمة';
    }, 2000);
}

// تشغيل أغنية الثورة
function playRevolutionSong() {
    try {
        // إذا كانت الأغنية موقوفة مؤقتاً، استئناف التشغيل
        if (isMusicPaused) {
            revolutionSong.play();
            isMusicPaused = false;
        } else {
            // وإلا ابدأ من البداية
            revolutionSong.currentTime = 0;
            revolutionSong.play();
        }
        
        isMusicPlaying = true;
        updateMusicStatus();
    } catch (e) {
        console.log("لا يمكن تشغيل الأغنية: " + e.message);
    }
}

// تحديث حالة الأغنية
function updateMusicStatus() {
    const musicStatus = document.getElementById('music-status');
    if (!musicStatus) return;

    const icon = musicStatus.querySelector('i');
    const text = musicStatus.querySelector('span');
    const pauseBtn = document.getElementById('pause-music');

    if (!icon || !text) return;

    if (isMusicPlaying && !isMusicPaused) {
        icon.className = 'fas fa-volume-up';
        icon.style.color = '#27AE60';
        text.textContent = 'الأغنية تشتغل الآن';
        
        // تحديث زر الإيقاف المؤقت
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> إيقاف مؤقت';
            pauseBtn.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.9), rgba(41, 128, 185, 0.9))';
        }
    } else if (isMusicPaused) {
        icon.className = 'fas fa-pause';
        icon.style.color = '#3498DB';
        text.textContent = 'الأغنية موقوفة مؤقتاً';
        
        // تحديث زر التشغيل (بدلاً من الإيقاف)
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> تشغيل';
            pauseBtn.style.background = 'linear-gradient(135deg, rgba(39, 174, 96, 0.9), rgba(46, 204, 113, 0.9))';
        }
    } else {
        icon.className = 'fas fa-volume-mute';
        icon.style.color = '#E74C3C';
        text.textContent = 'الأغنية متوقفة';
        
        // تحديث زر التشغيل
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> تشغيل';
            pauseBtn.style.background = 'linear-gradient(135deg, rgba(39, 174, 96, 0.9), rgba(46, 204, 113, 0.9))';
        }
    }
}

// أحداث الصوت
revolutionSong.addEventListener('ended', function () {
    isMusicPlaying = false;
    isMusicPaused = false;
    updateMusicStatus();
});

revolutionSong.addEventListener('play', function () {
    isMusicPlaying = true;
    isMusicPaused = false;
    updateMusicStatus();
});

revolutionSong.addEventListener('pause', function () {
    if (revolutionSong.currentTime > 0 && revolutionSong.currentTime < revolutionSong.duration) {
        isMusicPaused = true;
    } else {
        isMusicPlaying = false;
        isMusicPaused = false;
    }
    updateMusicStatus();
});

// تحديث السنة الحالية تلقائياً
function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}

// تحديث السنة عند تحميل الصفحة
window.addEventListener('load', updateCurrentYear);