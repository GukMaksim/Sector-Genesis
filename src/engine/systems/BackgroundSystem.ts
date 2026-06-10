import * as PIXI from 'pixi.js';

export class BackgroundSystem {
    public container: PIXI.Container;
    private terrainLayer: PIXI.Container;
    private objectLayer: PIXI.Container;
    
    private gridSize = 256;
    public tiles: Map<string, { container: PIXI.Container }> = new Map();

    constructor(stage: PIXI.Container) {
        this.container = new PIXI.Container();
        stage.addChildAt(this.container, 0);
        
        this.terrainLayer = new PIXI.Container();
        this.objectLayer = new PIXI.Container();
        
        this.container.addChild(this.terrainLayer);
        this.container.addChild(this.objectLayer);
        
        this.initInitialTiles();
    }

    private initInitialTiles() {
        // Create a pool of tiles around the start
        for (let x = -2; x <= 3; x++) {
            for (let y = -2; y <= 3; y++) {
                this.createTile(x, y);
            }
        }
    }

    private createTile(tx: number, ty: number) {
        const key = `${tx},${ty}`;
        if (this.tiles.has(key)) return;

        const tileContainer = new PIXI.Container();
        tileContainer.x = tx * this.gridSize;
        tileContainer.y = ty * this.gridSize;

        // 1. Base Ground (Dirt/Grass)
        const ground = new PIXI.Graphics();
        const isGrassy = Math.random() > 0.5;
        const color = isGrassy ? 0x2a3d20 : 0x3d352a; // Muted Green vs Muted Brown
        
        ground.rect(0, 0, this.gridSize, this.gridSize);
        ground.fill(color);
        
        // Add noise/patches
        for (let i = 0; i < 5; i++) {
            ground.beginFill(0x000000, 0.05);
            ground.drawCircle(Math.random() * this.gridSize, Math.random() * this.gridSize, 20 + Math.random() * 40);
            ground.endFill();
        }
        
        tileContainer.addChild(ground);

        // 2. Random Environment Objects
        const rand = Math.random();
        if (rand < 0.2) { // Rock
            const rock = new PIXI.Graphics();
            rock.beginFill(0x555555);
            rock.drawPolygon([0, 10, 10, 0, 25, 5, 20, 20, 5, 15]);
            rock.endFill();
            rock.stroke({ width: 1, color: 0x333333 });
            rock.x = Math.random() * (this.gridSize - 30);
            rock.y = Math.random() * (this.gridSize - 30);
            tileContainer.addChild(rock);
        } else if (rand < 0.3) { // Water/Puddle
            const water = new PIXI.Graphics();
            water.beginFill(0x1a4a6a, 0.6);
            water.drawEllipse(0, 0, 30, 15);
            water.endFill();
            water.x = Math.random() * (this.gridSize - 60) + 30;
            water.y = Math.random() * (this.gridSize - 30) + 15;
            tileContainer.addChild(water);
        } else if (rand < 0.35) { // Tech Debris (Building-like)
            const debris = new PIXI.Graphics();
            debris.beginFill(0x444444);
            debris.drawRect(0, 0, 40, 40);
            debris.endFill();
            debris.stroke({ width: 2, color: 0x222222 });
            // Add some detail
            debris.beginFill(0x00f2ff, 0.5);
            debris.drawRect(10, 10, 10, 10);
            debris.endFill();
            
            debris.x = Math.random() * (this.gridSize - 40);
            debris.y = Math.random() * (this.gridSize - 40);
            tileContainer.addChild(debris);
        }

        this.terrainLayer.addChild(tileContainer);
        this.tiles.set(key, { container: tileContainer });
    }

    public update(playerVelocity: { x: number, y: number }) {
        // Move the whole container
        this.container.x -= playerVelocity.x;
        this.container.y -= playerVelocity.y;

        // Player center in world coords
        const centerX = -this.container.x + window.innerWidth / 2;
        const centerY = -this.container.y + window.innerHeight / 2;

        const currentTileX = Math.floor(centerX / this.gridSize);
        const currentTileY = Math.floor(centerY / this.gridSize);

        // Ensure tiles exist in a 5x5 area around the player
        for (let x = currentTileX - 2; x <= currentTileX + 2; x++) {
            for (let y = currentTileY - 2; y <= currentTileY + 2; y++) {
                this.createTile(x, y);
            }
        }

        // Cull far tiles for performance
        if (this.tiles.size > 100) {
            for (const [key, tileData] of this.tiles.entries()) {
                const [tx, ty] = key.split(',').map(Number);
                if (Math.abs(tx - currentTileX) > 5 || Math.abs(ty - currentTileY) > 5) {
                    this.terrainLayer.removeChild(tileData.container);
                    tileData.container.destroy({ children: true });
                    this.tiles.delete(key);
                }
            }
        }
    }
}
