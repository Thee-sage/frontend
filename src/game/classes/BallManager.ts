import { HEIGHT, WIDTH, ballRadius, obstacleRadius, sinkWidth } from "../constants";
import { Obstacle, Sink, createObstacles, createSinks } from "../objects";
import { pad, unpad } from "../padding";
import { Ball } from "./Ball";
import backgroundImage from './background.jpg';
export class BallManager {
    private balls: Ball[];
    private canvasRef: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private obstacles: Obstacle[]
    private sinks: Sink[]
    private requestId?: number;
    private onFinish?: (index: number,startX?: number) => void;
    private hoveredSink: number | null = null;
    private backgroundImage: HTMLImageElement;
    private isBackgroundLoaded: boolean = false;
    private scale: number = 1;

    private probabilities: Record<string, number> = {
        "0": 0.2,      
        "1": 0.45,     
        "2": 0.9,      
        "3": 3.0,      
        "4": 7.0,      
        "5": 7.45,     
        "6": 9.7,      
        "7": 12.5,     
        "8": 16.8,     
        "9": 12.5,     
        "10": 9.7,     
        "11": 7.45,    
        "12": 7.0,     
        "13": 3.0,     
        "14": 0.9,     
        "15": 0.45,    
        "16": 0.2      
    };
    
    constructor(canvasRef: HTMLCanvasElement, onFinish?: (index: number,startX?: number) => void) {
        this.balls = [];
        this.canvasRef = canvasRef;
        this.ctx = this.canvasRef.getContext("2d")!;
        this.obstacles = createObstacles();
        this.sinks = createSinks();
        this.onFinish = onFinish;
        
        // Set initial canvas size
        this.setCanvasSize();
        
        this.backgroundImage = new Image();
        this.backgroundImage.src = backgroundImage;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        
        // Add event listeners
        window.addEventListener('resize', this.handleResize.bind(this));
        this.canvasRef.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        this.update();
    }

    private setCanvasSize() {
        const container = this.canvasRef.parentElement;
        if (!container) return;

        // Get container dimensions
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate scale while maintaining aspect ratio
        const scaleX = containerWidth / WIDTH;
        const scaleY = containerHeight / HEIGHT;
        this.scale = Math.min(scaleX, scaleY);

        // Set canvas size
        this.canvasRef.width = WIDTH * this.scale;
        this.canvasRef.height = HEIGHT * this.scale;

        // Scale the context
        this.ctx.scale(this.scale, this.scale);
    }

    private handleResize() {
        // Reset the scale and canvas size
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.setCanvasSize();
    }

    private handleMouseMove(event: MouseEvent) {
        const rect = this.canvasRef.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.scale;
        const y = (event.clientY - rect.top) / this.scale;
    
        this.hoveredSink = null;
        for (let i = 0; i < this.sinks.length; i++) {
            const sink = this.sinks[i];
            if (
                x >= sink.x && 
                x <= sink.x + sink.width && 
                y >= sink.y - sink.height/2 && 
                y <= sink.y + sink.height/2
            ) {
                this.hoveredSink = i;
                break;
            }
        }
    }

    addBall(startX?: number) {
        const newBall = new Ball(
            startX || pad(WIDTH / 2 + 13),
            pad(50),
            ballRadius,
            'gold',
            this.ctx,
            this.obstacles,
            this.sinks,
            (index) => {
                this.balls = this.balls.filter(ball => ball !== newBall);
                this.onFinish?.(index, startX);
            }
        );
        this.balls.push(newBall);
    }

