import { db } from '../../..//js/firebase.js'
import { userData } from '../js/main.js';
import { generateTransactionTable } from '../js/transactionManager.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

//GLOBAL USE
var uid = localStorage.getItem('uid');
var today_date = new Date(),
    year_today = (new Date()).getFullYear();

export var transactions = {},
    transaction_ID = []
//FOR MONTHS
export const month_strings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
export const month_strings_for_LINEGRAPH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
export const days_of_the_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

var docData = {};
//MONTHLY INFO ARRAY
var monthly_expense_array = {};
var monthly_income_array = {};
var monthly_savings_array = {};
var monthly_expense_array_LINEGRAPH = [0,0,0,0,0,0,0,0,0,0,0,0];

//MONTHLY EXPENSE DOC ID
export var monthly_expense_docID = [];
export var monthly_income_docID = [];
export var monthly_savings_docID = [];

// FOR THE HIGHEST AND LOWEST INCOME
var total_expense_val = 0;

// FOR THE HIGHEST AND LOWEST EXPENSE
var max_expense = 0, min_expense = 999999;

//FOR PIE GRAPH
const categories = ["Expenses", "Savings Plan", "Credit Payments"];
var budget_percent = [0,0,0];

//FOR BAR GRAPH
var BARGRAPH_last_year_data = [0,0,0,0,0,0,0,0,0,0,0,0];
var BARGRAPH_this_year_data = [0,0,0,0,0,0,0,0,0,0,0,0];

var credit_payment = 0;

$(function(){
    localStorage.clear();
    updateAnalytics();
});

export function updateAnalytics(){
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
            const uid = user.uid;
            localStorage.setItem('uid', uid);
            const query = getDocs(collection(db, "users/"+uid+'/transactions'));
            
            var currentPage = window.location.pathname.toString();
            
            if(currentPage.includes('user/home/index.html') || currentPage.includes('user/report/transactions-report.html')){
                console.log('on dashboard page');
                try{
                    if(query.empty){
                    console.log ('Empty Course Query');
                    }
                    else{
                        query.then(function(query) {
                            query.forEach(doc => {
                                transactions[doc.id] = doc.data();
                                transaction_ID.push(doc.id);
                                localStorage.setItem('transactions', transactions);

                                    //SORT THE EXPENSES
                                    if(doc.data().category == 'expenses'){
                                        monthly_expense_docID.push(doc.id);
                                    }

                                    //SORT THE SAVINGS
                                    else if(doc.data().category == 'savings'){
                                        monthly_savings_docID.push(doc.id);
                                    }

                                    //SORT THE INCOME
                                    else if(doc.data().category == 'income'){
                                        monthly_income_docID.push(doc.id);
                                    }
                                    
                            });
                        }).then(function(){

                                //FULL TRANSACTION REPORT
                                    generateTransactionTable(transaction_ID, transactions);
                                //UPDATE UI AFTER DATA CHANGE
                            try{
                                updateDashboardUI();
                            }
                            catch(err){
                                //console.log(err);
                            }
                        });
                    }
                }catch(err){
                    //console.log(err);
                }
            }
            else{
                console.log('Not on dashboard page');
            }
        }else{
            localStorage.clear();
        }
    });
}

/**
 * MAINLY UPDATES DATA ON THE USER INTERFACE
 */
function updateDashboardUI(){
    updateAverageMonthlySpending();
    updateAverageMonthlyIncome();
    updateCreditBalance();
    updateSpendingAccount();
    updateHighestAndLowestINCOME_Months();
    updateHighestAndLowestEXPENSES_Months();
    updateTotalSavingsPanel();
    updateTotalYearlySpendingPanel();

    updateGRAPHS();
}

function updateGRAPHS(){
    updateMonthlyGraph(); //NEED TO BE HERE TO PUT VALUES INTO AN ARRAY
    updateBudgePIE();
    updateYearlyComparisonBARGRAPH();
    updateTransactionTable();
}
/**
 * MONTHLY EXPENSE BASED ON CURRENT MONTH
 */
