import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  images = [
    { src: 'images/SheServes1.jfif', alt: 'SheServes 1' },
    { src: 'images/SheServes2.jfif', alt: 'SheServes 2' },
    { src: 'images/SheServes3.jfif', alt: 'SheServes 3' },
    { src: 'images/SheServes4.jfif', alt: 'SheServes 4' },
  ];

  currentIndex = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  prev() {
    this.currentIndex.update(i => (i - 1 + this.images.length) % this.images.length);
    this.resetAutoPlay();
  }

  next() {
    this.currentIndex.update(i => (i + 1) % this.images.length);
    this.resetAutoPlay();
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent) {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.next() : this.prev();
    }
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.resetAutoPlay();
  }

  private startAutoPlay() {
    this.timer = setInterval(() => {
      this.currentIndex.update(i => (i + 1) % this.images.length);
    }, 10000);
  }

  private stopAutoPlay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
