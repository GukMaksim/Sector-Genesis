import * as PIXI from 'pixi.js';

interface ActiveEffect {
    root: PIXI.Container;
    update: (delta: number) => boolean; // return false when done
}

/**
 * Manages temporary visual effects: muzzle flashes, impact sparks, explosions.
 * Add via static methods; the owning system calls updateAll(delta) each frame.
 */
export class VisualEffects {
    private static container: PIXI.Container | null = null;
    private static effects: ActiveEffect[] = [];

    /** Bind to a PIXI container (usually a dedicated effects layer). */
    static init(container: PIXI.Container) {
        VisualEffects.container = container;
    }

    /** Tick all active effects; removes finished ones. */
    static updateAll(delta: number) {
        for (let i = VisualEffects.effects.length - 1; i >= 0; i--) {
            const alive = VisualEffects.effects[i].update(delta);
            if (!alive) {
                const effect = VisualEffects.effects[i];
                effect.root.removeFromParent();
                effect.root.destroy({ children: true });
                VisualEffects.effects.splice(i, 1);
            }
        }
    }

    // ── Muzzle flash ────────────────────────────────────────────

    static muzzleFlash(
        x: number,
        y: number,
        angle: number,
        color: number,
    ) {
        const root = new PIXI.Container();
        root.x = x;
        root.y = y;
        root.rotation = angle;

        const glow = new PIXI.Graphics();
        glow.circle(0, 0, 12);
        glow.fill({ color, alpha: 0.7 });
        glow.x = 14;
        root.addChild(glow);

        const spike = new PIXI.Graphics();
        spike.poly([
            0, -3,
            20, 0,
            0, 3,
        ]);
        spike.fill({ color: 0xffffff, alpha: 0.9 });
        root.addChild(spike);

        VisualEffects.container?.addChild(root);

        let life = 1;
        VisualEffects.effects.push({
            root,
            update(delta: number) {
                life -= delta * 0.08;
                root.alpha = Math.max(0, life);
                root.scale.set(1 + (1 - life) * 1.5);
                return life > 0;
            },
        });
    }

    // ── Impact sparks ──────────────────────────────────────────

    static impactEffect(x: number, y: number, color: number) {
        const count = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            const p = new PIXI.Graphics();
            const r = 1.5 + Math.random() * 2.5;
            p.circle(0, 0, r);
            p.fill({ color, alpha: 0.9 });
            p.x = x;
            p.y = y;

            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3;

            VisualEffects.container?.addChild(p);

            let life = 1;
            VisualEffects.effects.push({
                root: p,
                update(delta: number) {
                    life -= delta * 0.06;
                    p.x += Math.cos(angle) * speed * delta;
                    p.y += Math.sin(angle) * speed * delta;
                    p.alpha = Math.max(0, life * 0.8);
                    return life > 0;
                },
            });
        }
    }

    // ── Explosion (rocket splash) ──────────────────────────────

    static explosionEffect(x: number, y: number, radius: number, color: number) {
        // Expanding shockwave ring
        const ring = new PIXI.Graphics();
        ring.circle(0, 0, 6);
        ring.fill({ color, alpha: 0.4 });
        ring.x = x;
        ring.y = y;
        VisualEffects.container?.addChild(ring);

        let life = 1;
        VisualEffects.effects.push({
            root: ring,
            update(delta: number) {
                life -= delta * 0.035;
                const s = 1 + (1 - life) * (radius / 8);
                ring.scale.set(s);
                ring.alpha = Math.max(0, life * 0.45);
                return life > 0;
            },
        });

        // Secondary fire puff
        const puff = new PIXI.Graphics();
        puff.circle(0, 0, radius * 0.3);
        puff.fill({ color: 0xff6600, alpha: 0.25 });
        puff.x = x;
        puff.y = y;
        VisualEffects.container?.addChild(puff);

        let pLife = 0.6;
        VisualEffects.effects.push({
            root: puff,
            update(delta: number) {
                pLife -= delta * 0.03;
                puff.scale.set(1 + (0.6 - pLife) * 2);
                puff.alpha = Math.max(0, pLife * 0.35);
                return pLife > 0;
            },
        });

        // Sparks
        VisualEffects.impactEffect(x, y, color);
    }

    // ── Plasma trail ───────────────────────────────────────────

    static trailSegment(x: number, y: number, color: number, size: number) {
        const dot = new PIXI.Graphics();
        const r = Math.max(1.5, size * 3);
        dot.circle(0, 0, r);
        dot.fill({ color, alpha: 0.5 });
        dot.x = x;
        dot.y = y;
        VisualEffects.container?.addChild(dot);

        let life = 0.6;
        VisualEffects.effects.push({
            root: dot,
            update(delta: number) {
                life -= delta * 0.04;
                dot.alpha = Math.max(0, life * 0.6);
                return life > 0;
            },
        });
    }

    // ── Cleanup ─────────────────────────────────────────────────

    static clear() {
        for (const e of VisualEffects.effects) {
            e.root.removeFromParent();
            e.root.destroy({ children: true });
        }
        VisualEffects.effects.length = 0;
    }
}