function updateAverageMonthlySpending(){
    var total = 0, prev_total = 0;
    var current_Month = (new Date().getMonth()+1).toString(),
        currentYear = (new Date().getFullYear()).toString(),
        lastYear = (new Date().getFullYear()) - 1;

        var today_date = new Date();
        var lastMonthDate = new Date(today_date);
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    if(monthly_expense_docID.length > 0){
        for(var i = 0 ; i < monthly_expense_docID.length; i++){
            var docData = transactions[monthly_expense_docID[i]];

                    var doc_date = ((docData.date).toString()).replaceAll('-', '/');
                    var date_Split = doc_date.split('/');

                    var year = date_Split[0].toString(),
                        month = parseInt(date_Split[1]).toString();

                    if(year.includes(currentYear) && month.includes(current_Month)){
                        total += parseFloat(docData.value);
                        var monthly_expense_value = convertTo2_Decimals(total);

                        //OUTPUT TO DASHBOARD
                        localStorage.setItem('monthly-expense-value', monthly_expense_value);
                        $('#monthly-expense-value').text(numberWithCommas(monthly_expense_value));
                    }
                    else if(year.includes(lastYear)){
            
                        var convertToDate = new Date(doc_date),
                            doc_month = convertToDate.getMonth(),
                            last_month = lastMonthDate.getMonth();

                        if(doc_month == last_month){
                            prev_total += parseFloat(docData.value);
                            var prev_expense_value = convertTo2_Decimals(prev_total)
                            localStorage.setItem('prev_expense_value', prev_expense_value);
                        }
                    }

                    var current_expense_val = localStorage.getItem('monthly-expense-value');
                    var prev_expense_value = localStorage.getItem('prev_expense_value');

                    
                    var difference = ((current_expense_val - prev_expense_value) / prev_expense_value)*100;
                                difference = convertTo2_Decimals(difference);
                            //CALCULATING THE DIFFERENCE PERCENT
                            if(difference > 0 && !isInfinite(difference)){
                                $('#monthly-expense-percent').addClass('text-danger');
                                $('#monthly-expense-percent').text(difference+'% more');
                            }
                            else if(difference < 0  && !isInfinite(difference)){
                                difference = parseFloat(difference*=-1);
                                $('#monthly-expense-percent').addClass('text-success');
                                $('#monthly-expense-percent').text(difference+'% less');
                            }
                            else{
                                $('#monthly-expense-percent').addClass('text-warning');
                                $('#monthly-expense-percent').text('No changes');
                            }
                            
                            if(prev_expense_value > 0){
                                $('#monthly-expense-percent-after').text("than last month ($"+prev_expense_value+')');
                            }
                            else{
                                $('#monthly-expense-percent-after').text('since last month');
                            }
        }
    }
    else{
        $('#monthly-expense-value').text('0.00');
        $('#monthly-expense-percent-after').text('No Data Available');
    }
}
/**
 * MONTHLY INCOME (DIVIDED BY THE AMOUNT OF MONTHS PASSED IN A YEAR)
 */
function updateAverageMonthlyIncome(){

    var total = 0, prev_total = 0;
    var current_Month = (new Date().getMonth()+1).toString(),
        currentYear = (new Date().getFullYear()).toString(),
        lastYear = (new Date().getFullYear()) - 1;

        var today_date = new Date();
        var lastMonthDate = new Date(today_date);
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    if(monthly_income_docID.length > 0){
        for(var i = 0 ; i < monthly_income_docID.length; i++){
            var docData = transactions[monthly_income_docID[i]]
                    var doc_date = ((docData.date).toString()).replaceAll('-', '/');
                    var date_Split = doc_date.split('/');
                    var year = date_Split[0].toString(),
                        month = parseInt(date_Split[1]).toString();

                    if(year.includes(currentYear) && month.includes(current_Month)){
                        total += parseFloat(docData.value);
                        var monthly_income_value = convertTo2_Decimals(total);

                        localStorage.setItem('monthly_income_value', monthly_income_value);
                        //OUTPUT TO DASHBOARD
                        $('#monthly-income-value').text(numberWithCommas(monthly_income_value));

                    }
                    else if(year.includes(lastYear)){
            
                        var convertToDate = new Date(doc_date),
                            doc_month = convertToDate.getMonth(),
                            last_month = lastMonthDate.getMonth();

                        if(doc_month == last_month){
                            prev_total += parseFloat(docData.value);
                            var prev_income_value = convertTo2_Decimals(prev_total)
                            localStorage.setItem('prev_income_value', prev_income_value);
                            //console.log(prev_income_value)
                        }
                    }
                            var current_income_val = parseFloat(localStorage.getItem('monthly_income_value'));
                            var prev_income_value = parseFloat(localStorage.getItem('prev_income_value'));

                            var difference = ((current_income_val - prev_income_value) / prev_income_value)*100;
                                difference = convertTo2_Decimals(difference);


                            //CALCULATING THE DIFFERENCE PERCENT
                            if(difference > 0 && !isInfinite(difference)){
                                $('#monthly-income-percent').addClass('text-success');
                                $('#monthly-income-percent').text(difference+'% more');
                            }
                            else if(difference < 0 && !isInfinite(difference)){
                                difference = parseFloat(difference*=-1);
                                $('#monthly-income-percent').addClass('text-danger');
                                $('#monthly-income-percent').text(difference+'% less');
                            }
                            else{
                                $('#monthly-income-percent').addClass('text-warning');
                                $('#monthly-income-percent').text('No changes');
                            }

                            if(prev_income_value > 0){
                                $('#monthly-income-percent-after').text("than last month ($"+prev_income_value+')');
                            }
                            else{
                                $('#monthly-income-percent-after').text("since last month");
                            }
        }
    }
    else{
        $('#monthly-income-value').text('0.00');
        $('#monthly-income-percent-after').text('No Data Available');
    }

}
/**
 * CREDIT BALANCE
 */
