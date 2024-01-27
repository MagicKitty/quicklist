import {Component, effect, inject, signal} from '@angular/core';
import {ModalComponent} from "../shared/ui/modal/modal.component";
import {Checklist} from "../shared/models/checklist";
import {FormBuilder} from "@angular/forms";
import {FormModalComponent} from "../shared/ui/form-modal/form-modal.component";
import {ChecklistService} from "../shared/data-access/checklist.service";
import {ChecklistListComponent} from "./ui/checklist-list/checklist-list.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ModalComponent,
    FormModalComponent,
    ChecklistListComponent
  ],
  template: `
    <header>
      <h1 class="text-2xl leading-10">Quicklists</h1>
      <button class="px-4 py-2 border-2 rounded" (click)="checklistBeingEdited?.set({})">Add Checklist</button>
    </header>

    <app-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template>
        <app-form-modal
          [title]="
            checklistBeingEdited()?.title
              ? checklistBeingEdited()!.title!
              : 'Add Checklist'
          "
          [formGroup]="checklistForm"
          (close)="checklistBeingEdited.set(null)"
          (save)="checklistService.add$.next(checklistForm.getRawValue())"
        />
      </ng-template>
    </app-modal>

    <section>
      <h2>Your checklists:</h2>
      <app-checklist-list [checklists]="checklistService.checklists()" />
    </section>
  `,
  styles: ``
})
export default class HomeComponent {
  #formBuilder = inject(FormBuilder);
  checklistService = inject(ChecklistService);

  checklistBeingEdited = signal<Partial<Checklist> | null>(null);

  checklistForm = this.#formBuilder.nonNullable.group({
    title: [''],
  });

  constructor() {
    effect(() => {
      const checklist = this.checklistBeingEdited();

      if (!checklist) {
        this.checklistForm.reset();
      }
    });
  }
}
