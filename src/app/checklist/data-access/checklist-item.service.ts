import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {AddChecklistItem, ChecklistItem, EditChecklistItem, RemoveChecklistItem} from "../../shared/models/checklist-item";
import {Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { StorageService } from '../../shared/data-access/storage.service';
import { RemoveChecklist } from '../../shared/models/checklist';

export type ChecklistItemsState = {
  checklistItems: ChecklistItem[];
  loaded: boolean;
}

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

  constructor() {
    this.checklistRemoved$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter(
          (item) => item.checklistId !== checklistId
        ),
      }))
    );
    
    this.edit$.pipe(takeUntilDestroyed()).subscribe((checklistItem) => 
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItem.id
            ? {...item, title: checklistItem.data.title}
            : item
        )
      }))
    );

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.filter((item) => item.id !== id),
      }))
    );

    this.add$.pipe(takeUntilDestroyed()).subscribe((checklistItem) =>
      this.state.update((state) => ({
        ...state,
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
    );

    this.toggle$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        ),
      }))
    );

    this.reset$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
      this.state.update((state) => ({
        ...state,
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId
            ? { ...item, checked: false }
            : item
        ),
      }))
    );

    this.checklistItemsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (items) =>
        this.state.update((state) => ({
          ...state,
          items,
          loaded: true,
        })),
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    // effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }
}
