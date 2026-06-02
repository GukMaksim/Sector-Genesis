import * as PIXI from 'pixi.js';
import { Entity } from './Entity';

export abstract class Enemy extends Entity {
    public abstract health: number;
    public abstract speed: number;
    public abstract damage: number;
    public abstract xpValue: number;

    protected animationTime: number = Math.random() * 100;

    constructor(x: number, y: number) {
        super();
        this.container.x = x;
        this.container.y = y;
    }

    public update() {}

    public abstract updateWithPlayer(delta: number, playerPos: { x: number, y: number }): void;

    public takeDamage(amount: number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
}

export class Zergling extends Enemy {
    public health: number = 20;
    public speed: number = 2;
    public damage: number = 5;
    public xpValue: number = 10;

    private shell: PIXI.Graphics;
    private head: PIXI.Graphics;
    private claws: PIXI.Graphics;
    private legs: PIXI.Graphics;
    private tail: PIXI.Graphics;
    private spine: PIXI.Graphics;
    private pulse: PIXI.Graphics;

    constructor(x: number, y: number) {
        super(x, y);
        this.shell = new PIXI.Graphics();
        this.head = new PIXI.Graphics();
        this.claws = new PIXI.Graphics();
        this.legs = new PIXI.Graphics();
        this.tail = new PIXI.Graphics();
        this.spine = new PIXI.Graphics();
        this.pulse = new PIXI.Graphics();
        this.draw();

        const enemyContainer = new PIXI.Container();
        enemyContainer.addChild(this.tail);
        enemyContainer.addChild(this.legs);
        enemyContainer.addChild(this.shell);
        enemyContainer.addChild(this.spine);
        enemyContainer.addChild(this.head);
        enemyContainer.addChild(this.claws);
        enemyContainer.addChild(this.pulse);
        enemyContainer.skew.set(-0.12, 0);
        enemyContainer.scale.set(1.1, 0.88);
        enemyContainer.y = 0;
        this.setVisual(enemyContainer);
    }

