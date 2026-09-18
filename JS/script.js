// ============================================================
// MIXBOX — script.js
// Audio engine (Web Audio API) + Interactive Stage Lighting
// Features: Multi-band frequency analyzer (Bass, Mid, Treble),
//           Smart dynamic slots (strictly keeps 8 slots unless 100% full),
//           In-place Drag & Drop replacement, quantized sync,
//           A/B variant chain, slot Mute/Solo, Save/Load, URL share
// ============================================================

const CATEGORY_LABELS = {
    beat: "Beat",
    effect: "Effect",
    melody: "Melody",
    chorus: "Chorus",
    voice: "Voice",
    bonus: "Bonus",
};

const MIN_SLOTS = 8;
const FADE_IN_SEC = 0.35;
const FADE_OUT_SEC = 0.45;
const SOUND_ADD_COOLDOWN_MS = 400;

// ---------- Audio Engine with Multi-Band Analyzer ----------

class Mixer {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.masterAnalyser = null;
        this.masterAmpBuf = null;
        this.masterFreqBuf = null;

        this.buffers = new Map();
        this.loadedChapters = new Set();
        this.activeBySlot = new Map();
        this.activeBySound = new Map();
        this.slotControls = new Map();
        this.loopDuration = null;
        this.loopStartTime = null;
    }

    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.85;

            this.masterAnalyser = this.ctx.createAnalyser();
            this.masterAnalyser.fftSize = 256;
            this.masterAmpBuf = new Uint8Array(this.masterAnalyser.fftSize);
            this.masterFreqBuf = new Uint8Array(
                this.masterAnalyser.frequencyBinCount
            );

            this.masterGain.connect(this.masterAnalyser);
            this.masterAnalyser.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended") this.ctx.resume();
    }

    setVolume(v) {
        if (this.masterGain) this.masterGain.gain.value = v;
    }

    getMasterAmplitude() {
        if (!this.masterAnalyser) return 0;
        this.masterAnalyser.getByteTimeDomainData(this.masterAmpBuf);
        let sum = 0;
        for (let i = 0; i < this.masterAmpBuf.length; i++) {
            const v = (this.masterAmpBuf[i] - 128) / 128;
            sum += v * v;
        }
        const rms = Math.sqrt(sum / this.masterAmpBuf.length);
        return Math.min(1, rms * 3.5);
    }

    getAudioBands() {
        if (!this.masterAnalyser) {
            return { bass: 0, mid: 0, treble: 0 };
        }
        this.masterAnalyser.getByteFrequencyData(this.masterFreqBuf);

        // Bass
        let bassSum = 0;
        for (let i = 0; i < 4; i++) bassSum += this.masterFreqBuf[i];
        const bass = Math.min(1, bassSum / 4 / 185);

        // Mid
        let midSum = 0;
        for (let i = 4; i < 16; i++) midSum += this.masterFreqBuf[i];
        const mid = Math.min(1, midSum / 12 / 160);

        // Treble
        let trebSum = 0;
        for (let i = 16; i < 40; i++) trebSum += this.masterFreqBuf[i];
        const treble = Math.min(1, trebSum / 24 / 140);

        return { bass, mid, treble };
    }

    async loadChapter(chapterId, folder, loadable, onProgress) {
        this.ensureContext();

        if (!this.buffers.has(chapterId))
            this.buffers.set(chapterId, new Map());
        const chapterBuffers = this.buffers.get(chapterId);

        if (this.loadedChapters.has(chapterId)) {
            if (onProgress) onProgress(loadable.length, loadable.length);
            return;
        }

        let done = 0;
        await Promise.all(
            loadable.map(async (item) => {
                if (chapterBuffers.has(item.id)) {
                    done++;
                    if (onProgress) onProgress(done, loadable.length);
                    return;
                }
                const res = await fetch(`${folder}/${item.file}`);
                const arrayBuf = await res.arrayBuffer();
                const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
                chapterBuffers.set(item.id, audioBuf);
                done++;
                if (onProgress) onProgress(done, loadable.length);
            })
        );
        this.loadedChapters.add(chapterId);
    }

    isActive(soundId) {
        return this.activeBySound.has(soundId);
    }

    findEmptySlot() {
        let i = 0;
        while (this.activeBySlot.has(i)) i++;
        return i;
    }

    _nextBarTime(referenceDuration) {
        if (this.loopStartTime === null) {
            this.loopDuration = referenceDuration;
            this.loopStartTime = this.ctx.currentTime + 0.08;
            return { startAt: this.loopStartTime, cycleIndex: 0 };
        }
        const lookAhead = 0.05;
        const cyclesElapsed = Math.max(
            0,
            Math.ceil(
                (this.ctx.currentTime + lookAhead - this.loopStartTime) /
                    this.loopDuration
            )
        );
        return {
            startAt: this.loopStartTime + cyclesElapsed * this.loopDuration,
            cycleIndex: cyclesElapsed,
        };
    }

    play(chapterId, sound, preferredSlot) {
        this.ensureContext();
        const chapterBuffers = this.buffers.get(chapterId);
        if (!chapterBuffers) return -1;

        const firstBuffer = chapterBuffers.get(sound.variantIds[0]);
        if (!firstBuffer) return -1;

        let slot = preferredSlot;
        if (slot === undefined || slot === -1 || this.activeBySlot.has(slot)) {
            slot = this.findEmptySlot();
        }

        const { startAt, cycleIndex } = this._nextBarTime(firstBuffer.duration);
        const initialVariantIndex = cycleIndex % sound.variantIds.length;

        const fadeGain = this.ctx.createGain();
        fadeGain.gain.setValueAtTime(0.0001, startAt);
        fadeGain.gain.linearRampToValueAtTime(1, startAt + FADE_IN_SEC);

        const analyser = this.ctx.createAnalyser();
        analyser.fftSize = 256;

        const userGain = this.ctx.createGain();
        userGain.gain.value = 1;

        fadeGain.connect(analyser);
        analyser.connect(userGain);
        userGain.connect(this.masterGain);

        let entry;
        if (sound.variantIds.length === 1) {
            const source = this.ctx.createBufferSource();
            source.buffer = firstBuffer;
            source.loop = true;
            source.loopStart = 0;
            source.loopEnd = firstBuffer.duration;
            source.connect(fadeGain);
            source.start(startAt, 0);
            entry = { kind: "native", source };
        } else {
            const state = this._startChain(
                chapterId,
                sound.variantIds,
                startAt,
                initialVariantIndex,
                fadeGain
            );
            entry = { kind: "chain", state };
        }

        entry.soundId = sound.id;
        entry.chapterId = chapterId;
        entry.category = sound.category;
        entry.variantIds = sound.variantIds;
        entry.startAt = startAt;
        entry.initialVariantIndex = initialVariantIndex;
        entry.fadeGain = fadeGain;
        entry.analyser = analyser;
        entry.userGain = userGain;
        entry.ampBuf = new Uint8Array(analyser.fftSize);

        this.activeBySlot.set(slot, entry);
        this.activeBySound.set(sound.id, slot);
        this.slotControls.set(slot, { volume: 1, muted: false, solo: false });
        this._recomputeAllGains();
        return slot;
    }

    _startChain(chapterId, variantIds, startAt, startIndex, destination) {
        const state = { stopped: false, timeoutId: null, currentSource: null };
        const chapterBuffers = this.buffers.get(chapterId);
        const scheduleAt = (when, i) => {
            if (state.stopped) return;
            const buffer = chapterBuffers.get(
                variantIds[i % variantIds.length]
            );
            if (!buffer) return;
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(destination);
            source.start(when);
            state.currentSource = source;
            const nextWhen = when + buffer.duration;
            const delayMs = Math.max(
                0,
                (nextWhen - this.ctx.currentTime - 0.15) * 1000
            );
            state.timeoutId = setTimeout(
                () => scheduleAt(nextWhen, i + 1),
                delayMs
            );
        };
        scheduleAt(startAt, startIndex);
        return state;
    }

    stop(slot) {
        const data = this.activeBySlot.get(slot);
        if (!data) return;

        const now = this.ctx.currentTime;
        if (data.fadeGain) {
            data.fadeGain.gain.cancelScheduledValues(now);
            data.fadeGain.gain.setValueAtTime(data.fadeGain.gain.value, now);
            data.fadeGain.gain.linearRampToValueAtTime(
                0.0001,
                now + FADE_OUT_SEC
            );
        }

        setTimeout(() => {
            if (data.kind === "native") {
                try {
                    data.source.stop();
                } catch (e) {}
                data.source.disconnect();
            } else {
                data.state.stopped = true;
                clearTimeout(data.state.timeoutId);
                if (data.state.currentSource) {
                    try {
                        data.state.currentSource.stop();
                    } catch (e) {}
                }
            }
            try {
                data.fadeGain.disconnect();
            } catch (e) {}
            try {
                data.analyser.disconnect();
            } catch (e) {}
            try {
                data.userGain.disconnect();
            } catch (e) {}
        }, FADE_OUT_SEC * 1000 + 40);

        this.activeBySlot.delete(slot);
        this.activeBySound.delete(data.soundId);
        this.slotControls.delete(slot);
        this._recomputeAllGains();

        if (this.activeBySlot.size === 0) {
            this.loopDuration = null;
            this.loopStartTime = null;
        }
    }

    stopBySoundId(soundId) {
        const slot = this.activeBySound.get(soundId);
        if (slot !== undefined) this.stop(slot);
    }

    stopAll() {
        for (const slot of Array.from(this.activeBySlot.keys()))
            this.stop(slot);
    }

    _recomputeAllGains() {
        if (!this.ctx) return;
        const anySolo = Array.from(this.slotControls.values()).some(
            (c) => c.solo
        );
        for (const [slot, ctrl] of this.slotControls.entries()) {
            const data = this.activeBySlot.get(slot);
            if (!data || !data.userGain) continue;
            let g;
            if (ctrl.muted) g = 0;
            else if (anySolo) g = ctrl.solo ? ctrl.volume : 0;
            else g = ctrl.volume;
            data.userGain.gain.setTargetAtTime(g, this.ctx.currentTime, 0.015);
        }
    }

    setSlotVolume(slot, value) {
        const c = this.slotControls.get(slot);
        if (!c) return;
        c.volume = value;
        this._recomputeAllGains();
    }

    toggleMute(slot) {
        const c = this.slotControls.get(slot);
        if (!c) return false;
        c.muted = !c.muted;
        this._recomputeAllGains();
        return c.muted;
    }

    toggleSolo(slot) {
        const c = this.slotControls.get(slot);
        if (!c) return false;
        c.solo = !c.solo;
        this._recomputeAllGains();
        return c.solo;
    }

    getSlotControls(slot) {
        return this.slotControls.get(slot);
    }

    getSlotAmplitude(slot) {
        const data = this.activeBySlot.get(slot);
        if (!data || !data.analyser) return 0;
        data.analyser.getByteTimeDomainData(data.ampBuf);
        let sum = 0;
        for (let i = 0; i < data.ampBuf.length; i++) {
            const v = (data.ampBuf[i] - 128) / 128;
            sum += v * v;
        }
        const rms = Math.sqrt(sum / data.ampBuf.length);
        return Math.min(1, rms * 4.5);
    }

    getProgress() {
        if (!this.ctx || this.loopStartTime === null || !this.loopDuration)
            return null;
        const elapsed = this.ctx.currentTime - this.loopStartTime;
        if (elapsed < 0) return 0;
        return (elapsed % this.loopDuration) / this.loopDuration;
    }

    playOneShot(chapterId, bufferId) {
        const chapterBuffers = this.buffers.get(chapterId);
        if (!chapterBuffers) return 0;
        const buffer = chapterBuffers.get(bufferId);
        if (!buffer) return 0;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = false;
        source.connect(this.masterGain);
        source.start(this.ctx.currentTime);
        return buffer.duration;
    }
}

