import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  // isAuthenticated = false;
  constructor(
    public modal: ModalService,
    public auth: AuthService,
    public afAuth: AngularFireAuth,
  ) {
    // this.auth.isAuthenticated$.subscribe(
    // (status) => (this.isAuthenticated = status);
    // );
  }

  openModal($event: Event) {
    $event?.preventDefault();
    this.modal.toggleModal('auth');
  }

  ngOnInit(): void {}
}
