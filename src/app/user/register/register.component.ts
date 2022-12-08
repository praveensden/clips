import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from '../validators/register-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}
  inSubmission = false;
  showAlert = false;
  alertMsg = 'Please wait! Your account is being created.';
  alertColor = 'blue';
  name = new FormControl('', [Validators.required, Validators.minLength(6)]);
  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ]);
  confirm_password = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13),
  ]);

  register = new FormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      confirm_password: this.confirm_password,
      phoneNumber: this.phoneNumber,
    },
    [RegisterValidators.match('password', 'confirm_password')]
  );
  async registerSubmit() {
    this.inSubmission = true;
    this.showAlert = true;
    try {
      await this.auth.createUser(this.register.value as IUser);
    } catch (error) {
      console.error(error);
      this.alertMsg = 'An Error Occured Please try again!!.';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMsg = 'Success! Your account is being created.';
    this.alertColor = 'green';
  }
}