// ---------- App State ----------

const mixer = new Mixer();
let currentChapterId = 1;
let mixChaptersEnabled = false;
let isChapterLoading = false;
const pendingSounds = new Set();
const pendingBonuses = new Set();
const renderedSlots = new Map();
const slotEmptyTimeouts = new Map();

const SOUND_INDEX = new Map();

const appEl = document.querySelector(".app");
const chaptersNav = document.getElementById("chapters");
const stageEl = document.getElementById("stage");
const stageWrapEl = document.getElementById("stageWrap");
const stageHint = document.getElementById("stageHint");
const trayEl = document.getElementById("tray");
const stopAllBtn = document.getElementById("stopAllBtn");
const masterVolume = document.getElementById("masterVolume");
const mixChaptersBtn = document.getElementById("mixChaptersBtn");
const chapterIntroEl = document.getElementById("chapterIntro");
const chapterIntroTitleEl = document.getElementById("chapterIntroTitle");

// ---------- Chapter intro overlay ----------

let chapterIntroTimerA = null;
let chapterIntroTimerB = null;

function showChapterIntro(chapter) {
    if (chapterIntroTimerA) {
        clearTimeout(chapterIntroTimerA);
        chapterIntroTimerA = null;
    }
    if (chapterIntroTimerB) {
        clearTimeout(chapterIntroTimerB);
        chapterIntroTimerB = null;
    }

    chapterIntroTitleEl.textContent = chapter.title || "";

    chapterIntroEl.classList.remove("visible");
    void chapterIntroEl.offsetWidth;
    chapterIntroEl.classList.add("visible");

    chapterIntroTimerA = setTimeout(() => {
        chapterIntroEl.classList.remove("visible");
        chapterIntroTimerA = null;
        chapterIntroTimerB = setTimeout(() => {
            chapterIntroTimerB = null;
        }, 700);
    }, 1000);
}

