import { gravity, horizontalFriction, verticalFriction } from "../constants";
import { Obstacle, Sink } from "../objects";
import { pad, unpad } from "../padding";

export class Ball {
  private x: number;
  private y: number;
  private radius: number;
  private color: string;
  private vx: number = 0;
  private vy: number = 0;
  private ctx: CanvasRenderingContext2D;
  private obstacles: Obstacle[];
  private sinks: Sink[];
  private onFinish: (index: number) => void;
  private positions: Array<{x: number, y: number}> = [];
  private readonly TRAIL_LENGTH = 30;
    
  constructor(x: number, y: number, radius: number, color: string, ctx: CanvasRenderingContext2D, obstacles: Obstacle[], sinks: Sink[], onFinish: (index: number) => void) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.ctx = ctx;
      this.obstacles = obstacles;
      this.sinks = sinks;
      this.onFinish = onFinish;
  }

  draw() {
      // Update trail positions
      this.positions.unshift({ x: this.x, y: this.y });
      if (this.positions.length > this.TRAIL_LENGTH) {
          this.positions.pop();
      }


    // Use gradient for trail
    this.positions.forEach((pos, index) => {
        const alpha = (this.TRAIL_LENGTH - index) / this.TRAIL_LENGTH;
        this.ctx.beginPath();
        this.ctx.arc(unpad(pos.x), unpad(pos.y), this.radius * (1 - index/this.TRAIL_LENGTH), 0, Math.PI * 2);
        const gradient = this.ctx.createRadialGradient(unpad(pos.x), unpad(pos.y), 0, unpad(pos.x), unpad(pos.y), this.radius);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    })

      // Draw main ball
      this.ctx.beginPath();
      this.ctx.arc(unpad(this.x), unpad(this.y), this.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.color;
      this.ctx.fill();
  }

  update() {
      this.vy += gravity;
      this.x += this.vx;
      this.y += this.vy;

      // Collision with obstacles
      this.obstacles.forEach(obstacle => {
          const dist = Math.hypot(this.x - obstacle.x, this.y - obstacle.y);
          if (dist < pad(this.radius + obstacle.radius)) {
              const angle = Math.atan2(this.y - obstacle.y, this.x - obstacle.x);
              const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
              this.vx = Math.cos(angle) * speed * horizontalFriction;
              this.vy = Math.sin(angle) * speed * verticalFriction;
              
              const overlap = this.radius + obstacle.radius - unpad(dist);
              this.x += pad(Math.cos(angle) * overlap);
              this.y += pad(Math.sin(angle) * overlap);
          }
      });

      // Collision with sinks
      for (let i = 0; i < this.sinks.length; i++) {
          const sink = this.sinks[i];
          if (unpad(this.x) > sink.x - sink.width/2 && 
              unpad(this.x) < sink.x + sink.width/2 && 
              (unpad(this.y) + this.radius) > (sink.y - sink.height/2)) {
              this.vx = 0;
              this.vy = 0;
              this.onFinish(i);
              break;
          }
      }
  }
}