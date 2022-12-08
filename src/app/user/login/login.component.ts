import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credentials = {
    email: '',
    password: '',
  };
  showAlert = false;
  alertMessage = 'Plese wait we are logging you in';
  alertColor = 'blue';
  inSubmission = false;
  constructor(private auth: AngularFireAuth) {}

  async login() {
    this.showAlert = true;
    try {
      this.alertMessage = 'Plese wait we are logging you in';
      this.alertColor = 'blue';
      this.inSubmission = true;
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (error) {
      this.inSubmission = false;
      this.alertMessage = 'Unexpected error plese try again later';
      this.alertColor = 'red';
      console.error(error);
      return;
    }
    this.alertMessage = 'Success you are logged in';
    this.alertColor = 'green';
  }
}