// ---------- Sound index ----------

function buildSoundIndex() {
    SOUND_INDEX.clear();
    Object.keys(CHAPTERS).forEach((idStr) => {
        const chapterId = Number(idStr);
        const chapter = CHAPTERS[chapterId];
        if (!chapter.allSounds) return;
        chapter.allSounds.forEach((s) => {
            SOUND_INDEX.set(s.id, { chapterId, sound: s });
        });
    });
}

function findSoundById(id) {
    const hit = SOUND_INDEX.get(id);
    return hit ? hit.sound : null;
}

function findSoundChapter(id) {
    const hit = SOUND_INDEX.get(id);
    return hit ? hit.chapterId : null;
}

// ---------- Build chapter tabs ----------

function renderChapterTabs() {
    chaptersNav.innerHTML = "";
    Object.keys(CHAPTERS).forEach((id) => {
        const chapter = CHAPTERS[id];
        const btn = document.createElement("button");
        btn.className =
            "chapter-tab" + (Number(id) === currentChapterId ? " active" : "");
        if (chapter.sounds.length === 0) btn.classList.add("empty");
        btn.textContent = `${chapter.name}`;
        btn.title = chapter.title;
        btn.addEventListener("click", () => {
            if (chapter.sounds.length === 0) return;
            if (isChapterLoading) return;
            const numericId = Number(id);
            if (
                numericId === currentChapterId &&
                mixer.loadedChapters.has(numericId)
            )
                return;
            switchChapter(numericId);
        });
        chaptersNav.appendChild(btn);
    });
}

function setChaptersDisabled(disabled) {
    chaptersNav.querySelectorAll(".chapter-tab").forEach((btn) => {
        btn.classList.toggle("loading-disabled", disabled);
    });
}

// ---------- Stage slots (Smart Dynamic Slots) ----------

function buildSlotElement(i) {
    if (slotEmptyTimeouts.has(i)) {
        clearTimeout(slotEmptyTimeouts.get(i));
        slotEmptyTimeouts.delete(i);
    }

    const slotEl = document.createElement("div");
    slotEl.className = "slot";
    slotEl.dataset.slot = i;

    slotEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        slotEl.classList.add("drag-over");
    });
    slotEl.addEventListener("dragleave", () =>
        slotEl.classList.remove("drag-over")
    );

    // جایگزینی هوشمند در Drag & Drop (In-Place Slot Replacement)
    slotEl.addEventListener("drop", (e) => {
        e.preventDefault();
        slotEl.classList.remove("drag-over");
        const soundId = e.dataTransfer.getData("text/plain");
        const sound = findSoundById(soundId);
        if (!sound) return;

        // اگر اسلات از قبل کاراکتری داشته باشد، آن را جایگزین می‌کند تا اسلات اضافه ساخته نشود
        const currentData = mixer.activeBySlot.get(i);
        if (currentData) {
            if (currentData.soundId === sound.id) return;
            mixer.stop(i);
        }
        addSound(sound, i);
    });

    slotEl.addEventListener("click", () => {
        const data = mixer.activeBySlot.get(i);
        if (data) removeSound(data.soundId);
    });

    return slotEl;
}

function renderStage() {
    stageEl.innerHTML = "";
    renderedSlots.clear();
    for (const tid of slotEmptyTimeouts.values()) clearTimeout(tid);
    slotEmptyTimeouts.clear();
    for (let i = 0; i < MIN_SLOTS; i++) {
        stageEl.appendChild(buildSlotElement(i));
    }
}

