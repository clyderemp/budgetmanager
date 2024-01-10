import { db } from '../../../js/firebase.js'
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, deleteDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 


const auth = getAuth();
var co_users = {}

//GENERATING CO USERS TABLE
export async function generateCoUsersTable(coUserData_ID, coUserData){
    co_users = coUserData;
    localStorage.setItem('co_users_data', JSON.stringify(coUserData));
    localStorage.setItem('co_users_id', JSON.stringify(coUserData_ID));
    for(var i = 0; i < coUserData_ID.length; i++){
        var docData = coUserData[coUserData_ID[i]];
        co_users[coUserData_ID] = docData;

        var full_name = docData.fname + ' ' +docData.lname;
        var user_since = docData.createdOn;
        var table_template = '<tr>'+'<td>'+user_since+'</td>'+
                            '<td>'+full_name+'</td>'+
                            '<td class="btn-container"><button class="btn btn-primary btn-sm edit-btn" id="edit.'+coUserData_ID[i]+'">Edit</button> &nbsp;&nbsp; '+
                            '<button class="btn btn-primary btn-sm delete-btn" id="delete.'+coUserData_ID[i]+'">Remove</button></td></tr>';
        $('#users-table').append(table_template);
    }

      var currentPage = window.location.pathname.toString();
    if(currentPage.includes('/manage-users/edit.html')){
        loadEditPage(docData.fname, docData.lname, docData.dob, docData.uid);
    }
    else if(currentPage.includes('/manage-users/add.html')){
        itemIDGenerator();
    }
}

$(function(){
    /**
     * FOUND ON ADDING CO USER PAGE
     */
    $('#add-submitUser').click(function(){

        var fname = $('#add-fname').val();
        var lname = $('#add-lname').val();
        var dob = ($('#add-dob').val()).toString();
        var creationDate = (new Date()).toDateString().split(' ').slice(1).join(' ');

        var id = itemIDGenerator();
        var uid = localStorage.getItem('uid');
        var docData = {
            uid: id,
            fname: fname,
            lname: lname,
            dob: dob,
            createdOn: creationDate
        }
            newSaveReportToDB( id , uid , docData);
    });

    //FOUND IN EDITING CO USER DATA
    $('#edit-submitReport').click(function(){
        var fname = $('#edit-fname').val();
        var lname = $('#edit-lname').val();
        var dob = $('#edit-dob').val();

        var id = $('#edit-uid').val();
        var uid = localStorage.getItem('uid');
        var docData = {
            fname: fname,
            lname: lname,
            dob: dob
        }
        console.log(docData);
        saveEditReportToDB(id, uid, docData);
    });

    /***
     * 
     * 
     * 
     * 
     * 
     */
    $(document).on('click',".edit-btn", function(){
        var co_user_id = (this.id).split('.');
            co_user_id = co_user_id[1];
        localStorage.setItem('selected_user', this.id);
        editCoUser(this.id);
        //window.location.href = "edit.html";
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
        var id = $('#DeleteText').text();
        deleteFromFirestoreDB(id);
    });


});

function openDeleteModal(id){
    // Get the modal
        var modal = document.getElementById("DeleteModal");

        modal.style.display = "block";

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

    $('#DeleteText').text(id);
}

function deleteFromFirestoreDB(item_id){
    var uid = localStorage.getItem('uid');
    deleteDoc(doc(db, "users/"+uid+'/co_users', item_id)).
        then(function(err){
            //window.alert("User has been permanently removed!");
            location.reload();
    });
}
/**
 * SAVE DATA TO FIRESTORE
 */
function saveEditReportToDB(item_id, uid, docData){

    updateDoc(doc(db, "users/"+uid+"/co_users", item_id ), docData)
                .then(function(){
                //window.alert("Saved!");
                window.location.href = "view.html";

                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    window.alert(errorMessage);
    });
}
function newSaveReportToDB(item_id, uid, docData){

    setDoc(doc(db, "users/"+uid+"/co_users/", item_id ), docData)
                .then(function(){
                //window.alert("Saved!");
                window.location.href = "view.html";

                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    window.alert(errorMessage);
    });
}
/**
 * FOR EDITING CO USERS
 */
function editCoUser(selected_user){
    localStorage.setItem('selected_user', selected_user);
    localStorage.setItem('co_users', co_users);

    for( selected_user in co_users){
        var fname = co_users[selected_user].fname;
        var lname = co_users[selected_user].lname;
        var dob = co_users[selected_user].dob;
        
        $('#edit-fname').val(fname);
        $('#edit-lname').val(lname);
        $('#edit-dob').val(dob);

        window.location.replace('edit.html');
    }
}

function loadEditPage(fname, lname, dob, uid){
    $('#edit-uid').val(uid);
    $('#edit-fname').val(fname);
    $('#edit-lname').val(lname);
    $('#edit-dob').val(dob);
}

/**
 * FOR ADDING CO USERS
 */
/**
 * GENERATE RANDOM ITEM ID
 */
function itemIDGenerator(){
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    var fulldate = [year, month, day].join('-');

    $('#add-date').val(fulldate);

    var item_id =  fulldate+"10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    
    return item_id;
}
