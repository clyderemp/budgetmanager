import { db } from '../../../js/firebase.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, doc, setDoc, addDoc, deleteDoc, getDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

const   current_year = new Date().getFullYear(),
        current_month = new Date().getMonth()+1;

const month_strings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

$(function(){

    $('#report-update').append((new Date()).toUTCString());

    $(document).on('click',".edit-btn", function(){
        var id = (this.id).split('.');
        openEditModal(id[1]);
    });
    $(document).on('click',".delete-btn", function(){
        var id = (this.id).split('.');
        openDeleteModal(id[1]);
    });

    $(document).on('click',".cancel-btn", function(){
        $('#DeleteModal').hide();
        $('#EditModal').hide();
    });

    $('#confirm-delete').click(function(){
        var item = $('#DeleteText').text();
        var id = item.split(': ');
        checkToDeleteFromReports(id[1]);
        //deleteFromFirestoreDB(id[1]);
    });
    $('#confirm-edit').click(function(){
        window.location.href = "edit.html";
    });

    const auth = getAuth();

    /*
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
                //console.log('not empty');
                query.then(function(query) {
                    query.forEach(doc => {
                        var docDate = (doc.data().date).split('-');
                        var year = parseInt(docDate[0]),
                            month = parseInt(docDate[1]);
                        if(year == current_year && month == current_month && doc.data().category == 'expenses'){
                            
                            var id = doc.data().item_id;
                            var title = doc.data().transaction;
                            var note = doc.data().note;
                            var value = doc.data().value;
                            var date = reformatDate(doc.data().date);
                            var category = doc.data().category.toUpperCase();
                            var type = doc.data().expenseType.toUpperCase();
                            var reportedBy = doc.data().reportedBy;
                            
                            if(category == 'EXPENSES'){
                                var color = 'danger';
                            }else if(category == 'SAVINGS'){
                                var color = 'warning';
                            }if(category == 'INCOME'){
                                var color = 'success';
                            }
                            var table_template = '<tr>'+
                                                    '<td>'+date+'</td>'+
                                                    '<td><span class="badge bg-'+color+'">'+category+'</span></td>'+
                                                    '<td><span class="badge bg-secondary">'+type+'</span></td>'+
                                                    '<td>'+title+'</td>'+
                                                    '<td> $'+value+'</td>'+
                                                    '<td>'+note+'</td>'+
                                                    '<td>'+reportedBy+'</td>'+
                                                    '<td class="btn-container"><button class="btn btn-primary btn-sm edit-btn" id="edit.'+id+'">Edit</button> &nbsp;&nbsp; '+
                                                    '<button class="btn btn-primary btn-sm delete-btn" id="delete.'+id+'">Remove</button></td>'+
                                                '</tr>';
                            $('#latest-transaction-table').append(table_template);
                        }
                    })
                })
            }
        }

      });
      */
     
});


function openDeleteModal(id){
        // Get the modal
            var modal = document.getElementById("DeleteModal");

            var span = document.getElementsByClassName("close")[0];

            modal.style.display = "block";

            window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
    }

    $('#DeleteText').text("ITEM ID: "+id);
}

function openEditModal(id){
    // Get the modal
        localStorage.setItem('selected_edit', id);
        var modal = document.getElementById("EditModal");

        var span = document.getElementsByClassName("close")[0];

        modal.style.display = "block";

        span.onclick = function() {
        modal.style.display = "none";
        }

        window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    $('#EditText').text("ITEM ID: "+id);
}

function deleteFromFirestoreDB(item_id){
    var uid = localStorage.getItem('uid');
    deleteDoc(doc(db, "users/"+uid+'/transactions', item_id)).
        then(function(err){
            var lastDelete = (new Date()).toDateString().split(' ').slice(1).join(' ');
            var docData = {
                lastDelete: lastDelete
            };

            updateDoc(doc(db, "users", uid), docData)
            .then(function(){
                removeFromReportsDB(item_id);
                window.alert("Item has been permanently removed!");
                window.location.href = "transactions-report.html";
                
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                window.alert(errorMessage);
            });

            location.reload();
    });
}

function checkToDeleteFromReports(item_id){
    var uid =  localStorage.getItem('uid');
    getDoc(doc(db, "users/"+uid+"/transactions/", item_id)).then(docSnap => {
        if (docSnap.exists()) {
            var reportType = docSnap.data().category+'_report';
            var date = (docSnap.data().date).split('-');
            var year = date[0];;
            var month_DB = month_strings[parseInt(date[1]-1)];
            var reportType = docSnap.data().category+'_report';
            deleteDoc(doc(db, "users/"+uid+"/"+reportType+"/"+year+'_'+month_DB+'/'+year+'_'+month_DB, item_id));
            deleteFromFirestoreDB(item_id);
        }
    });
}

function reformatDate(date){
    var dateSplit = date.split('-');
    var month = dateSplit[1];
    var day = dateSplit[2];
    var year = dateSplit[0];

    const date_string = month_strings[month-1]+' '+day+', '+year;

    return date_string;
}
