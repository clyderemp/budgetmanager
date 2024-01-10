import { db } from '../../../js/firebase.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, doc, setDoc, addDoc, deleteDoc, getDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 
import { transactions, month_strings, monthly_expense_docID, transaction_ID} from './dashboard-analytics.js';

export var selected_edit;

$(function(){

    $('#report-update').append((new Date()).toUTCString());

    $(document).on('click',".edit-btn", function(){
        var id = (this.id).split('.');
        localStorage.setItem('selected_item', id);
        editItem(id);
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
        deleteFromFirestoreDB(id[1]);
    });
    $('#confirm-edit').click(function(){
        window.location.href = "edit.html";
    });

});

export async function populateTransactionTable(){
    for(var i = 0 ; i < transaction_ID.length; i++){
        var docData = transactions[transaction_ID[i]];
            try{
                var id = docData.item_id;
                var title = docData.transaction;
                var note = docData.note;
                var value = docData.value;
                var date = reformatDate(docData.date);
                var category = docData.category.toUpperCase();
                var type = docData.type.toUpperCase();
                var reportedBy = docData.reportedBy;
                
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
                $('#full-transaction-table').append(table_template);
            }
            catch(err){

            }
    }
}
/*
export async function populateExpensesTable(){
    for(var i = 0 ; i < transaction_ID.length; i++){
        var docData = transactions[transaction_ID[i]];
                var id = docData.item_id;
                var title = docData.transaction;
                var note = docData.note;
                var value = docData.value;
                var date = reformatDate(docData.date);
                var category = docData.category.toUpperCase();
                var type = docData.expenseType.toUpperCase();
                var reportedBy = docData.reportedBy;
                
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
                $('#transaction-table').append(table_template);
    }
}
*/


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

function deleteFromFirestoreDB(item_id){
    var uid = localStorage.getItem('uid');
    deleteDoc(doc(db, "users/"+uid+'/transactions', item_id)).
        then(function(err){

            window.alert("Item has been permanently removed!");
            var lastDelete = (new Date()).toDateString().split(' ').slice(1).join(' ');
            var docData = {
                lastDelete: lastDelete
            };

            updateDoc(doc(db, "users", uid), docData);
            location.reload();
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