// مدیریت همه‌جانبه اسلات‌ها: فقط زمانی اسلات اضافه می‌شود که ۱۰۰٪ اسلات‌ها پر باشند
function syncStageSlotCount() {
    const activeSlots = Array.from(mixer.activeBySlot.keys());
    const activeCount = activeSlots.length;
    const maxActiveSlot = activeCount > 0 ? Math.max(...activeSlots) : -1;

    let neededSlots;

    if (activeCount < MIN_SLOTS) {
        // تا زمانی که کمتر از ۸ صدا فعال باشد، اسلات اضافه هرگز ساخته نمی‌شود
        neededSlots = Math.max(MIN_SLOTS, maxActiveSlot + 1);
    } else {
        // تمام ۸ اسلات (یا بیشتر) پر هستند. آیا جای خالی بین اسلات‌ها وجود دارد؟
        const hasEmptyHole = activeCount < maxActiveSlot + 1;
        if (hasEmptyHole) {
            // جای خالی بین اسلات‌های فعال وجود دارد، پس نیازی به اسلات جدید در انتها نیست
            neededSlots = maxActiveSlot + 1;
        } else {
            // تمام اسلات‌های موجود ۱۰۰٪ پر هستند! دقیقاً ۱ اسلات خالی در انتها اضافه می‌شود
            neededSlots = maxActiveSlot + 2;
        }
    }

    let currentSlots = stageEl.querySelectorAll(".slot").length;

    // افزایش فقط در صورت پر بودن تمام ظرفیت
    while (currentSlots < neededSlots) {
        stageEl.appendChild(buildSlotElement(currentSlots));
        currentSlots++;
    }

    // حذف خودکار اسلات‌های خالی اضافی هنگامی که به آن‌ها نیازی نیست
    while (currentSlots > neededSlots) {
        const lastIndex = currentSlots - 1;
        if (mixer.activeBySlot.has(lastIndex)) break;

        const el = stageEl.querySelector(`[data-slot="${lastIndex}"]`);
        if (!el) break;

        if (slotEmptyTimeouts.has(lastIndex)) {
            clearTimeout(slotEmptyTimeouts.get(lastIndex));
            slotEmptyTimeouts.delete(lastIndex);
        }

        el.remove();
        currentSlots--;
    }
}

function normalizeChapter(chapter) {
    if (chapter.allSounds) return;

    const loadable = [];
    const withVariantIds = (item) => {
        const variantIds = item.files.map((_, i) => `${item.id}__${i}`);
        item.files.forEach((file, i) =>
            loadable.push({ id: variantIds[i], file })
        );
        return variantIds;
    };

    const normalSounds = chapter.sounds.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        variantIds: withVariantIds(s),
    }));

    const bonusSounds = (chapter.bonuses || []).map((b) => {
        const variantIds = withVariantIds(b);
        if (b.predrop)
            loadable.push({ id: `${b.id}_predrop`, file: b.predrop });
        return {
            id: b.id,
            name: b.name,
            category: "bonus",
            variantIds,
            predrop: b.predrop || null,
        };
    });

    chapter.allSounds = [...normalSounds, ...bonusSounds];
    chapter.loadable = loadable;
}

// ---------- Clean SVG Characters ----------

function buildCharacterSVG(category) {
    switch (category) {
        case "beat":
            return `
            <svg class="char-svg" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
                <line x1="14" y1="55" x2="26" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
                <line x1="66" y1="55" x2="54" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
                <rect class="char-body" x="22" y="58" width="36" height="38" rx="10" />
                <circle class="char-head" cx="40" cy="40" r="22" />
                <ellipse cx="40" cy="19" rx="24" ry="4" fill="currentColor" opacity="0.9"/>
                <path d="M 30 19 Q 30 6 40 6 Q 50 6 50 19 Z" fill="currentColor" opacity="0.9"/>
                <rect class="char-eye" x="29" y="36" width="5" height="7" rx="1.5"/>
                <rect class="char-eye" x="46" y="36" width="5" height="7" rx="1.5"/>
                <ellipse class="char-mouth" cx="40" cy="52" rx="6" ry="2"/>
            </svg>`;

        case "melody":
            return `
            <svg class="char-svg" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
                <rect class="char-body" x="28" y="56" width="24" height="42" rx="10" />
                <rect x="20" y="82" width="40" height="8" rx="2" fill="currentColor" opacity="0.75"/>
                <line x1="28" y1="82" x2="28" y2="90" stroke="var(--bg-base)" stroke-width="1.5"/>
                <line x1="36" y1="82" x2="36" y2="90" stroke="var(--bg-base)" stroke-width="1.5"/>
                <line x1="44" y1="82" x2="44" y2="90" stroke="var(--bg-base)" stroke-width="1.5"/>
                <line x1="52" y1="82" x2="52" y2="90" stroke="var(--bg-base)" stroke-width="1.5"/>
                <circle class="char-head" cx="40" cy="38" r="20" />
                <rect x="22" y="32" width="36" height="10" rx="3" fill="none" stroke="var(--bg-base)" stroke-width="2"/>
                <circle class="char-eye" cx="31" cy="37" r="2"/>
                <circle class="char-eye" cx="49" cy="37" r="2"/>
                <ellipse class="char-mouth" cx="40" cy="50" rx="5" ry="1.5"/>
            </svg>`;

        case "effect":
            return `
            <svg class="char-svg" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
                <line x1="40" y1="14" x2="40" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="40" cy="12" r="4" fill="currentColor"/>
                <ellipse class="char-body" cx="40" cy="76" rx="26" ry="20" />
                <ellipse class="char-head" cx="40" cy="42" rx="24" ry="20" />
                <circle class="char-eye" cx="40" cy="38" r="3.1"/>
                <circle class="char-eye" cx="27" cy="42" r="3"/>
                <circle class="char-eye" cx="53" cy="42" r="3"/>
                <ellipse class="char-mouth" cx="40" cy="54" rx="7" ry="2.5"/>
            </svg>`;

        case "voice":
            return `
            <svg class="char-svg" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
                <rect class="char-body" x="26" y="56" width="28" height="42" rx="12" />
                <line x1="60" y1="62" x2="66" y2="78" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
                <circle cx="60" cy="58" r="5" fill="currentColor" opacity="0.9"/>
                <circle class="char-head" cx="40" cy="38" r="22" />
                <ellipse class="char-eye" cx="32" cy="34" rx="2.5" ry="3.5"/>
                <ellipse class="char-eye" cx="48" cy="34" rx="2.5" ry="3.5"/>
                <ellipse class="char-mouth" cx="40" cy="50" rx="8" ry="2.5"/>
            </svg>`;

        case "chorus":
            return `
            <svg class="char-svg" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
                <rect class="char-body" x="20" y="64" width="40" height="34" rx="12" />
                <circle class="char-head" cx="22" cy="44" r="14" />
                <circle class="char-head" cx="58" cy="44" r="14" />
                <circle class="char-head" cx="40" cy="38" r="15" />
                <circle class="char-eye" cx="18" cy="43" r="1.8"/>
                <circle class="char-eye" cx="26" cy="43" r="1.8"/>
                <circle class="char-eye" cx="54" cy="43" r="1.8"/>
                <circle class="char-eye" cx="62" cy="43" r="1.8"/>
                <circle class="char-eye" cx="35" cy="37" r="2"/>
                <circle class="char-eye" cx="45" cy="37" r="2"/>
                <ellipse class="char-mouth" cx="22" cy="51" rx="3" ry="1.5"/>
                <ellipse class="char-mouth" cx="40" cy="46" rx="4" ry="1.8"/>
                <ellipse class="char-mouth" cx="58" cy="51" rx="3" ry="1.5"/>
            </svg>`;

        case "bonus":
            return `
            <svg class="char-svg" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M 16 70 Q 8 95 22 98 L 58 98 Q 72 95 64 70 Z" fill="currentColor" opacity="0.5"/>
                <rect class="char-body" x="24" y="58" width="32" height="40" rx="12" />
                <circle class="char-head" cx="40" cy="38" r="22" />
                <path d="M 22 18 L 26 8 L 32 16 L 40 6 L 48 16 L 54 8 L 58 18 Z" fill="currentColor"/>
                <rect x="22" y="17" width="36" height="4" rx="1" fill="currentColor" opacity="0.85"/>
                <circle cx="30" cy="36" r="8" fill="#0b0d14" stroke="#e8e8ee" stroke-width="2"/>
                <circle cx="50" cy="36" r="8" fill="#0b0d14" stroke="#e8e8ee" stroke-width="2"/>
                <line x1="38" y1="36" x2="42" y2="36" stroke="#0b0d14" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="22" y1="34" x2="18" y2="32" stroke="#e8e8ee" stroke-width="2" stroke-linecap="round"/>
                <line x1="58" y1="34" x2="62" y2="32" stroke="#e8e8ee" stroke-width="2" stroke-linecap="round"/>
                <ellipse class="char-mouth" cx="40" cy="52" rx="7" ry="2"/>
            </svg>`;

        default:
            return `
            <svg class="char-svg" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
                <circle class="char-body" cx="40" cy="72" r="22"/>
                <circle class="char-head" cx="40" cy="40" r="22"/>
                <circle class="char-eye" cx="32" cy="38" r="2.5"/>
                <circle class="char-eye" cx="48" cy="38" r="2.5"/>
                <ellipse class="char-mouth" cx="40" cy="50" rx="6" ry="2"/>
            </svg>`;
    }
}

