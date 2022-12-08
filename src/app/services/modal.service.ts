import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];
  constructor() {}
  register(id: string) {
    this.modals.push({
      id,
      visible: false,
    });
    console.log(
      '🚀 ~ file: modal.service.ts:18 ~ ModalService ~ register ~ modals',
      this.modals
    );
  }
  unregister(id: String) {
    this.modals = this.modals.filter((element) => {
      element.id !== id;
    });
  }
  isModalOpen(id: string): boolean {
    return !!this.modals.find((element) => element.id === id)?.visible;
  }
  toggleModal(id: string) {
    const modal = this.modals.find((element) => {
      return element.id === id;
    });

    if (modal) {
      console.log('1111');
      modal.visible = !modal.visible;
    }
  }
}
