/**
 * CardSwap Animation Class
 * Ported from React to Vanilla JS + GSAP for Django Template Integration
 */

class CardSwap {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.cards = Array.from(this.container.querySelectorAll('.card-swap-item'));
        if (this.cards.length === 0) return;

        // Configuration
        this.cardDistance = options.cardDistance || 40;
        this.verticalDistance = options.verticalDistance || 40;
        this.delay = options.delay || 4000;
        this.skewAmount = options.skewAmount || 4;
        this.pauseOnHover = options.pauseOnHover !== undefined ? options.pauseOnHover : true;
        
        // Animation Timings (using elastic config from original)
        this.config = {
            ease: 'elastic.out(0.6,0.9)',
            durDrop: 2,
            durMove: 2,
            durReturn: 2,
            promoteOverlap: 0.9,
            returnDelay: 0.05
        };

        // State
        this.order = Array.from({ length: this.cards.length }, (_, i) => i);
        this.tl = null;
        this.interval = null;

        this.init();
    }

    makeSlot(i, total) {
        return {
            x: i * this.cardDistance,
            y: -i * this.verticalDistance,
            z: -i * this.cardDistance * 1.5,
            zIndex: total - i
        };
    }

    placeNow(el, slot) {
        gsap.set(el, {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            xPercent: -50,
            yPercent: -50,
            skewY: this.skewAmount,
            transformOrigin: 'center center',
            zIndex: slot.zIndex,
            force3D: true
        });
    }

    swap() {
        if (this.order.length < 2) return;
        
        const frontIndex = this.order[0];
        const restIndices = this.order.slice(1);
        const elFront = this.cards[frontIndex];
        
        if (!elFront) return;

        this.tl = gsap.timeline();
        
        // Drop the front card down
        this.tl.to(elFront, {
            y: '+=500',
            duration: this.config.durDrop,
            ease: this.config.ease
        });

        // Promote all other cards forward
        this.tl.addLabel('promote', `-=${this.config.durDrop * this.config.promoteOverlap}`);
        
        restIndices.forEach((idx, i) => {
            const el = this.cards[idx];
            if (!el) return;
            
            const slot = this.makeSlot(i, this.cards.length);
            this.tl.set(el, { zIndex: slot.zIndex }, 'promote');
            this.tl.to(
                el,
                {
                    x: slot.x,
                    y: slot.y,
                    z: slot.z,
                    duration: this.config.durMove,
                    ease: this.config.ease
                },
                `promote+=${i * 0.15}`
            );
        });

        // Return the dropped card to the very back
        const backSlot = this.makeSlot(this.cards.length - 1, this.cards.length);
        this.tl.addLabel('return', `promote+=${this.config.durMove * this.config.returnDelay}`);
        
        this.tl.call(() => {
            gsap.set(elFront, { zIndex: backSlot.zIndex });
        }, undefined, 'return');

        this.tl.to(
            elFront,
            {
                x: backSlot.x,
                y: backSlot.y,
                z: backSlot.z,
                duration: this.config.durReturn,
                ease: this.config.ease
            },
            'return'
        );

        // Update internal order array
        this.tl.call(() => {
            this.order = [...restIndices, frontIndex];
        });
    }

    start() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.swap(), this.delay);
    }

    pause() {
        if (this.tl) this.tl.pause();
        if (this.interval) clearInterval(this.interval);
    }

    resume() {
        if (this.tl) this.tl.play();
        this.start();
    }

    init() {
        // Initial Placement
        this.cards.forEach((card, i) => {
            this.placeNow(card, this.makeSlot(i, this.cards.length));
        });

        // Start Animation Loop
        this.start();

        // Hover Interactions
        if (this.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pause());
            this.container.addEventListener('mouseleave', () => this.resume());
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined') {
        new CardSwap('#card-swap-container');
    } else {
        console.warn('CardSwap: GSAP is not loaded.');
    }
});