    drawObstacles() {
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = 'white';
        this.obstacles.forEach((obstacle) => {
            this.ctx.beginPath();
            this.ctx.arc(unpad(obstacle.x), unpad(obstacle.y), obstacle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        });
        this.ctx.shadowBlur = 0;
    }
  
    getColor(index: number) {
        if (index <= 1 || index >= 15) {
            return {background: '#ff003f', color: 'white'};
        }
        if (index <= 3 || index >= 13) {
            return {background: '#ff7f00', color: 'white'};
        }
        if (index <= 5 || index >= 11) {
            return {background: '#ffbf00', color: 'white'};
        }
        if (index <= 7 || index >= 9) {
            return {background: '#ffff00', color: 'black'};
        }
        return {background: '#7fff00', color: 'black'};
    }

    private drawSinks() {
        const SPACING = obstacleRadius * 2;
        for (let i = 0; i < this.sinks.length; i++) {
            const sink = this.sinks[i];
            
            const gradient = this.ctx.createLinearGradient(sink.x, sink.y - sink.height/2, sink.x, sink.y + sink.height/2);
            const baseColor = this.getColor(i).background;
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, this.adjustColor(baseColor, -30));
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(sink.x, sink.y - sink.height / 2, sink.width - SPACING, sink.height);
            
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillStyle = this.getColor(i).color;
            this.ctx.font = 'bold 13px Arial';
            this.ctx.fillText((sink?.multiplier)?.toString() + "x", sink.x - 15 + sinkWidth / 2, sink.y);
            this.ctx.shadowBlur = 0;
            
            if (this.hoveredSink === i) {
                const glowGradient = this.ctx.createRadialGradient(
                    sink.x + sinkWidth/2 - SPACING/2, 
                    sink.y, 
                    0, 
                    sink.x + sinkWidth/2 - SPACING/2, 
                    sink.y, 
                    40
                );
                glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
                glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = glowGradient;
                this.ctx.fillRect(sink.x - 10, sink.y - sink.height, sink.width - SPACING + 20, sink.height * 2);
    
                const tooltipHeight = 24;
                const tooltipWidth = 70;
                const tooltipX = sink.x - (tooltipWidth - sink.width + SPACING) / 2;
                const tooltipY = sink.y - sink.height/2 - tooltipHeight - 5;
                
                this.ctx.beginPath();
                this.ctx.moveTo(tooltipX + 5, tooltipY);
                this.ctx.lineTo(tooltipX + tooltipWidth - 5, tooltipY);
                this.ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY, tooltipX + tooltipWidth, tooltipY + 5);
                this.ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight - 5);
                this.ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight, tooltipX + tooltipWidth - 5, tooltipY + tooltipHeight);
                
                const arrowSize = 5;
                this.ctx.lineTo(tooltipX + (tooltipWidth + sink.width - SPACING) / 2 + arrowSize, tooltipY + tooltipHeight);
                this.ctx.lineTo(tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight + arrowSize);
                this.ctx.lineTo(tooltipX + (tooltipWidth - sink.width + SPACING) / 2 - arrowSize, tooltipY + tooltipHeight);
                
                this.ctx.lineTo(tooltipX + 5, tooltipY + tooltipHeight);
                this.ctx.quadraticCurveTo(tooltipX, tooltipY + tooltipHeight, tooltipX, tooltipY + tooltipHeight - 5);
                this.ctx.lineTo(tooltipX, tooltipY + 5);
                this.ctx.quadraticCurveTo(tooltipX, tooltipY, tooltipX + 5, tooltipY);
                
                const tooltipGradient = this.ctx.createLinearGradient(tooltipX, tooltipY, tooltipX, tooltipY + tooltipHeight);
                tooltipGradient.addColorStop(0, 'rgba(40, 44, 52, 0.95)');
                tooltipGradient.addColorStop(1, 'rgba(30, 33, 40, 0.95)');
                this.ctx.fillStyle = tooltipGradient;
                this.ctx.fill();
                
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    `${this.probabilities[i.toString()].toFixed(1)}%`,
                    tooltipX + tooltipWidth/2,
                    tooltipY + tooltipHeight/2 + 4
                );
                this.ctx.textAlign = 'left';
            }
        }
    }

    draw() {
        // Clear with scale
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
        this.ctx.restore();
        
        if (this.isBackgroundLoaded) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, WIDTH, HEIGHT);
            
            // Optional semi-transparent overlay for better visibility
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, HEIGHT);
            gradient.addColorStop(0, '#181818');
            gradient.addColorStop(1, '#282828');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
        
        this.drawObstacles();
        this.drawSinks();
        this.balls.forEach(ball => {
            ball.draw();
            ball.update();
        });
    }
    
    update() {
        this.draw();
        this.requestId = requestAnimationFrame(this.update.bind(this));
    }

    stop() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
        window.removeEventListener('resize', this.handleResize.bind(this));
        this.canvasRef.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    private adjustColor(color: string, percent: number): string {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return `#${(0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1)}`;
    }
}