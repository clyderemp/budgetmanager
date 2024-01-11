import { db } from '../js/firebase.js'
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

var fname, lname, uid;

$(function(){
    localStorage.clear();
    const auth = getAuth();
    var currentLocation = window.location; //get current html page
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
          console.log('Redirecting....logged in: '+uid);
          window.location.replace("/dashboard/user/home/index.html");
          /**
           * SEND USER TO DASHBOARD IF LOGGED IN
           */
          /*
          var currentPage = currentLocation.pathname.toString();
          if(currentPage=='/signup.html' || currentPage=='/index.html'){
            getDoc(doc(db, "users", uid)).then(docSnap => {
                if (docSnap.exists()) {
                    window.location.replace("dashboard/user/home/index.html");
                } else {
                  logOut();
                }
            });
          }
          */

        } else {
            console.log('logged out');
            handleUserInputWhenLoggedOut();
            var currentPage = currentLocation.pathname.toString();
            if(currentPage=='/dashboard.html'){
                window.location.replace("index.html");
            }
        }
      });

      $('#login-btn').click(function(){
        const auth = getAuth();
        var email = $('#signin-email').val();
        var password = $('#signin-password').val();

        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            window.alert(errorMessage);
          });
    })

});

function handleUserInputWhenLoggedOut(){

    const auth = getAuth();
        //SIGN UP BUTTON HANDLER
        $('#sign-up').click(function(){
            window.location.href = "signup.html";
        })
        $('#log-in').click(function(){
            window.location.href = "index.html";
        })
    
        //SIGN UP SUBMISSION
        $('#signup-submit').click(function(){
            //USER INFOS
            var email = $('#signup-username').val();
            var password = $('#signup-password').val();
            fname = $('#signup-fname').val();
            lname = $('#signup-lname').val();
            var creationDate = (new Date()).toDateString().split(' ').slice(1).join(' ');
            var new_account = true;
    
            //CREATE ACCOUNT
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed up 
                    const user = userCredential.user;
                    uid = user.uid;
    
                    var docData = {
                        id: uid,
                        fname: fname,
                        lname: lname,
                        creationDate: creationDate,
                        lastSave: 'N/A',
                        lastDelete: 'N/A',
                        new_account: new_account
                    };

                    setDoc(doc(db, "users", uid), docData).then(function(){
                        
                        sendEmailVerification(auth.currentUser);
                        window.alert("Account Created!");
                        window.location.href = "dashboard/user/index.html";
    
                    }).catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        alert(errorMessage);
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    window.alert(errorCode+':'+errorMessage);
                    // ..
                });
        });

}
