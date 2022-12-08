import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { delay, filter, map, Observable, of, switchMap } from 'rxjs';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedDelay$: Observable<boolean>;
  private redirect = false;
  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userCollection = this.db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
    this.isAuthenticatedDelay$ = this.isAuthenticated$.pipe(delay(1000));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data?.['authOnly'] ?? false;
      });
  }

  public async createUser(userData: IUser) {
    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email as string,
      userData.password as string
    );
    if (!userCred.user) throw new Error('User cant be found');
    await this.userCollection.doc(userCred.user?.uid).set({
      name: userData.name,
      age: userData.age,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
    });
    await userCred.user.updateProfile({ displayName: userData.name });
    console.log(
      '🚀 ~ file: register.component.ts ~ line 51 ~ RegisterComponent ~ registerSubmit ~ userCred',
      userCred.user?.uid
    );
  }
  public async logout($event: Event) {
    if ($event) {
      $event.preventDefault();
    }
    await this.auth.signOut();
    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