// ---------- Particle burst ----------

function spawnParticles(slotEl, colorVar) {
    const burst = document.createElement("div");
    burst.className = "particle-burst";
    const count = 10;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        p.className = "particle";
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const dist = 34 + Math.random() * 22;
        p.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
        p.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
        p.style.background = `var(${colorVar})`;
        burst.appendChild(p);
    }
    slotEl.appendChild(burst);
    setTimeout(() => burst.remove(), 650);
}

// ---------- Slot visuals ----------

function buildPerformerMarkup(sound) {
    return `
    <div class="performer">
      <div class="character">
        ${buildCharacterSVG(sound.category)}
      </div>
      <div class="performer-label">${sound.name}</div>
      <div class="performer-controls">
        <button class="mini-btn mute-btn" data-role="mute" title="Mute">M</button>
        <button class="mini-btn solo-btn" data-role="solo" title="Solo">S</button>
      </div>
      <input type="range" class="mini-volume" min="0" max="1" step="0.01" value="1" title="Volume">
    </div>
  `;
}

function fillSlot(slot, sound) {
    const slotEl = stageEl.querySelector(`[data-slot="${slot}"]`);
    if (!slotEl) return;

    if (slotEmptyTimeouts.has(slot)) {
        clearTimeout(slotEmptyTimeouts.get(slot));
        slotEmptyTimeouts.delete(slot);
    }

    slotEl.classList.remove("leaving");
    slotEl.classList.add("filled", "entering");
    slotEl.style.setProperty("--slot-color", `var(--${sound.category})`);
    slotEl.innerHTML = buildPerformerMarkup(sound);

    spawnParticles(slotEl, `--${sound.category}`);
    setTimeout(() => slotEl.classList.remove("entering"), 400);

    const muteBtn = slotEl.querySelector(".mute-btn");
    const soloBtn = slotEl.querySelector(".solo-btn");
    const volumeInput = slotEl.querySelector(".mini-volume");

    const currentCtrl = mixer.getSlotControls(slot);
    if (currentCtrl) {
        volumeInput.value = currentCtrl.volume;
        muteBtn.classList.toggle("on", currentCtrl.muted);
        soloBtn.classList.toggle("on", currentCtrl.solo);
    }

    muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const on = mixer.toggleMute(slot);
        muteBtn.classList.toggle("on", on);
    });
    soloBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const on = mixer.toggleSolo(slot);
        soloBtn.classList.toggle("on", on);
    });
    ["click", "pointerdown", "input"].forEach((evt) => {
        volumeInput.addEventListener(evt, (e) => e.stopPropagation());
    });
    volumeInput.addEventListener("input", (e) => {
        mixer.setSlotVolume(slot, Number(e.target.value));
    });
}

function emptySlot(slot) {
    const slotEl = stageEl.querySelector(`[data-slot="${slot}"]`);
    if (!slotEl) return;

    if (slotEmptyTimeouts.has(slot)) {
        clearTimeout(slotEmptyTimeouts.get(slot));
        slotEmptyTimeouts.delete(slot);
    }

    const category = slotEl.style.getPropertyValue("--slot-color");
    slotEl.classList.add("leaving");
    if (category)
        spawnParticles(slotEl, category.replace("var(", "").replace(")", ""));

    const tid = setTimeout(() => {
        slotEl.classList.remove("filled", "leaving");
        slotEl.style.removeProperty("--slot-color");
        slotEl.innerHTML = "";
        slotEmptyTimeouts.delete(slot);
    }, 240);
    slotEmptyTimeouts.set(slot, tid);
}

