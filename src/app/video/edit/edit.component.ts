import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IClip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  constructor(private modal: ModalService, private clipService: ClipService) {}
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();
  inSubmission = false;
  showAlert = false;
  showPercentage = false;
  alertColor = 'blue';
  alertMsg = 'Please wait updating the clip';
  clipID = new FormControl('');
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  });
  ngOnInit(): void {
    this.modal.register('editClip');
  }
  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = false;
    this.showAlert = false;
    this.clipID.setValue((this.activeClip as any).docID);
    this.title.setValue(this.activeClip.title);
  }
  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait updating the clip';
    try {
      await this.clipService.updateClip(
        this.clipID.value as string,
        this.title.value as string
      );
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'something went wrong try again';
    }
    this.activeClip.title = (this.title as any).value;
    this.update.emit(this.activeClip);
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'success';
  }
}