function updateCreditBalance(){

    $('#credit-balance-value').text('$0.00');
    $('#credit-max-value').text('No Data Available ');
    $('#utilization-percent-value').text("");

    var credit_balance = userData.credit_balance;
    var credit_max = userData.credit_max;

    if(isFinite(credit_max) && isFinite(credit_balance) && transaction_ID.length == 0){
        
        $('#credit-balance-value').text('$'+convertTo2_Decimals(credit_balance));
        $('#utilization-percent-value').text('('+convertTo2_Decimals((credit_balance/credit_max)*100)+'% Utilization)');
        $('#credit-max-value').text('Credit Limit: $'+numberWithCommas(convertTo2_Decimals(credit_max)));
        checkUtilization((credit_balance/credit_max)*100);
    }

    for(var i=0; i < transaction_ID.length; i++){
        var docData = transactions[transaction_ID[i]];
            if(isInfinite(docData.value)){
                docData.value = 0;
            }
            
        try{
            
            if(docData.paymentMethod == 'credit' || docData.type.includes('Loan')){
                credit_balance += parseFloat(docData.value);
            }

            if(docData.type.includes('Credit Payments') || docData.type.includes('Loan Payments')){
                credit_balance -= parseFloat(docData.value); //Remove from balance
                credit_payment += parseFloat(docData.value); //Add to total credits paid
                localStorage.setItem('credit_payment', credit_payment);
            }

            //credit_balance -= credit_payment;
            $('#credit-balance-value').text('$'+convertTo2_Decimals(credit_balance));
            $('#credit-max-value').text('(Max: $'+credit_max+')');
            $('#utilization-percent-value').text(convertTo2_Decimals((credit_balance/credit_max)*100)+'% Utilization');
            checkUtilization((credit_balance/credit_max)*100);
            
        }catch(err){
            console.log(err);
        }
            
    }

    function checkUtilization(Utilization){
        if(Utilization > 30 && Utilization < 59){
            $('#utilization-percent-value').addClass('text-warning');
        }else if(Utilization > 60){
            $('#utilization-percent-value').addClass('text-danger');
        }else{
            $('#utilization-percent-value').addClass('text-success');
        }
    }
}
/**
 * UPDATE SPENDING ACCOUNT
 */