function renderActiveSlots() {
    syncStageSlotCount();

    const current = stageEl.querySelectorAll(".slot").length;

    for (const slot of Array.from(renderedSlots.keys())) {
        if (slot >= current) {
            renderedSlots.delete(slot);
        }
    }

    for (let i = 0; i < current; i++) {
        const data = mixer.activeBySlot.get(i);
        const prevSoundId = renderedSlots.get(i);
        const slotEl = stageEl.querySelector(`[data-slot="${i}"]`);
        const hasPerformer = slotEl && slotEl.querySelector(".performer");

        if (data) {
            if (prevSoundId !== data.soundId || !hasPerformer) {
                const sound = findSoundById(data.soundId);
                if (sound) {
                    fillSlot(i, sound);
                    renderedSlots.set(i, data.soundId);
                }
            }
        } else if (prevSoundId !== undefined || hasPerformer) {
            emptySlot(i);
            renderedSlots.delete(i);
        }
    }
}

// ---------- Build tray ----------

function renderTray() {
    const chapter = CHAPTERS[currentChapterId];
    trayEl.innerHTML = "";

    if (!chapter.sounds.length) {
        trayEl.innerHTML = `<div class="empty-chapter-msg">This chapter has no sounds yet — coming soon</div>`;
        return;
    }

    const cats = ["beat", "effect", "melody", "chorus", "voice", "bonus"];
    cats.forEach((cat) => {
        const items = chapter.allSounds.filter((s) => s.category === cat);
        if (!items.length) return;

        const row = document.createElement("div");
        row.className = "tray-row";
        row.style.setProperty("--row-color", `var(--${cat})`);

        const label = document.createElement("div");
        label.className = "tray-row-label";
        label.textContent = CATEGORY_LABELS[cat];
        row.appendChild(label);

        const itemsWrap = document.createElement("div");
        itemsWrap.className = "tray-items";

        items.forEach((sound) => {
            const item = document.createElement("div");
            item.className = "tray-item";
            item.draggable = true;
            item.dataset.soundId = sound.id;
            item.innerHTML = `<span class="tray-dot"></span><span>${sound.name}</span>`;

            item.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", sound.id);
            });
            item.addEventListener("click", () => toggleSound(sound));

            itemsWrap.appendChild(item);
        });

        row.appendChild(itemsWrap);
        trayEl.appendChild(row);
    });
}

function syncTrayActiveStates() {
    trayEl.querySelectorAll(".tray-item").forEach((el) => {
        const id = el.dataset.soundId;
        el.classList.toggle("active", mixer.isActive(id));
    });
}

// ---------- Sound add/remove/toggle ----------

function addSound(sound, preferredSlot, chapterId) {
    const chapter = chapterId ?? findSoundChapter(sound.id) ?? currentChapterId;
    if (mixer.isActive(sound.id) || pendingBonuses.has(sound.id)) return;
    if (pendingSounds.has(sound.id)) return;

    pendingSounds.add(sound.id);
    setTimeout(() => pendingSounds.delete(sound.id), SOUND_ADD_COOLDOWN_MS);

    if (sound.category === "bonus" && sound.predrop) {
        mixer.ensureContext();
        const duration = mixer.playOneShot(chapter, `${sound.id}_predrop`);
        pendingBonuses.add(sound.id);
        stageHint.style.display = "none";
        setTimeout(() => {
            pendingBonuses.delete(sound.id);
            const slot = mixer.play(chapter, sound, preferredSlot);
            if (slot !== -1) {
                renderActiveSlots();
                syncTrayActiveStates();
            }
        }, duration * 1000);
        return;
    }

    const slot = mixer.play(chapter, sound, preferredSlot);
    if (slot === -1) return;
    renderActiveSlots();
    syncTrayActiveStates();
    stageHint.style.display = "none";
}

function removeSound(soundId) {
    mixer.stopBySoundId(soundId);
    renderActiveSlots();
    syncTrayActiveStates();
    if (mixer.activeBySlot.size === 0) stageHint.style.display = "block";
}

function toggleSound(sound) {
    if (pendingSounds.has(sound.id)) return;
    if (mixer.isActive(sound.id)) {
        removeSound(sound.id);
    } else {
        addSound(sound);
    }
}

// ---------- Chapter switching ----------

