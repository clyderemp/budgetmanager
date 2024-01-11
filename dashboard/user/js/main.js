import { db } from '../../..//js/firebase.js';
import { loadProfile, sendCoUserDataToProfile } from './profile.js';
import { generateCoUsersTable } from './coUserManager.js';
import { retrieveDataForSettings } from './settings-user.js';
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, getDocs, collection} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


export var userData = {}, coUserData = {};
export var coUserData_ID = [];

$(function(){
  try{
    disableFutureDatePicker();
  }catch(err){

  }

  $('#logout-btn').click(function(){
    logout();
  });

    var currentLocation = window.location; //get current html page
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
          console.log('logged in: '+uid);
          $('#id_tag').text(uid);
          retrieveUserDataFromFirestore(uid);

          /**
           * SEND USER TO DASHBOARD IF LOGGED IN
           */
          var currentPage = currentLocation.pathname.toString();

          //if(currentPage=='/signup.html' || currentPage=='/index.html'){
            window.location.href = "dashboard/user/index.html";
          //}
        }
        else {
            console.log('logged out');
                window.location.href = "../../../index.html";
        }
      }); 
});

function retrieveUserDataFromFirestore(uid){
    getDoc(doc(db, "users", uid)).then(docSnap => {
        if (docSnap.exists()) {
          userData = docSnap.data();
          localStorage.setItem('userData', JSON.stringify(userData));
          retrieveCoUsersData(uid);
          retrieveDataForSettings(userData);
          var fname = userData.fname;
          var lname = userData.lname;
          var lastDelete = userData.lastDelete;
          var lastSave = userData.lastSave;
          var new_account = userData.new_account;
          var currentPage = window.location.pathname.toString();
          try{
            loadProfile(userData);
          }catch(err){

          }
          //$('#home-Modal').show();
          if(new_account){
            if(!currentPage.includes('settings')){
              $('#home-Modal').show();
              $('#modal-text').html('Welcome!<br>Since your account is new, you will be redirected to a page where you will need to input some information to help us better analyze your data!');
              $('#confirm-new').click(function(){
                  window.location.replace("../settings/user.html");
              })
            }
          }
          feedDataToPage(fname, lname, lastDelete, lastSave);
        } else {
          console.log("No such document!");
        }
    });
}
function retrieveCoUsersData(uid){
            
  const query = getDocs(collection(db, "users/"+uid+'/co_users'));
  
    if(!query.empty){
          
      query.then(function(query) {
              
        query.forEach(doc => {
            coUserData_ID.push(doc.id);
            coUserData[doc.id] = doc.data();

        })
        sendCoUserDataToProfile(coUserData_ID, coUserData);
        generateCoUsersTable(coUserData_ID, coUserData);
      })
      
    }
    
}

function feedDataToPage(fname, lname, lastDelete, lastSave){
    //CAPITALIZE FIRST LETTER
    fname = fname.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
    lname = lname.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });

    localStorage.setItem('fullname',fname+' '+lname); 
    $('#leftnavbar-title').text('Welcome Back, '+fname+'!');
    $("#topright-title").text(fname+' '+lname);

    $('#last-save-txt').append(lastSave);
    $('#last-delete-txt').append(lastDelete);
}


function logout(){
  const auth = getAuth();
  signOut(auth);
}

function disableFutureDatePicker(){
  var today = new Date();
        $('.datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            autoclose:true,
            endDate: "today",
            maxDate: today
        }).on('changeDate', function (ev) {
          console.log(this.value);
                $(this).datepicker('hide');
        });


}
