import {Component, Input} from '@angular/core';
import {Checklist} from "../../../shared/models/checklist";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <ul>
      @for (checklist of checklists; track checklist.id){
        <li>
          <a class="underline" routerLink="/checklist/{{ checklist.id }}">
            {{ checklist.title }}
          </a>
        </li>
      } @empty {
        <p>Click the add button to create your first checklist!</p>
      }
    </ul>
  `,
  styles: ``
})
export class ChecklistListComponent {
  @Input({required: true}) checklists!: Checklist[];
}