const CHAPTER_THEME_CLASS = {
    1: "theme-1",
    2: "theme-2",
    3: "theme-3",
    4: "theme-4",
    5: "theme-5",
    6: "theme-6",
    7: "theme-7",
    8: "theme-8",
    9: "theme-9",
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function switchChapter(id, skipIntro = false) {
    if (isChapterLoading) return;
    isChapterLoading = true;
    setChaptersDisabled(true);

    try {
        const keepPlaying = mixChaptersEnabled;

        stageWrapEl.classList.add("transitioning");
        trayEl.classList.add("transitioning");
        await wait(180);

        if (!keepPlaying) {
            mixer.stopAll();
            renderActiveSlots();
            syncTrayActiveStates();
            stageHint.style.display = "block";
        } else {
            stageHint.style.display =
                mixer.activeBySlot.size > 0 ? "none" : "block";
        }

        currentChapterId = id;
        renderChapterTabs();
        if (!keepPlaying) renderStage();

        Object.values(CHAPTER_THEME_CLASS).forEach((cls) =>
            appEl.classList.remove(cls)
        );
        appEl.classList.add(CHAPTER_THEME_CLASS[id] || "theme-1");

        const chapter = CHAPTERS[id];
        if (!chapter.sounds.length) {
            renderTray();
            stageWrapEl.classList.remove("transitioning");
            trayEl.classList.remove("transitioning");
            return;
        }
        normalizeChapter(chapter);
        buildSoundIndex();

        if (mixer.loadedChapters.has(id)) {
            renderTray();
            syncTrayActiveStates();
            renderActiveSlots();

            stageWrapEl.classList.remove("transitioning");
            trayEl.classList.remove("transitioning");

            if (!keepPlaying && !skipIntro) showChapterIntro(chapter);
            return;
        }

        trayEl.innerHTML = `<div class="tray-loading" id="trayLoading">Loading sounds… 0%</div>`;
        await mixer.loadChapter(
            id,
            chapter.folder,
            chapter.loadable,
            (done, total) => {
                const pct = Math.round((done / total) * 100);
                const el = document.getElementById("trayLoading");
                if (el) el.textContent = `Loading sounds… ${pct}%`;
            }
        );
        renderTray();
        syncTrayActiveStates();
        renderActiveSlots();

        stageWrapEl.classList.remove("transitioning");
        trayEl.classList.remove("transitioning");

        if (!keepPlaying && !skipIntro) showChapterIntro(chapter);
    } finally {
        isChapterLoading = false;
        setChaptersDisabled(false);
    }
}

// ---------- Controls ----------

mixChaptersBtn.addEventListener("click", () => {
    mixChaptersEnabled = !mixChaptersEnabled;
    mixChaptersBtn.classList.toggle("on", mixChaptersEnabled);

    if (!mixChaptersEnabled) {
        mixer.stopAll();
        renderStage();
        renderTray();
        syncTrayActiveStates();
        stageHint.style.display = "block";
    }
});

stopAllBtn.addEventListener("click", () => {
    mixer.stopAll();
    renderActiveSlots();
    syncTrayActiveStates();
    stageHint.style.display = "block";
});

masterVolume.addEventListener("input", (e) => {
    mixer.setVolume(Number(e.target.value));
});

// ---------- Animation & Interactive Stage Lighting Loop ----------

const cycleRingEl = document.getElementById("cycleRing");
const ringProgressEl = document.getElementById("ringProgress");
const stageLightingEl = document.getElementById("stageLighting");
const RING_CIRCUMFERENCE = 2 * Math.PI * 28;

function tickFrame() {
    const progress = mixer.getProgress();
    if (progress === null) {
        ringProgressEl.style.strokeDashoffset = RING_CIRCUMFERENCE;
        cycleRingEl.classList.remove("active");
    } else {
        ringProgressEl.style.strokeDashoffset =
            RING_CIRCUMFERENCE * (1 - progress);
        cycleRingEl.classList.add("active");
    }

    const hasActiveSounds = mixer.activeBySlot.size > 0;
    stageLightingEl.classList.toggle("active", hasActiveSounds);

    const masterAmp = mixer.getMasterAmplitude();
    const bands = mixer.getAudioBands();

    document.documentElement.style.setProperty(
        "--master-amp",
        masterAmp.toFixed(3)
    );
    document.documentElement.style.setProperty(
        "--audio-bass",
        bands.bass.toFixed(3)
    );
    document.documentElement.style.setProperty(
        "--audio-mid",
        bands.mid.toFixed(3)
    );
    document.documentElement.style.setProperty(
        "--audio-treble",
        bands.treble.toFixed(3)
    );

    for (const slot of mixer.activeBySlot.keys()) {
        const amp = mixer.getSlotAmplitude(slot);
        const slotEl = stageEl.querySelector(`[data-slot="${slot}"]`);
        if (slotEl) {
            slotEl.style.setProperty("--amp", amp.toFixed(3));
        }
    }

    requestAnimationFrame(tickFrame);
}
requestAnimationFrame(tickFrame);

// ============================================================
// MIXBOX — SAVE / LOAD / SHARE / IMPORT SYSTEM (MODALS)
// ============================================================

const STORAGE_KEY = "mixbox_saved_mixes_list";
const toastEl = document.getElementById("toast");

const saveMixBtn = document.getElementById("saveMixBtn");
const loadMixBtn = document.getElementById("loadMixBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const saveModal = document.getElementById("saveModal");
const loadModal = document.getElementById("loadModal");

const mixNameInput = document.getElementById("mixNameInput");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");
const modalShareBtn = document.getElementById("modalShareBtn");
const savedMixesList = document.getElementById("savedMixesList");
const pasteUrlInput = document.getElementById("pasteUrlInput");
const confirmLoadUrlBtn = document.getElementById("confirmLoadUrlBtn");

function showToast(msg, duration = 2800) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), duration);
}

function openModal(modal) {
    modalBackdrop.classList.add("open");
    modal.classList.add("open");
}

function closeModals() {
    modalBackdrop.classList.remove("open");
    saveModal.classList.remove("open");
    loadModal.classList.remove("open");
}

modalBackdrop.addEventListener("click", closeModals);
document.querySelectorAll(".modal-close-btn").forEach((btn) => {
    btn.addEventListener("click", closeModals);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModals();
});

