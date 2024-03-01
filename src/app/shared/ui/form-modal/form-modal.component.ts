import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KeyValuePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, KeyValuePipe, TitleCasePipe],

  template: `
    <header class="flex justify-between">
      <h2>{{ title() }}</h2>
      <button class="p-4 font-semibold" (click)="closed.emit()">X</button>
    </header>
    <section>
      <form
        class="flex flex-col gap-4"
        [formGroup]="formGroup()"
        (ngSubmit)="save.emit(); closed.emit()"
      >
        @for (control of formGroup().controls | keyvalue; track control.key) {
          <div class="flex gap-2 items-center">
            <label [for]="control.key">{{ control.key | titlecase }}</label>
            <input
              class="border rounded px-2 py-1"
              [id]="control.key"
              type="text"
              [formControlName]="control.key"
            />
          </div>
        }
        <button class="px-4 py-2 border-2 rounded w-fit" type="submit">Save</button>
      </form>
    </section>
  `,
  styles: [``],
})
export class FormModalComponent {
  formGroup = input.required<FormGroup>();
  title = input.required<string>();
  @Output() save = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
}
