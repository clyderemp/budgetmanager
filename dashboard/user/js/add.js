import { db } from '../../..//js/firebase.js'
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

export const type = [];
export const expense_types = [
    "Rent",
    'Food: Dining Out',
    "Grocery",
    "Transportation: Commute",
    "Transportation: Gas",
    "Travel",
    "Household Expenses",
    "Vehicle Expenses",
    "Utilities",
    "Personal-Spendings",
    "Recreation",
    "Entertainment",
    "Monthly Subscriptions",
    "Credit Payments",
    "Loan Payments",
    "Others"
];
export const credit_types = [
    "Personal Loan",
    'Credit Card'
];
export const savings_type = [
    "Long Term",
    'Short Term'
];
export const income_type = [
    "Job Paycheque",
    'Tax Return'
]

export var co_users_data = JSON.parse(localStorage.getItem('co_users_data'));
export var co_users_id = JSON.parse(localStorage.getItem('co_users_id'));


var uid, fname, lname,
    creation_date = new Date();


$(function(){
    itemIDGenerator();
    
    var currentPage = window.location.pathname.toString();

    if(currentPage.includes('report/add.html')){
        populateReporter();
    }
    $('#reportedBy-other').click(function(){
        console.log('other clicked');
        $('#otherReporter-name').prop("disabled", false);
    });

    /**
     * IF EXPENSE IS CLICKED, DO THIS
     */
    $('#add-category').change(function(){

        if($('#add-category').val() == "expenses"){
            populateType(expense_types);
            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }
        else if($('#add-category').val() == "savings"){
            populateType(savings_type);

            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }else if($('#add-category').val() == "income"){
            populateType(income_type);

            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }else if($('#add-category').val() == "credit"){
            populateType(credit_types);

            $('#type-card').removeAttr('hidden');
            $('#type-card').show();
        }
        else{
            $('#type-card').hide();
        }
    });

    /**IF ADD NEW PERSON IS CLICKED*/
    $('#add-reportedBy').change(function(){
        if($('#add-reportedBy').val() == "ADD NEW PERSON"){
            $('#otherReporter-name').removeAttr('hidden');
            $('#otherReporter-name').show();
        }
        else{
            $('#otherReporter-name').hide();
        }
    });


    $('#add-submitReport').click(function(){

        var title = $('#add-title').val();
        var note = $('#add-note').val();
        var category = $('#add-category').val();
        var type = $('#add-type').val();
        var value = parseFloat($('#add-value').val());
        var date = $('#add-date').val();
        var reporter = $('#add-reportedBy').val();
        var paymentMethod = $('#add-paymentMethod').val();

        var id = localStorage.getItem('item_id');
        creation_date = new Date();
        var docData = {
            item_id: id,
            transaction: title,
            note: note,
            date: date,
            category: category,
            type: type,
            value: value,
            reportedBy: reporter,
            paymentMethod: paymentMethod,
            creation_date: creation_date
        }

        

        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            uid = user.uid;
            fname = user.fname;
            lname = user.lname;

            //console.log(uid, month, day, year, docData)
            saveReportToDB(id, uid, docData);
            }
            else {
                console.log('logged out');
                    window.location.href = "../../index.html";
            }
        });

    });

});

/**
 * SAVE DATA TO FIRESTORE
 */
function saveReportToDB(item_id, uid, docData){
    var lastSave = (new Date()).toDateString().split(' ').slice(1).join(' ');
    var lastSaveData = {
        lastSave: lastSave
    }
    updateDoc(doc(db, "users/"+uid ), lastSaveData);
    setDoc(doc(db, "users/"+uid+"/transactions/", item_id ), docData)
                .then(function(){
                window.alert("Report Saved!");
                window.location.href = "transactions-report.html";
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    window.alert(errorMessage);
    });
}

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
    localStorage.setItem('item_id', item_id);
    $('#item_id').text(item_id);
}
/**
 * MAINLY HANDLE THE POPULATION OF THE EXPENSE CATEGORY
 */
export function populateType(category_type){
    var type = [];
        type = category_type;
        $('#add-type').html('<option value="N/A" selected>Select the type</option>');
        $('#edit-type').html('<option value="N/A" selected>Select the type</option>');
   for(var index = 0; index < type.length; index++){
        var option_template = "<option value="+JSON.stringify(type[index])+">"+type[index]+"</option>";
        $('#add-type').append(option_template);
        $('#edit-type').append(option_template);
   }
}
/**
 * POPULATE THE USERS AND CO USERS
 */
export async function populateReporter(){
    var user = JSON.parse(localStorage.getItem('userData'));
    console.log(user)
        user = user.fname + ' '+ user.lname;
    const reporter = [
        "Me - "+user,
   ]

   for(var i=0; i<co_users_id.length; i++){
    var data = co_users_data[co_users_id[i]];
    var fname = data.fname,
        lname = data.lname,
        co_users = fname+' '+lname;
                       
        //ADD TO ARRAY
        reporter.push(co_users);
        
   }

   for(var index = 0; index < reporter.length; index++){
        var option_template = "<option value="+JSON.stringify(reporter[index])+">"+reporter[index]+"</option>";

        $('#add-reportedBy').append(option_template);
        $('#edit-reportedBy').append(option_template);
    }
}