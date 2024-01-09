import { db } from '../../..//js/firebase.js'
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, doc, setDoc, addDoc, deleteDoc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 


//FOR MONTHS
export const month_strings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
export const month_strings_for_LINEGRAPH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

$(function(){
    populateReporter();
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
         localStorage.setItem('uid', uid);
          const query = getDocs(collection(db, "users/"+uid+'/transactions'));

          if(query.empty){
            console.log ('Empty Course Query');
            }
            else{
                console.log('not empty');
                query.then(function(query) {

                    query.forEach(doc => {
                        if(doc.data().item_id == localStorage.getItem('selected_edit')){

                            var title = doc.data().transaction;
                            var note = doc.data().note;
                            var date = doc.data().date;
                            var value = doc.data().value;
                            var category = doc.data().category;
                            var paymentMethod = doc.data().paymentMethod;
                            if(category == 'expenses'){
                                console.log(category)
                                $('#EditExpenseType-card').removeAttr('hidden');
                                $('#EditExpenseType-card').show();
                            }
                            else{
                                $('#EditExpenseType-card').hide();
                            }

                            var type = doc.data().expenseType;
                            var reportedBy = doc.data().reportedBy;
                            
                        
                            $('#edit-title').val(title);
                            $('#edit-note').val(note);
                            $('#edit-date').val(date);
                                localStorage.setItem('input-date', date);
                            $('#edit-value').val(value);
                            $('#edit-paymentMethod').val(paymentMethod);
                            $('#edit-expenseType').val(type);
                            $('#edit-category').val(category);
                            $('#edit-reportedBy').val(reportedBy);
                        }
        
                    })
                })
            }
        }

      });




      $('#edit-submitReport').click(function(){
        var title = $('#edit-title').val();
        var note = $('#edit-note').val();
        var category = $('#edit-category').val();
        var expenseType = $('#edit-expenseType').val();
        var value = $('#edit-value').val();
        var paymentMethod = $('#edit-paymentMethod').val();
        var date = ($('#edit-date').val()).toString(),
            dateSplit = date.split("-"),
            month = dateSplit[1],
            day = dateSplit[2],
            year = dateSplit[0];
        var reporter = $('#edit-reportedBy').val();

        var id = localStorage.getItem('selected_edit');
        var uid = localStorage.getItem('uid');
        var docData = {
            item_id: id,
            transaction: title,
            note: note,
            date: date,
            category: category,
            expenseType: expenseType,
            value: value,
            paymentMethod: paymentMethod,
            reportedBy: reporter
        }

        saveEditReportToDB(id,uid, month, day, year, docData);
      });
});

/**
 * SAVE DATA TO FIRESTORE
 */
function saveEditReportToDB(item_id, uid, month, day, year, docData){

    var lastEdit = (new Date()).toDateString();
    var lastEditData = {
        lastEdit: lastEdit
    }
    updateDoc(doc(db, "users/"+uid ), lastEditData);
    updateDoc(doc(db, "users/"+uid+"/transactions/", item_id ), docData)
                .then(function(){
                window.alert("Edit Saved!");
                window.location.href = "transactions-report.html";

                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    window.alert(errorMessage);
    });


    var prev_date = localStorage.getItem('input-date');
    if( prev_date != docData.date){
        var date_Split = (docData.date).split('-');
        var reportDB = date_Split[0]+'_'+month_strings[date_Split[1]-1];
        deleteDoc(doc(db, "users/"+uid+"/"+docData.category+"/"+reportDB+'/'+reportDB, item_id));
    }
}

function populateReporter(){
    var user = localStorage.getItem('fullname');
    console.log(user)
    const reporter = [
        "Me - "+user,
   ]

   const auth = getAuth();
   onAuthStateChanged(auth, (user) => {
       if (user) {
         // User is signed in, see docs for a list of available properties
         // https://firebase.google.com/docs/reference/js/auth.user
         const uid = user.uid;
        
         const query = getDocs(collection(db, "users/"+uid+'/co_users'));

         if(query.empty){
           console.log ('Empty Course Query');
           }
           else{
               //console.log('not empty');
               query.then(function(query) {
                   query.forEach(doc => {
                       var fname = doc.data().fname;
                       var lname = doc.data().lname;
                       var co_users = fname+' '+lname;
                       
                       //ADD TO ARRAY
                       reporter.push(co_users);                     
                   });
                   //POPULATE THE DROPDOWN USING THE ARRAY VALUES
                   for(var index = 0; index < reporter.length; index++){
                        var option_template = "<option value="+reporter[index]+">"+reporter[index]+"</option>";
                    
                        $('#edit-reportedBy').append(option_template);
                }
               })
           }
       }
   });
}