import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export const snapshotToArray = (snapshot: any) => {
  const returnArr = [];

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });
  return returnArr;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  nickname = '';
  ref = firebase.database().ref('users/');
  matcher = new MyErrorStateMatcher();
  isLoadingResults = true;
  users: any;
  constructor(private router: Router,
    private snackBar: MatSnackBar,
    public datepipe: DatePipe
    , private formBuilder: FormBuilder, public httpClient: HttpClient) { }

  ngOnInit() {
    // if (localStorage.getItem('nickname')) {
    //   this.router.navigate(['/roomlist']);
    // }
    this.loginForm = this.formBuilder.group({
      'nickname': [null, Validators.required]
    });
    this.httpClient.get<any>('https://www.delmon-egate.com/api/MainUsers').subscribe(data => {
      console.log(data.value);
      this.users = data.value;
      // this.users.forEach(element => {
      //   this.createUserRooms(element.UserName);
      // });
      this.isLoadingResults = false;
    });
  }
  onSubmit(value) {
    this.nickname = value;
    this.ref.orderByChild('nickname').equalTo(value).once('value', snapshot => {
      if (snapshot.exists()) {
        localStorage.setItem('nickname', value);
        this.router.navigate(['/roomlist']);
      } else {
        const newUser = firebase.database().ref('users/').push();
        newUser.set(value);
        localStorage.setItem('nickname', value);
        this.router.navigate(['/roomlist']);
      }
    });
    //  console.log(value);
  }
   onFormSubmit(form: any) {
    const login = form;
    this.ref.orderByChild('nickname').equalTo(login.nickname).once('value', snapshot => {
      if (snapshot.exists()) {
        localStorage.setItem('nickname', login.nickname);
        this.router.navigate(['/roomlist']);
      } else {
        const newUser = firebase.database().ref('users/').push();
        newUser.set(login);
        localStorage.setItem('nickname', login.nickname);
        this.router.navigate(['/roomlist']);
      }
    });
  }
  createUserRoom(user) {
    const room = { roomname: user };
    this.ref.orderByChild('roomname').equalTo(room.roomname).once('value', (snapshot: any) => {
      if (snapshot.exists()) {
        this.enterChatRoom(user);
      } else {
        const newRoom = firebase.database().ref('rooms/').push();
        newRoom.set(room);
        this.enterChatRoom(user);
      }
    });
  }

  createUserRooms(user) {
    const room = { roomname: user };
    console.log('tag', 'enter');
    console.log('tag', user);
    this.ref.orderByChild('roomname').equalTo(room.roomname).once('value', (snapshot: any) => {
      if (snapshot.exists()) {
        console.log('tag', 'found');
        this.snackBar.open('Room name already exist!');
      } else {
        console.log('tag', 'not found');
        const newRoom = firebase.database().ref('rooms/').push();
        newRoom.set(room);
      }
    });
  }


  enterChatRoom(user) {
    const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
    chat.roomname = user;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.message = `${this.nickname} enter the room`;
    chat.type = 'join';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);

    firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(user).on('value', (resp: any) => {
      let roomuser = [];
      roomuser = snapshotToArray(resp);
      const user = roomuser.find(x => x.nickname === this.nickname);
      if (user !== undefined) {
        const userRef = firebase.database().ref('roomusers/' + user.key);
        userRef.update({ status: 'online' });
      } else {
        const newroomuser = { roomname: '', nickname: '', status: '' };
        newroomuser.roomname = user;
        newroomuser.nickname = this.nickname;
        newroomuser.status = 'online';
        const newRoomUser = firebase.database().ref('roomusers/').push();
        newRoomUser.set(newroomuser);
      }
    });

    this.router.navigate(['/chatroom', this.nickname]);
  }

}