function getSavedMixes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function setSavedMixes(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function serializeMix() {
    const slots = [];
    for (const [slot, data] of mixer.activeBySlot.entries()) {
        const ctrl = mixer.getSlotControls(slot) || {
            volume: 1,
            muted: false,
            solo: false,
        };
        slots.push({
            slot: slot,
            id: data.soundId,
            ch: data.chapterId,
            vol: Number(ctrl.volume.toFixed(2)),
            m: ctrl.muted ? 1 : 0,
            s: ctrl.solo ? 1 : 0,
        });
    }

    return {
        v: 1,
        chapter: currentChapterId,
        mixMode: mixChaptersEnabled,
        masterVol: Number(Number(masterVolume.value).toFixed(2)),
        slots: slots,
    };
}

function encodeMixData(obj) {
    try {
        const jsonStr = JSON.stringify(obj);
        return btoa(encodeURIComponent(jsonStr));
    } catch (e) {
        console.error("Encoding error:", e);
        return null;
    }
}

function decodeMixData(base64Str) {
    try {
        const jsonStr = decodeURIComponent(atob(base64Str.trim()));
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Decoding error:", e);
        return null;
    }
}

async function applyMixState(state) {
    if (!state || !Array.isArray(state.slots)) {
        showToast("⚠️ Invalid mix data!");
        return false;
    }

    mixer.ensureContext();
    mixer.stopAll();

    mixChaptersEnabled = !!state.mixMode;
    mixChaptersBtn.classList.toggle("on", mixChaptersEnabled);

    if (typeof state.masterVol === "number") {
        masterVolume.value = state.masterVol;
        mixer.setVolume(state.masterVol);
    }

    const targetChapter = state.chapter || 1;
    await switchChapter(targetChapter, true);

    const requiredChapters = new Set(
        state.slots.map((s) => s.ch || targetChapter)
    );
    for (const chId of requiredChapters) {
        const ch = CHAPTERS[chId];
        if (ch) {
            normalizeChapter(ch);
            if (!mixer.loadedChapters.has(chId)) {
                await mixer.loadChapter(chId, ch.folder, ch.loadable);
            }
        }
    }

    buildSoundIndex();
    renderStage();

    for (const item of state.slots) {
        const snd = findSoundById(item.id);
        const chId = item.ch || targetChapter;
        if (snd) {
            const assignedSlot = mixer.play(chId, snd, item.slot);
            if (assignedSlot !== -1) {
                if (typeof item.vol === "number")
                    mixer.setSlotVolume(assignedSlot, item.vol);
                if (item.m) mixer.toggleMute(assignedSlot);
                if (item.s) mixer.toggleSolo(assignedSlot);
            }
        }
    }

    renderActiveSlots();
    syncTrayActiveStates();
    stageHint.style.display = mixer.activeBySlot.size > 0 ? "none" : "block";
    return true;
}

// ---------- Save Modal Flow ----------

saveMixBtn.addEventListener("click", () => {
    if (mixer.activeBySlot.size === 0) {
        showToast("⚠️ Add some sounds before saving!");
        return;
    }
    const currentMixes = getSavedMixes();
    mixNameInput.value = `Mix #${currentMixes.length + 1}`;
    openModal(saveModal);
    mixNameInput.focus();
    mixNameInput.select();
});

confirmSaveBtn.addEventListener("click", () => {
    const name = mixNameInput.value.trim() || "Untitled Beat";
    const state = serializeMix();
    const currentMixes = getSavedMixes();

    const newMix = {
        id: "mix_" + Date.now(),
        name: name,
        date: new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        soundsCount: state.slots.length,
        state: state,
    };

    currentMixes.unshift(newMix);
    setSavedMixes(currentMixes);

    closeModals();
    showToast(`💾 "${name}" saved!`);
});

modalShareBtn.addEventListener("click", async () => {
    const state = serializeMix();
    const hashData = encodeMixData(state);
    if (!hashData) return;

    const url = new URL(window.location.href);
    url.hash = `mix=${hashData}`;

    try {
        await navigator.clipboard.writeText(url.toString());
        showToast("🔗 Share link copied to clipboard!");
    } catch (e) {
        prompt("Copy this link to share your mix:", url.toString());
    }
});

// ---------- Load Modal Flow ----------

function renderSavedMixesList() {
    const mixes = getSavedMixes();
    savedMixesList.innerHTML = "";

    if (mixes.length === 0) {
        savedMixesList.innerHTML = `<div class="empty-mixes">No saved mixes yet. Create one!</div>`;
        return;
    }

    mixes.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "mix-item";
        row.innerHTML = `
            <div class="mix-info">
                <span class="mix-title">${item.name}</span>
                <span class="mix-meta">${
                    item.soundsCount || item.state.slots.length
                } sounds • ${item.date || "Saved"}</span>
            </div>
            <div class="mix-actions">
                <button class="item-btn item-play" title="Play mix">▶ Play</button>
                <button class="item-btn item-del" title="Delete mix">✕</button>
            </div>
        `;

        row.querySelector(".item-play").addEventListener("click", async () => {
            closeModals();
            showToast(`⏳ Loading "${item.name}"…`);
            await applyMixState(item.state);
            showToast(`✅ "${item.name}" is playing!`);
        });

        row.querySelector(".item-del").addEventListener("click", () => {
            const updated = getSavedMixes().filter((_, i) => i !== index);
            setSavedMixes(updated);
            renderSavedMixesList();
            showToast("🗑️ Mix deleted");
        });

        savedMixesList.appendChild(row);
    });
}

loadMixBtn.addEventListener("click", () => {
    pasteUrlInput.value = "";
    renderSavedMixesList();
    openModal(loadModal);
});

confirmLoadUrlBtn.addEventListener("click", async () => {
    const input = pasteUrlInput.value.trim();
    if (!input) {
        showToast("⚠️ Please paste a link or code!");
        return;
    }

    let code = input;
    if (code.includes("#mix=")) {
        code = code.split("#mix=")[1];
    } else if (code.includes("?mix=")) {
        code = code.split("?mix=")[1];
    }

    const state = decodeMixData(code);
    if (state) {
        closeModals();
        showToast("⏳ Loading mix from URL…");
        const ok = await applyMixState(state);
        if (ok) showToast("✅ Mix loaded!");
    } else {
        showToast("⚠️ Invalid mix link/code!");
    }
});

// Autoplay handler when visiting with URL hash
function checkForUrlMix() {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#mix=")) {
        const code = hash.replace("#mix=", "");
        const state = decodeMixData(code);
        if (state && Array.isArray(state.slots) && state.slots.length > 0) {
            const banner = document.createElement("div");
            banner.className = "shared-banner";
            banner.innerHTML = `
                <span>🎵 A shared mix is ready!</span>
                <button id="playSharedBtn">▶ Load & Play</button>
            `;
            document.body.appendChild(banner);

            document
                .getElementById("playSharedBtn")
                .addEventListener("click", async () => {
                    banner.remove();
                    showToast("⏳ Loading shared mix…");
                    await applyMixState(state);
                    showToast("✅ Enjoy the beat!");
                });
        }
    }
}

// ---------- Init ----------

renderChapterTabs();
renderStage();
switchChapter(currentChapterId);
setTimeout(checkForUrlMix, 300);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then((reg) =>
                console.log("Mixbox Service Worker Registered!", reg.scope)
            )
            .catch((err) =>
                console.error("Service Worker registration failed:", err)
            );
    });
}
