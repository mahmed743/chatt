import { Component } from '@angular/core';
import * as firebase from 'firebase';
import * as $ from 'jquery';
const config = {
  apiKey: "AIzaSyDB4mysiPy1VLYxUSXI40JZDNj-BeIT-yQ",
  authDomain: "chatangular-cce4d.firebaseapp.com",
  databaseURL: "https://chatangular-cce4d-default-rtdb.firebaseio.com/",
  projectId: "chatangular-cce4d",
  storageBucket: "chatangular-cce4d.appspot.com",
  messagingSenderId: "219729352800",
  appId: "1:219729352800:web:5fe8fa35433a2f2ed1cb05"
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-chat';

  constructor() {
    firebase.initializeApp(config);
  }
  ngOnInit(){

        $('#action_menu_btn').click(function(){
            $('.action_menu').toggle();
        });
    }
}