    private draw() {
        const shellDark = 0x3e1348;
        const shellMain = 0x6f2a7f;
        const shellLight = 0xb16ad0;
        const clawColor = 0xd7e1d4;
        const eyeColor = 0xffe845;
        const veinColor = 0x42144d;
        const acidColor = 0x8aff6a;

        const shadow = new PIXI.Graphics();
        shadow.ellipse(2, 18, 22, 6.5);
        shadow.fill({ color: 0x000000, alpha: 0.24 });
        (this.visual as PIXI.Container).addChildAt(shadow, 0);

        this.tail.clear();
        this.tail.poly([-16, 5, -30, 2, -36, -2, -24, -7, -10, -2]);
        this.tail.fill(shellDark);
        this.tail.stroke({ width: 1, color: veinColor });
        this.tail.poly([-23, 0, -29, -2, -34, 1, -27, 4]);
        this.tail.fill(acidColor);

        this.legs.clear();
        this.legs.poly([-8, 10, -16, 17, -11, 18, -4, 12]);
        this.legs.fill(shellDark);
        this.legs.poly([-2, 11, -6, 19, 0, 20, 5, 13]);
        this.legs.fill(shellMain);
        this.legs.poly([7, 10, 12, 18, 17, 17, 11, 11]);
        this.legs.fill(shellDark);
        this.legs.poly([0, 8, 3, 16, 8, 16, 5, 9]);
        this.legs.fill(shellMain);

        this.shell.clear();
        this.shell.ellipse(0, 1, 20, 11);
        this.shell.fill(shellMain);
        this.shell.stroke({ width: 2, color: shellDark });
        this.shell.ellipse(2, -1, 12, 7);
        this.shell.fill(shellLight);
        this.shell.ellipse(-6, 4, 8, 4);
        this.shell.fill(shellDark);

        this.head.clear();
        this.head.poly([12, -3, 25, -9, 30, -2, 25, 6, 14, 8, 8, 2]);
        this.head.fill(shellMain);
        this.head.stroke({ width: 2, color: shellDark });
        this.head.circle(21, -2, 2.2);
        this.head.fill(eyeColor);
        this.head.circle(24, 2, 1.8);
        this.head.fill(eyeColor);
        this.head.poly([14, 0, 21, -1, 18, 4]);
        this.head.fill(veinColor);
        this.head.poly([18, 5, 21, 10, 26, 6, 22, 2]);
        this.head.fill(acidColor);

        this.claws.clear();
        this.claws.poly([6, 3, 16, 11, 22, 10, 13, 2]);
        this.claws.fill(clawColor);
        this.claws.poly([5, 7, 14, 18, 20, 16, 10, 7]);
        this.claws.fill(clawColor);
        this.claws.poly([3, -2, 12, -8, 19, -7, 10, -2]);
        this.claws.fill(clawColor);

        this.spine.clear();
        this.spine.moveTo(-10, -1);
        this.spine.lineTo(-2, -12);
        this.spine.lineTo(7, -4);
        this.spine.lineTo(16, -14);
        this.spine.lineTo(22, -6);
        this.spine.stroke({ width: 2, color: veinColor });
        this.spine.circle(-2, -10, 2);
        this.spine.fill(acidColor);
        this.spine.circle(7, -6, 2);
        this.spine.fill(acidColor);
        this.spine.circle(16, -11, 2);
        this.spine.fill(acidColor);

        this.pulse.clear();
        this.pulse.circle(4, -7, 8);
        this.pulse.fill({ color: 0xffffff, alpha: 0.03 });
    }

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }) {
        this.updateHealthBar(this.health, 20);
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.container.x += (dx / dist) * this.speed * delta;
            this.container.y += (dy / dist) * this.speed * delta;
            this.container.rotation = Math.atan2(dy, dx) + Math.sin(this.animationTime * 3) * 0.04;

            this.animationTime += delta * 0.2;
            const pulse = Math.sin(this.animationTime * 2.5);
            this.claws.rotation = pulse * 0.28;
            this.shell.scale.set(1 + pulse * 0.04, 1 - pulse * 0.03);
            this.legs.scale.set(1 + pulse * 0.02, 1 - pulse * 0.02);
            this.tail.scale.set(1 + pulse * 0.02, 1);
            this.pulse.alpha = 0.25 + Math.sin(this.animationTime * 4) * 0.12;
        }
    }
}

export class Mutalisk extends Enemy {
    public health: number = 15;
    public speed: number = 4;
    public damage: number = 3;
    public xpValue: number = 20;

    private wings: PIXI.Graphics;
    private body: PIXI.Graphics;
    private head: PIXI.Graphics;
    private tail: PIXI.Graphics;
    private ribs: PIXI.Graphics;
    private glow: PIXI.Graphics;

    constructor(x: number, y: number) {
        super(x, y);
        this.body = new PIXI.Graphics();
        this.wings = new PIXI.Graphics();
        this.head = new PIXI.Graphics();
        this.tail = new PIXI.Graphics();
        this.ribs = new PIXI.Graphics();
        this.glow = new PIXI.Graphics();
        this.draw();

        const enemyContainer = new PIXI.Container();
        enemyContainer.addChild(this.tail);
        enemyContainer.addChild(this.wings);
        enemyContainer.addChild(this.ribs);
        enemyContainer.addChild(this.body);
        enemyContainer.addChild(this.head);
        enemyContainer.addChild(this.glow);
        enemyContainer.skew.set(-0.04, 0);
        enemyContainer.scale.set(1.18, 0.88);
        enemyContainer.y = -1;
        this.setVisual(enemyContainer);
    }