function updateSpendingAccount(){
    
    var income = parseFloat(localStorage.getItem('monthly_income_value'));
    var expenseBudget = parseFloat(userData.expenseBudget),
        savingsBudget = parseFloat(userData.savingsBudget),
        creditPaymentBudget = parseFloat(userData.creditPaymentBudget);
    
    var monthly_expense = ($('#monthly-expense-value').html()).split('$');
        monthly_expense = parseFloat(monthly_expense);

    var monthly_savings = ($('#total-savings-value').html()).split('$');
        monthly_savings = parseFloat(monthly_savings[1]);

    var monthly_credit = ($('#credit-balance-value').html()).split('$');
        monthly_credit = parseFloat(monthly_credit[1]);
    
    console.log( expenseBudget, savingsBudget, creditPaymentBudget);
    console.log( monthly_expense, monthly_savings, monthly_credit);

    var remaining_expense = (income*(expenseBudget/100)) - monthly_expense,
    remaining_savings = (income*(savingsBudget/100)) - monthly_savings,
    remaining_creditPayment = (income*(creditPaymentBudget/100)) - monthly_credit;

    var spending_balance = remaining_expense + remaining_savings + remaining_creditPayment;
    if(isFinite(spending_balance)){
        $('#spending-acc-value').text('$'+numberWithCommas(convertTo2_Decimals(spending_balance)));
        var percent = (spending_balance/income)*100;
        if(percent >= 70){
            $('#spending-acc-text').addClass('text-success');
        } else if(percent < 70 && percent > 40){
            $('#spending-acc-text').addClass('text-warning');
        } else{
            $('#spending-acc-text').addClass('text-danger');
        }
        $('#spending-acc-text').text(convertTo2_Decimals(percent)+'%');
        $('#spending-acc-text-after').text('of your income is left');
    }
    else{
        $('#spending-acc-value').text('$0.00');
        $('#spending-acc-text').text('');
        $('#spending-acc-text-after').text('No Data Available');
    }

}
/**
 * HIGHEST AND LOWEST INCOME
 */
function updateHighestAndLowestINCOME_Months(){
    var max_date, min_date;
   $('#highest-income-value').text('$0.00');
   $('#lowest-income-value').text('$0.00');
   $('#highest-income-text').text('No Data Available');
   $('#lowest-income-text').text('No Data Available');
    
    for(var i = 0; i < transaction_ID.length; i++){
        var docData = transactions[transaction_ID[i]];
        if( (docData.category) == 'income' ){

            var date_split = (docData.date).split('-');
            var month_index = parseInt(date_split[1])-1;
            var month = (month_strings[month_index]).toString();
            var year = (date_split[0]).toString();
            var index = year+'_'+month;
            
            initializeYearMonth(index);
            function initializeYearMonth(index){
                if(!isFinite(monthly_income_array[index])){
                    monthly_income_array[index] = 0;
                }
            }

            monthly_income_array[index] += parseFloat(docData.value);
            let arr = Object.values(monthly_income_array);
                let min_income = Math.min(...arr);
                let max_income = Math.max(...arr);

            
            localStorage.setItem('monthly_income_array', monthly_income_array);

            if(max_income == docData.value){
                max_date = (docData.date).split('-');
            }
            if(min_income == docData.value){
                min_date = (docData.date).split('-');
            }

            $('#highest-income-value').text('$'+numberWithCommas(convertTo2_Decimals(max_income)));
            $('#lowest-income-value').text('$'+numberWithCommas(convertTo2_Decimals(min_income)));

            //OUTPUT ON DASHBOARD
            var max_month = month_strings[parseInt(max_date[1])-1],
                max_final_date = max_month +' '+max_date[0];
                $('#highest-income-text').text(max_final_date);

            var min_month = month_strings[parseInt(min_date[1])-1],
                min_final_date = min_month +' '+min_date[0];
                $('#lowest-income-text').text(min_final_date);
        }
                    
    }
}
/**
 * HIGHEST AND LOWEST EXPENSES
 */
