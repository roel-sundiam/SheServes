import { Component, computed, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationsService } from '../services/registrations.service';
import { CoinsService } from '../services/coins.service';

interface AlphaGroup { letter: string; names: string[]; }

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit {
  private registrationsSvc = inject(RegistrationsService);
  coins = inject(CoinsService);

  allNames    = signal<string[]>([]);
  loading     = signal(true);
  searchQuery = signal('');

  filteredNames = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allNames();
    return this.allNames().filter(n => n.toLowerCase().includes(q));
  });

  alphaGroups = computed<AlphaGroup[]>(() => {
    const groups = new Map<string, string[]>();
    for (const name of this.filteredNames()) {
      const letter = name.charAt(0).toUpperCase();
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter)!.push(name);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, names]) => ({ letter, names }));
  });

  isSearching = computed(() => this.searchQuery().trim().length > 0);

  ngOnInit() {
    this.registrationsSvc.getRegistrations().subscribe({
      next: (data) => {
        const nameCol = this.findNameColumn(data.columns);
        const names = nameCol
          ? [...new Set(data.rows.map(r => this.toTitleCase((r[nameCol] || '').trim())).filter(n => n.length > 0))].sort()
          : [];
        this.allNames.set(names);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private toTitleCase(name: string): string {
    return name.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  private findNameColumn(columns: string[]): string | null {
    const lower = columns.map(c => c.toLowerCase());
    for (const t of ['full name', 'fullname', 'name', 'player name', 'playername']) {
      const idx = lower.indexOf(t);
      if (idx !== -1) return columns[idx];
    }
    for (let i = 0; i < lower.length; i++) {
      if (lower[i].includes('name')) return columns[i];
    }
    return columns[0] ?? null;
  }

  avatarColor(name: string): string {
    const colors = ['#C2185B', '#AD1457', '#7B1FA2', '#6A1B9A', '#1565C0', '#00695C', '#E65100', '#4E342E'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
    return colors[Math.abs(h) % colors.length];
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
  }
}