    private draw() {
        const shellDark = 0x251232;
        const shellMain = 0x6e2b8f;
        const shellLight = 0xb069df;
        const wingColor = 0x3d1a65;
        const eyeColor = 0xff5c4d;
        const acidColor = 0x9eff63;

        const shadow = new PIXI.Graphics();
        shadow.ellipse(2, 18, 26, 7);
        shadow.fill({ color: 0x000000, alpha: 0.2 });
        (this.visual as PIXI.Container).addChildAt(shadow, 0);

        this.tail.clear();
        this.tail.poly([-1, 11, -14, 15, -20, 23, -10, 18, 3, 11]);
        this.tail.fill(shellDark);
        this.tail.stroke({ width: 1, color: shellMain });
        this.tail.poly([-1, 12, -7, 18, -1, 21, 4, 14]);
        this.tail.fill(acidColor);

        this.wings.clear();
        this.wings.poly([-5, 2, -30, -12, -13, -2]);
        this.wings.fill(wingColor);
        this.wings.poly([-5, 4, -31, 15, -12, 9]);
        this.wings.fill(wingColor);
        this.wings.poly([3, 2, 31, -12, 12, -2]);
        this.wings.fill(wingColor);
        this.wings.poly([3, 4, 32, 15, 13, 9]);
        this.wings.fill(wingColor);

        this.ribs.clear();
        this.ribs.poly([-8, 1, -1, -8, 7, -6, 12, 0, 7, 6, -2, 7]);
        this.ribs.fill(shellDark);
        this.ribs.stroke({ width: 1.5, color: shellMain });
        this.ribs.poly([-4, 0, 1, -4, 5, -3, 8, 1, 4, 4, 0, 4]);
        this.ribs.fill(shellLight);
        this.ribs.circle(2, -1, 2.2);
        this.ribs.fill(acidColor);

        this.body.clear();
        this.body.ellipse(0, 3, 14, 10);
        this.body.fill(shellMain);
        this.body.stroke({ width: 2, color: shellDark });
        this.body.ellipse(2, 1, 8, 6);
        this.body.fill(shellLight);
        this.body.poly([-9, 2, -4, -5, 0, -6, 4, -5, 9, 2, 6, 8, -6, 8]);
        this.body.fill(shellMain);

        this.head.clear();
        this.head.poly([9, 0, 17, -3, 23, 1, 21, 7, 12, 9, 7, 4]);
        this.head.fill(shellDark);
        this.head.stroke({ width: 1.5, color: shellMain });
        this.head.circle(16, 2, 2);
        this.head.fill(eyeColor);
        this.head.circle(19, 4, 1.8);
        this.head.fill(eyeColor);
        this.head.poly([11, 3, 14, 1, 13, 7]);
        this.head.fill(acidColor);

        this.glow.clear();
        this.glow.circle(0, 4, 16);
        this.glow.fill({ color: 0x7f36ff, alpha: 0.1 });
        this.glow.roundRect(-18, -4, 36, 8, 4);
        this.glow.fill({ color: 0x9f54ff, alpha: 0.05 });
    }

    public updateWithPlayer(delta: number, playerPos: { x: number, y: number }) {
        this.updateHealthBar(this.health, 15);

        this.animationTime += delta * 0.1;
        const dx = playerPos.x - this.container.x;
        const dy = playerPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            const angle = Math.atan2(dy, dx);
            const sideStep = Math.sin(this.animationTime * 2) * 2.5;

            this.container.x += (Math.cos(angle) * this.speed + Math.cos(angle + Math.PI / 2) * sideStep) * delta;
            this.container.y += (Math.sin(angle) * this.speed + Math.sin(angle + Math.PI / 2) * sideStep) * delta;

            this.container.rotation = angle + Math.sin(this.animationTime * 1.4) * 0.04;

            this.wings.scale.y = 0.82 + Math.sin(this.animationTime * 5) * 0.12;
            this.wings.scale.x = 1.04 + Math.sin(this.animationTime * 3) * 0.05;
            this.body.scale.set(1 + Math.sin(this.animationTime * 2.2) * 0.05, 1 + Math.cos(this.animationTime * 2.4) * 0.03);
            this.ribs.scale.set(1 + Math.sin(this.animationTime * 3.5) * 0.03, 1);
            this.glow.alpha = 0.5 + Math.sin(this.animationTime * 4) * 0.14;
        }
    }
}