function updateHighestAndLowestEXPENSES_Months(){
    var year_today = (new Date()).getFullYear();
    var max_date, min_date;
    $('#highest-expense-value').text('$0.00');
    $('#lowest-expense-value').text('$0.00');
    $('#highest-expense-text').text('No Data Available');
    $('#lowest-expense-text').text('No Data Available');

    for(var i = 0; i < transaction_ID.length; i++){
        var docData = transactions[transaction_ID[i]];
        if( (docData.category) == 'expenses' ){
            var date_split = (docData.date).split('-');
            var month_index = parseInt(date_split[1])-1;
            var month = (month_strings_for_LINEGRAPH[month_index]).toString();
            var year = (date_split[0]).toString();
            var index = year+'_'+month;
            initializeYearMonth(index);
            function initializeYearMonth(index){
                if(!isFinite(monthly_expense_array[index])){
                    monthly_expense_array[index] = 0;
                }
            }
                monthly_expense_array[index] += parseFloat(docData.value);

            if( (docData.date).includes(year_today.toString())){
                monthly_expense_array_LINEGRAPH[month_index] += parseFloat(docData.value);
            }
            
            localStorage.setItem('monthly_expense_array', monthly_expense_array);
            localStorage.setItem('monthly_expense_array_LINEGRAPH', monthly_expense_array_LINEGRAPH);

            let arr = Object.values(monthly_expense_array);
                let min_expense = Math.min(...arr);
                let max_expense = Math.max(...arr);

            if(max_expense == docData.value){
                max_date = (docData.date).split('-');
            }
            if(min_expense == docData.value){
                min_date = (docData.date).split('-');
            }

            $('#highest-expense-value').text('$'+numberWithCommas(convertTo2_Decimals(max_expense)));
            $('#lowest-expense-value').text('$'+numberWithCommas(convertTo2_Decimals(min_expense)));

            //OUTPUT ON DASHBOARD
            var max_month = month_strings[parseInt(max_date[1])-1],
                max_final_date = max_month +' '+max_date[0];
                $('#highest-expense-text').text(max_final_date);

            var min_month = month_strings[parseInt(min_date[1])-1],
                min_final_date = min_month +' '+min_date[0];
                $('#lowest-expense-text').text(min_final_date);
        }
    }
}
/**
 * FOR THE YEARLY TOTAL SAVINGS
 */
function updateTotalSavingsPanel(){

    $('#total-savings-value').text('$0.00');
    $('#total-savings-percent').text('0%');
    var savings_goal = userData.savings_goal;
            $('#savings-goal-value').text('$'+numberWithCommas(convertTo2_Decimals(savings_goal)));

    var year_today = (new Date()).getFullYear();
    var current_month_index = parseInt((new Date()).getMonth());
    var total = 0;
    var monthly_total = 0;
    
    for(var i=0; i < monthly_savings_docID.length; i++){
        var docData = transactions[monthly_savings_docID[i]];
        if(docData.category == 'savings'){
            total += parseFloat(docData.value);
            var total_savings = (Math.round((total) * 100) / 100).toFixed(2);
            $('#total-savings-value').text('$'+numberWithCommas(total_savings));
            var savings_goal_value =  userData.savings_goal;
            

            if(savings_goal_value > 0){
                var percent = (Math.round(((total_savings/savings_goal_value)*100) * 100) / 100).toFixed(2);
                $('#total-savings-percent').text(percent+'%');
            }
            else{
                $('#total-savings-percent').text(total_savings+'%');
            }

            var date = (docData.date).split('-');
            console.log(date);
            if(date[0].includes(year_today.toString()) && date[1] == (current_month_index+1)){
                monthly_total += parseFloat(docData.value);
                localStorage.setItem('month-total-savings', monthly_total);
                console.log(monthly_total)
            }
        }
    }
}
/**
 * FOR THE YEARLY TOTAL EXPENSE
 */
function updateTotalYearlySpendingPanel(){
    $('#year-total-expense-year-text').text(year_today);
    $('#total-expense-value').text('0.00');
    $('#yearly-trend').text('0.00');

    for (var i = 0; i < transaction_ID.length; i++){
        var docData = transactions[transaction_ID[i]];
        if((docData.date).includes(year_today) && (docData.category).includes('expenses')){
            total_expense_val += parseFloat(docData.value);
            $('#total-expense-value').text(numberWithCommas(convertTo2_Decimals(total_expense_val)));
            localStorage.setItem('total_expense_val', total_expense_val);

            var now = new Date();
            var start = new Date(now.getFullYear(), 0, 0);
            var diff = now - start;
            var oneDay = 1000 * 60 * 60 * 24;
            var days_passed = Math.floor(diff / oneDay);
            
            var days_left = 365 - days_passed;
            var average_per_day = total_expense_val/days_passed;
            var average_per_day_until_end_of_year = average_per_day * days_left;
        
            average_per_day_until_end_of_year = (Math.round((average_per_day_until_end_of_year) * 100) / 100).toFixed(2);
            //average_per_day_until_end_of_year = numberWithCommas(average_per_day_until_end_of_year);
        
            $('#yearly-trend').text(numberWithCommas(average_per_day_until_end_of_year)); //PREDICTED VALUE TO END THE YEAR

        }
    }
}




