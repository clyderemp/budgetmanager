import { db } from '../../../js/firebase.js'
import { getAuth, onAuthStateChanged, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, doc, getDoc, addDoc, deleteDoc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

$(function(){
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
          var email = user.email;
          
            getDoc(doc(db, "users", uid)).then(docSnap => {
                if (docSnap.exists()) {

                var savings = (Math.round((docSnap.data().savings_goal) * 100) / 100).toFixed(2);
                var credit = (Math.round((docSnap.data().credit_balance) * 100) / 100).toFixed(2);
                var credit_max = (Math.round((docSnap.data().credit_max) * 100) / 100).toFixed(2);
                
                localStorage.setItem('savings-goal-value', savings);
                localStorage.setItem('total_credit_balance', credit);
                localStorage.setItem('credit_max', credit_max);

                } else {
                console.log("No such document!");
                }
            });
         }

    });

    $('#settings-submit').click(function(){
        var uid = $('#settings-uid').val();
        var fname = $('#settings-fname').val();
        var lname = $('#settings-lname').val();
        var email = $('#settings-email').val();
        var dob = $('#settings-dob').val();
        var savings = $('#settings-savings').val();
        var credit = $('#settings-credit').val();

        var docData = {
            fname: fname,
            lname: lname,
            email: email,
            dob: dob,
            savings_goal: savings,
            credit_balance: credit,
        }
        saveEditReportToDB(uid, docData);
        updateUsersEmail(email);
    })
});

/**
 * SAVE DATA TO FIRESTORE
 */
function saveEditReportToDB(uid, docData){

    updateDoc(doc(db, "users/", uid ), docData)
                .then(function(){
                window.alert("Edit Saved!");
                location.reload();

                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    window.alert(errorMessage);
    });
}

function updateUsersEmail(new_email){
    const auth = getAuth();
    updateEmail(auth.currentUser, new_email).then(() => {
      }).catch((error) => {
        // An error occurred
        // ...
      });
}

function updateUsersPassword(new_password){
    const auth = getAuth();
    updatePassword(auth.currentUser, new_password).then(() => {
        // Update successful.
        window.alert("Password Updated!");
      }).catch((error) => {
        // An error ocurred
        // ...
      });
}