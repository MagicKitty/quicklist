import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { map, merge, Subject } from 'rxjs';
import { StorageService } from '../../shared/data-access/storage.service';
import { RemoveChecklist } from '../../shared/models/checklist';
import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
} from '../../shared/models/checklist-item';

export type ChecklistItemsState = {
  checklistItems: ChecklistItem[];
  loaded: boolean;
  error: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  storageService = inject(StorageService);

  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();

  // state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
    error: null,
  });

  // selectors
  checklistItems = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded);

  // sources
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklistItem>();
  edit$ = new Subject<EditChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklist>();
  private error$ = new Subject<string>();

  constructor() {
    // reducers
    const nextState$ = merge(
      this.checklistItemsLoaded$.pipe(map((items) => ({ items, loaded: true }))),
      this.error$.pipe(map((error) => ({ error }))),
    );

    connect(this.state)
      .with(nextState$)
      .with(this.checklistRemoved$, (state, checklistId) => ({
        checklistItems: state.checklistItems.filter((item) => item.checklistId !== checklistId),
      }))
      .with(this.edit$, (state, checklistItem) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItem.id ? { ...item, title: checklistItem.data.title } : item,
        ),
      }))
      .with(this.remove$, (state, id) => ({
        checklistItems: state.checklistItems.filter((item) => item.id !== id),
      }))
      .with(this.add$, (state, checklistItem) => ({
        checklistItems: [
          ...state.checklistItems,
          {
            ...checklistItem.item,
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          },
        ],
      }))
      .with(this.toggle$, (state, checklistItemId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId ? { ...item, checked: !item.checked } : item,
        ),
      }))
      .with(this.reset$, (state, checklistId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId ? { ...item, checked: false } : item,
        ),
      }));

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }
}