/**
 * GRAPHS BELOW
 */
function updateMonthlyGraph(){
    try{
        $('#yearly-monthly-spendings').text(year_today+"'s ");
            var ctx = document.getElementById("chartjs-dashboard-line").getContext("2d");
            var gradient = ctx.createLinearGradient(0, 0, 0, 225);
            gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
            gradient.addColorStop(1, "rgba(215, 227, 244, 0)");
        // Line chart
        new Chart(document.getElementById("chartjs-dashboard-line"), {
            type: "line",
            data: {
                    labels: month_strings_for_LINEGRAPH,
                    datasets: [{
                        label: "Expenses ($)",
                        fill: true,
                        backgroundColor: gradient,
                        borderColor: window.theme.primary,
                        data: monthly_expense_array_LINEGRAPH
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    tooltips: {
                        intersect: false
                    },
                    hover: {
                        intersect: true
                    },
                    plugins: {
                        filler: {
                            propagate: false
                        }
                    },
                    scales: {
                        xAxes: [{
                            reverse: true,
                            gridLines: {
                                color: "rgba(0,0,0,0.0)"
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                stepSize: 1000,
                                min: 0
                            },
                            display: true,
                            borderDash: [3, 3],
                            gridLines: {
                                color: "rgba(0,0,0,0.0)"
                            }
                        }]
                    }
                }
        });
    }catch(error){
        //console.log(error);
    }
}
function updateBudgePIE(){

    budget_percent[0] = (userData.expenseBudget);
    budget_percent[1] = (userData.savingsBudget);
    budget_percent[2] = (userData.creditPaymentBudget);
    localStorage.setItem('expenseBudget', budget_percent[0]);
    localStorage.setItem('savingsBudget', budget_percent[1]);
    localStorage.setItem('creditPaymentBudget', budget_percent[2]);

    var income = localStorage.getItem('monthly_income_value');

    var expense = income * budget_percent[0]/100,
        savings = income * budget_percent[1]/100,
        credit = income * budget_percent[2]/100;

    var pie_data = [expense, savings, credit];

    var monthly_expense = ($('#monthly-expense-value').html()).split('$');
        monthly_expense = parseFloat(monthly_expense);

    var monthly_savings = ($('#total-savings-value').html()).split('$');
        monthly_savings = parseFloat(monthly_savings[1]);

    var monthly_credit = credit_payment;

    var value = [monthly_expense, monthly_savings, monthly_credit];
    var legend_strings = []
    $('#pieGraph-text-below').html('');

    for(var i = 0; i<budget_percent.length; i++){
            
            var title = '<tr>'+'<td> Budget for '+categories[i]+' ('+budget_percent[i]+'%)</td>'+'<td class="text-end">';
            var max = '/ <span id="'+categories[i]+'-max">$'+numberWithCommas(convertTo2_Decimals(pie_data[i]))+'</span></td></tr>';

            if(value[i] > pie_data[i]){
                var current = '<span class="text-danger" id="'+categories[i]+'-value">$'+numberWithCommas(convertTo2_Decimals(value[i]))+'</span>';              
            }
            else if(value[i] < pie_data[i]){
                var current = '<span class="text-success" id="'+categories[i]+'-value">$'+numberWithCommas(convertTo2_Decimals(value[i]))+'</span>';   
            }
            else{
                var current = '<span class="text-muted" id="'+categories[i]+'-value">$'+numberWithCommas(convertTo2_Decimals(value[i]))+'</span>';   
            }

            console.log(categories[i], value[i], pie_data[i]);

            var html = title+current+max;
                legend_strings[i] = categories[i]+'('+budget_percent[i]+'%)';
                $('#pieGraph-text-below').append(html);
    }

    if(income!=null)
        $('#pieGraph-income').text(income);
    else
        $('#pieGraph-income').text('0.00');
        
	// Pie chart
	new Chart(document.getElementById("chartjs-dashboard-pie"), {
				type: "pie",
				data: {
					labels: legend_strings,
					datasets: [{
						data: budget_percent,
						backgroundColor: [
							window.theme.warning,
							window.theme.success,
							window.theme.danger
						],
						borderWidth: 1
					}]
				},
				options: {
					responsive: !window.MSInputMethodContext,
					maintainAspectRatio: false,
					legend: {
						display: true
					},
					cutoutPercentage: 0
				}
	});

    var ctx = $("#chartjs-dashboard-pie").get(0).getContext("2d");
    ctx.width = 1;
    ctx.height = 1;
}
function updateYearlyComparisonBARGRAPH(){
    for (var key in monthly_expense_array) {
        var date = key.split('_');
        var year = date[0];
        var month = date[1];
        var currentYear = new Date().getFullYear();
        var lastYear = (new Date().getFullYear())-1;
        var month_index = findMonthIndex(month);
        function findMonthIndex(month){
            for(var i=0; i<month_strings_for_LINEGRAPH.length; i++){

                if(month == month_strings_for_LINEGRAPH[i]){
                    return i;
                }
            }
        }

        if(year == currentYear){
            BARGRAPH_this_year_data[month_index] = monthly_expense_array[key];
        }else if(year == lastYear){
            BARGRAPH_last_year_data[month_index] = monthly_expense_array[key];
        }

    }

			new Chart($('#chartjs-bar'), {
				type: "bar",
				data: {
					labels: month_strings_for_LINEGRAPH,
					datasets: [{
						label: "Last year's expense",
						backgroundColor: "#dee2e6",
						borderColor: window.theme.warning,
						hoverBackgroundColor: window.theme.warning,
						hoverBorderColor: window.theme.warning,
						data: BARGRAPH_last_year_data,
						barPercentage: .60,
						categoryPercentage: .75
					}, {
						label: "This year's expense",
						backgroundColor: window.theme.primary,
						borderColor: window.theme.primary,
						hoverBackgroundColor: window.theme.primary,
						hoverBorderColor: window.theme.primary,
						data: BARGRAPH_this_year_data,
						barPercentage: .80,
						categoryPercentage: .75
					}]
				},
				options: {
					maintainAspectRatio: false,
					legend: {
						display: true
					},
					scales: {
						yAxes: [{
							gridLines: {
								display: true
							},
							stacked: false,
							ticks: {
								stepSize: 1000
							}
						}],
						xAxes: [{
							stacked: false,
							gridLines: {
								color: "transparent"
							}
						}]
					}
				}
			});
}
function updateTransactionTable(){
    var today_date = (new Date().toLocaleDateString()).split('T');
    var day = new Date().getDay();
        today_date = today_date[0];
    var today_date_split = today_date.split('/');
        today_date = today_date_split[2]+'-'+today_date_split[0]+'-'+today_date_split[1];

    var full_date_text = month_strings[parseInt(today_date_split[0]-1)] +' '+parseInt(today_date_split[1])+', '+today_date_split[2]+' ('+days_of_the_week[day-1]+')';
    $('#transaction-table-header').text("Today's Transactions: "+full_date_text);
    var shown_in_table = 0;

    for(var i = 0; i < transaction_ID.length; i++){
        var docData = transactions[transaction_ID[i]];
        var date = (docData.date).replaceAll('-0', '-');
        try{
            if(date == today_date || date.includes(today_date)){
                var title = docData.transaction;
                var note = docData.note;
                var category = docData.category.toUpperCase();
                var reportedBy = docData.reportedBy;
                var value = docData.value;
                
                if(category == 'EXPENSES'){
                    var color = 'danger';
                }else if(category == 'SAVINGS'){
                    var color = 'warning';
                }if(category == 'INCOME'){
                    var color = 'success';
                }

                var table_template = '<tr>'+
                                        '<td>'+title+'</td>'+
                                        '<td class="d-none d-xl-table-cell"> $'+numberWithCommas(convertTo2_Decimals(value))+'</td>'+
                                        '<td><span class="badge bg-'+color+'">'+category+'</span></td>'+
                                        '<td class="d-none d-md-table-cell">'+reportedBy+'</td>'+
                                    '</tr>';
                if(shown_in_table < 5){
                    
                    $('#latest-transaction-table').append(table_template);
                    shown_in_table++;
                }
            }
        }catch(err){

        }
    }
}


//ADDITIONAL FUNCTIONS
function convertTo2_Decimals(x){
    return (Math.round((x) * 100) / 100).toFixed(2);
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function isInfinite(num) {
    return !isFinite(num);
}