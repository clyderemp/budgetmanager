import { db } from '../../..//js/firebase.js'
import { populateType, expense_types, income_type, savings_type, credit_types, populateReporter } from '../js/add.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, doc, setDoc, addDoc, deleteDoc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 


//FOR MONTHS
export const month_strings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
export const month_strings_for_LINEGRAPH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

var item_id = localStorage.getItem('selected_item');
var transactions =  JSON.parse(localStorage.getItem('transactions'));

$(function(){

    setTimeout(function(){
        populateReporter();
        loadEditPage(item_id);
       }, 500);

    $('#edit-category').change(function(){

        if($('#edit-category').val() == "expenses"){
            populateType(expense_types);
            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }
        else if($('#edit-category').val() == "savings"){
            populateType(savings_type);

            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }else if($('#edit-category').val() == "income"){
            populateType(income_type);

            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }else if($('#edit-category').val() == "credit"){
            populateType(credit_types);

            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }
        else{
            $('#type-card').hide();
        }
    });

      $('#edit-item-submitReport').click(function(){
        var item_id = $('#edit-itemID').val();
        var title = $('#edit-title').val();
        var note = $('#edit-note').val();
        var category = $('#edit-category').val();
        var type = $('#edit-type').val();
        var value = parseFloat($('#edit-value').val());
        var paymentMethod = $('#edit-paymentMethod').val();
        var date = ($('#edit-date').val()).toString(),
            dateSplit = date.split("-"),
            month = dateSplit[1],
            day = dateSplit[2],
            year = dateSplit[0];
        var reporter = $('#edit-reportedBy').val();
        var uid = localStorage.getItem('uid');
        var docData = {
            item_id: item_id,
            transaction: title,
            note: note,
            date: date,
            category: category,
            type: type,
            value: value,
            reportedBy: reporter,
            paymentMethod: paymentMethod,
        }

        saveEditReportToDB(item_id, uid, docData);
      });
});

function loadEditPage(item_id){
        try{
        var docData = transactions[item_id];
        var title = docData.transaction;
            var note = docData.note;
            var date = docData.date;
            var value = docData.value;
            var category = docData.category;
            var paymentMethod = docData.paymentMethod;
            var type = docData.type;
            var reportedBy = docData.reportedBy;
            
            if(category == "expenses"){
                populateType(expense_types);
                $('#edit-type-card').removeAttr('hidden');
                $('#edit-type-card').show();
            }
            else if(category == "savings"){
                populateType(savings_type);
    
                $('#edit-type-card').removeAttr('hidden');
                $('#edit-type-card').show();
            }else if(category == "income"){
                populateType(income_type);
    
                $('#edit-type-card').removeAttr('hidden');
                $('#edit-type-card').show();
            }else if(category == "credit"){
                populateType(credit_types);
    
                $('#edit-type-card').removeAttr('hidden');
                $('#edit-type-card').show();
            }
            $('#edit-itemID').val(item_id);
            $('#edit-title').val(title);
            $('#edit-note').val(note);
            $('#edit-date').val(date);
                localStorage.setItem('input-date', date);
            $('#edit-value').val(value);
            $('#edit-paymentMethod').val(paymentMethod);
            $('#edit-type').val(type);
            $('#edit-category').val(category);
            $('#edit-reportedBy').val(reportedBy);
        }
        catch(err){
            console.log(err);
            window.location.replace('transactions-report.html');
        }
}
/**
 * SAVE DATA TO FIRESTORE
 */
function saveEditReportToDB(item_id, uid, docData){
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
}
