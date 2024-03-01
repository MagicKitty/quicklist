import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Checklist, RemoveChecklist } from '../../../shared/models/checklist';
import { input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-checklist-header',

  template: `
    <header>
      <a routerLink="/home">Back</a>
      <h1>
        {{ checklist().title }}
      </h1>
      <div>
        <button (click)="resetChecklist.emit(checklist().id)">Reset</button>
        <button (click)="addItem.emit()">Add item</button>
      </div>
    </header>
  `,
  imports: [RouterLink],
})
export class ChecklistHeaderComponent {
  checklist = input.required<Checklist>();
  @Output() addItem = new EventEmitter<void>();
  @Output() resetChecklist = new EventEmitter<RemoveChecklist>();
}
