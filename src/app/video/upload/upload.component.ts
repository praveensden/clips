import { Component, OnDestroy } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! your clip is being uploaded';
  inSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;
  screenshots: string[] = [];
  selectedScreenshot: string = '';
  screenshotTask?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => {
      this.user = user;
    });
    this.ffmpegService.init();
  }
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new FormGroup({
    title: this.title,
  });
  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }
    this.isDragover = false;
    this.file = ($event as DragEvent)
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      console.log(this.file);
    }
    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];
    this.title.setValue((this.file?.name as string).replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }
  async uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! your clip is being uploaded';
    this.inSubmission = true;
    this.showPercentage = true;
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;
    this.task = this.storage.upload(clipPath, this.file);
    const clipref = this.storage.ref(clipPath);
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) {
        return;
      }
      const total = clipProgress + screenshotProgress;
      this.percentage = (total as number) / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipref.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            filename: `${clipPath}.mp4`,
            screenshotFileName: `${clipPath}.png`,
            url: clipUrl,
            screenshotUrl,
            timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipService.createClip(clip);
          this.alertColor = 'green';
          this.alertMsg = ' Your clip is ready to share with world';
          this.showPercentage = false;
          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = ' upload failed';
          this.inSubmission = true;
          this.showPercentage = false;
          console.log(error);
        },
      });
  }
}
