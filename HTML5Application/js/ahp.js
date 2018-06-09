var step = 0;
var showc = 4;
var showa = 4;
var arary_comb = [];
var nr_crit = 0;
var matrix_res = [];
var eighvector=[];
var RI={'1':0,'2':0,'3':58/100,'4':9/10,'5':112/100,'6':124/100,'7':132/100,'8':141/100,'9':145/100,'10':149/100}; 
var arr_txt = {"1/2":1/2,"1/3":1/3,"1/4":1/4,"1/5":1/5,"1/6":1/6,"1/7":1/7,"1/8":1/8,"1/9":1/9};
$(document).ready(function(){
    $("#newp").click(function(){
       window.location.reload(true);
    });
    $("#newc").click(function(){
        if($("#title").css('display')==="none"){
            alert("First you have to add a problem!");
            return;
        }
        if(showc<10)
        {
            showc++;
            $(".comparisons_step,.all_matrices_step").hide().html('');
            $(".comparisons_step_2,.all_matrices_step_2").hide().html('');
            $("#next_step_2,#next_step_4,#next_step_6").hide();
            document.getElementsByName("crit_"+showc)[0].style.display ="block";
        }else{
            alert("Maximum number of criterias is 10.");
        }
    });
    $("#remc").click(function(){
        if($("#title").css('display')==="none"){
            alert("First you have to add a problem!");
            return;
        }
        if(showc>2){
            $(".comparisons_step,.all_matrices_step").hide().html('');
            $(".comparisons_step_2,.all_matrices_step_2").hide().html('');
            $("#next_step_2,#next_step_4,#next_step_6").hide();
            document.getElementsByName("crit_"+showc)[0].style.display ="none";
            showc--;
        }else{
            alert("Minimum number of criterias is 10.");
        }
    });
    $("#newa").click(function(){
        if($("#title").css('display')==="none"){
            alert("First you have to add a problem!");
            return;
        }
        if(showa<10){
            showa++;
            $(".comparisons_step_2,.all_matrices_step_2").hide().html('');
            $("#next_step_6").hide();
            document.getElementsByName("alt_"+showa)[0].style.display ="block";
        }else{
            alert("Maximum number of options is 10.");
        }
    });
    $("#rema").click(function(){
        if($("#title").css('display')==="none"){
            alert("First you have to add a problem!");
            return;
        }
        if(showa>2){
            $(".comparisons_step_2,.all_matrices_step_2").hide().html('');
            $("#next_step_6").hide();
            document.getElementsByName("alt_"+showa)[0].style.display ="none";
            showa--;
        }else{
            alert("Minimum number of options is 10.");
        }
    });
    
    //apare modulul de comparatii
    $("#next_step").click(function(){
        step = 2;
        $(".comparisons_step").html('');
        make_form($(".criteria"),"crit_",$(".comparisons_step"));
        $(".comparisons_step").show();
        make_comp();
        $("#next_step_2").show();
    });
    //apare rezolvarea
    $("#next_step_2").click(function(){
        step = 3;
        $(".all_matrices_step").html('');
        var childs = $(".comparisons_step").children();
        make_matrix(childs,$(".all_matrices_step"),nr_crit,"crit_");
        normalize_matrix($(".all_matrices_step"),nr_crit,"crit_");
        $(".all_matrices_step").show();
        $("#next_step_4").show();
    });
    //apare modulul de comparatii pt alternative
    $("#next_step_4").click(function(){
        step = 4;
        $(".comparisons_step_2").html('');
        alternative_form();
        $("#next_step_6").show();
    });
    //apare rezolvarea
    $("#next_step_6").click(function(){
        step = 5;
        $(".all_matrices_step_2").html('');
        alternative_matrix();
    });
});

function alternative_matrix()
{
    var childs = $(".comparisons_step_2").children();
    var j = 0;
    for(var i in childs){
        if(typeof childs[i].classList!=="undefined" && childs[i].classList.length>1){
            j++;
            if(typeof childs_ok!=="undefined"){
                var main_div = document.createElement('div');
                main_div.className = 'pad10 nums_of';
                main_div.innerHTML = "<i>"+document.getElementsByName("crit_"+(j-1))[0].value+"</i>";
                $(".all_matrices_step_2").append(main_div);
                make_matrix(childs_ok,$(".all_matrices_step_2"),nr_crit,"alt_");
                normalize_matrix($(".all_matrices_step_2"),nr_crit,"alt_");
            }
            var childs_ok = [];
        }else{
            childs_ok.push(childs[i]);
        }
    }
    var main_div = document.createElement('div');
    main_div.className = 'pad10 nums_of';
    main_div.innerHTML = "<i>"+document.getElementsByName("crit_"+j)[0].value+"</i>";
    $(".all_matrices_step_2").append(main_div);
    make_matrix(childs_ok,$(".all_matrices_step_2"),nr_crit,"alt_");
    $(".all_matrices_step_2").show();
    normalize_matrix($(".all_matrices_step_2"),nr_crit,"alt_");
    
    //vector prioritate criterii
    var childs = $(".all_matrices_step").children();
    var array_values = [];
    var pro_vect = childs[2].children[1].children;
    for(var i in pro_vect){
        if(pro_vect[i].className ==="nums_of_2")
            array_values.push(parseFloat(pro_vect[i].innerHTML));
    }
    
    var childs = $(".all_matrices_step_2").children();
    var array_values_2 = [];
    var k =0;
    for(var j in childs){
        if(j===3 || (j-3)%7===0){
            var array_values_aux = [];
            var pro_vect = childs[j].children[1].children;
            for(var i in pro_vect){
                if(pro_vect[i].className ==="nums_of_2")
                    array_values_aux.push(parseFloat(pro_vect[i].innerHTML));
            }
            array_values_2[k] = array_values_aux;
            k++;
        }
    }
  
    var altern_prio_with_crit = [];
    var matr_res = multiply(array_values_2,array_values);
    for(var i=0;i<matr_res[0].length;i++){
        var sum = 0;
        for(var j=0;j<matr_res.length;j++){
            sum+=matr_res[j][i];
        }
        altern_prio_with_crit.push(sum);
    } 
    make_matrix_conclusion($(".all_matrices_step_2"),nr_crit,"alt_",altern_prio_with_crit);
}

function make_matrix_conclusion(append,nr_of,type,values)
{
    var main_div = document.createElement('div');
    main_div.className = 'pad10';
    append.append(main_div);
    
    for(var i=0;i<=1;i++){
        var div_left = document.createElement('div');
        div_left.className = 'left';
        main_div.appendChild(div_left);
    }
    
    var div_clear = document.createElement('div');
    div_clear.className = 'clear';
    main_div.appendChild(div_clear);
    
    var res = [];
    for(var i in values){
        res.push({name: document.getElementsByName(type+(parseInt(i)+1))[0].value, val: values[i]});
    }
    res.sort(function(a,b) {
        return b.val - a.val;
    });
    console.log(res)
    //first column
    var divs = "";
    for(var i=0;i<=nr_of;i++){
        if(i===0)
            divs += "<div class='nums_of' style='height:20px;'></div>";
        else
            divs += "<div class='nums_of'>"+res[i-1].name+"</div>";
    }
    main_div.children[0].innerHTML = divs;
    
    //second column
    var divs = "";
    for(var i=0;i<=nr_of;i++){
        if(i===0)
            divs += "<div class='nums_of'>Result</div>";
        else{
            divs += "<div class='nums_of_2'>"+res[i-1].val+"</div>";
        }
    }
    main_div.children[1].innerHTML = divs;
}

function multiply(a, b) 
{
  var bNumRows = b.length, aNumRows = a[0].length;
      m = new Array(bNumRows);  
  for (var r = 0; r < bNumRows; ++r) {
    m[r] = new Array(aNumRows); 
    for (var c = 0; c < aNumRows; ++c) {
       m[r][c] = a[r][c] * b[r];
    }
  }
  return m;
}

function nrs_of(type)
{
    var sum = 0;
    var childs = type.children();
    for(var i in childs){
        if(typeof childs[i]==="object")
            if(typeof childs[i].style !=="undefined" && childs[i].style.display !== "none") sum++; 
    }
    return sum;
}

function alternative_form()
{
    var crits_nr = nrs_of($(".criteria"));
    for(var i=1;i<=crits_nr;i++){
        var main_div = document.createElement('div');
        main_div.className = 'pad10 nums_of';
        main_div.innerHTML = "<i>"+document.getElementsByName("crit_"+i)[0].value+"</i>";
        $(".comparisons_step_2").append(main_div);
        make_form($(".alternative"),"alt_",$(".comparisons_step_2"));
    } 
    $(".comparisons_step_2").show();
    make_comp();
}

function normalize_matrix(append,nr_of,type)
{
    var sum_col = [];
    for(var i=1;i<=nr_crit;i++){
        sum_col[i]=0;
        for(var j=1;j<=nr_crit;j++){
            sum_col[i]+= parseFloat(matrix_res[i][j]);
        }
    }
    var normal_matrix = [];
    for(var j=1;j<=nr_crit;j++){
        normal_matrix[j] = [];
        for(var i=1;i<=nr_crit;i++){ 
            normal_matrix[j][i] =  (matrix_res[i][j]/sum_col[i] - 0.0005);
        }
    } 
    //matricea normalizata
    make_matrix_html(append,nr_of,type,normal_matrix);
    //vectorul de prioritate
    make_eighvector_html(append,nr_of,type,normal_matrix);
    //CI
     var landa = 0;
    for(var j=1;j<=nr_crit;j++){
        var sum = 0;
        for(var i=1;i<=nr_crit;i++){
            sum += parseFloat(normal_matrix[j][i]);
        }
        landa += parseFloat(sum_col[j]*eighvector[j]);
    }
    var Ci = ((landa-nr_crit)/(nr_crit-1)).toPrecision(4); 
    if(Ci<=0) Ci*=-1;
    var main_div = document.createElement('div');
    main_div.className = 'pad10';
    main_div.innerHTML = "<b>CI:</b> "+Ci;
    append.append(main_div);
    //CR
    if(RI[nr_crit]===0) RI[nr_crit] = 1;
    var Cr = (parseFloat(Ci)/parseFloat(RI[nr_crit])).toFixed(4);
    
    var main_div = document.createElement('div');
    main_div.className = 'pad10';
    main_div.innerHTML = "<b>CR:</b> "+Cr;
    append.append(main_div);
    
    if(parseFloat(Cr)<0.1) 
        var txt = 'The results are corect. CR<0.1';
    else
       var txt = 'The results are irrelevant. CR>0.1';
    var main_div = document.createElement('div');
    main_div.className = 'pad10';
    main_div.innerHTML = "<b>"+txt+"</b>";
    append.append(main_div);
}

function make_matrix(childs,append,nr_of,type)
{
    var array_value_comp = [];
    for(var i in childs)
    {
        var childs_2 = childs[i].children;
        for(var j in childs_2){
            if(typeof childs_2[j].classList!=="undefined" && childs_2[j].classList.length>1){
                array_value_comp.push(childs_2[j].title);
            }
        }
    }
    var matr_comp = [];
    for(var i=1;i<=nr_crit;i++){
        matr_comp[i] = [];
    }
    for(var i=1;i<=nr_crit;i++){
        for(var j=1;j<=nr_crit;j++){
           if(i===j) matr_comp[i][j] = 1;
           if(arary_comb.indexOf(i+'_'+j)>-1) {
               if(typeof arr_txt[array_value_comp[arary_comb.indexOf(i+'_'+j)]]!=="undefined")
                    matr_comp[i][j] = arr_txt[array_value_comp[arary_comb.indexOf(i+'_'+j)]];   
                else
                    matr_comp[i][j] = array_value_comp[arary_comb.indexOf(i+'_'+j)];
               matr_comp[j][i] = 1/matr_comp[i][j];
           }
        }
    }
    make_matrix_html(append,nr_of,type,matr_comp);
    $(".matrix_compare_step").show();
}

function make_eighvector_html(append,nr_of,type,values)
{
    var main_div = document.createElement('div');
    main_div.className = 'pad10';
    append.append(main_div);
    
    for(var i=0;i<=1;i++){
        var div_left = document.createElement('div');
        div_left.className = 'left';
        main_div.appendChild(div_left);
    }
    
    var div_clear = document.createElement('div');
    div_clear.className = 'clear';
    main_div.appendChild(div_clear);
    
    //first column
    var divs = "";
    for(var i=0;i<=nr_of;i++){
        if(i===0)
            divs += "<div class='nums_of' style='height:20px;'></div>";
        else
            divs += "<div class='nums_of'>"+document.getElementsByName(type+i)[0].value+"</div>";
    }
    main_div.children[0].innerHTML = divs;
    
    //second column
    var divs = "";
    for(var i=0;i<=nr_of;i++){
        if(i===0)
            divs += "<div class='priority_vect'>Priority vector</div>";
        else{
            var sum = 0;
            for(var j=1;j<=nr_of;j++){
                sum+= parseFloat(values[i][j]);
            }
            eighvector[i] = (sum/nr_of+0.0005).toFixed(4);
            divs += "<div class='nums_of_2'>"+eighvector[i]+"</div>";
        }
    }
    main_div.children[1].innerHTML = divs;
}

function make_matrix_html(append,nr_of,type,values)
{
    var main_div = document.createElement('div');
    main_div.className = 'pad10';
    append.append(main_div);
    
    for(var i=0;i<=nr_of;i++){
        var div_left = document.createElement('div');
        div_left.className = 'left';
        main_div.appendChild(div_left);
    }
    
    var div_clear = document.createElement('div');
    div_clear.className = 'clear';
    main_div.appendChild(div_clear);
    
    //first column
    var divs = "";
    for(var i=0;i<=nr_of;i++){
        if(i===0)
            divs += "<div class='nums_of' style='height:20px;'></div>";
        else
            divs += "<div class='nums_of'>"+document.getElementsByName(type+i)[0].value+"</div>";
    }
    main_div.children[0].innerHTML = divs;
    
    //other columns
    for(var i=1;i<=nr_of;i++){
        var divs = "";
        matrix_res[i] = [];
        for(var j=0;j<=nr_of;j++){
            if(j===0)
                divs += "<div class='nums_of'>"+document.getElementsByName(type+i)[0].value+"</div>";
            else{
                matrix_res[i][j] = parseFloat(values[j][i]).toFixed(3);
                divs += "<div class='nums_of_2'>"+matrix_res[i][j]+"</div>";
            }
               
        }
        main_div.children[i].innerHTML = divs;
    }
}

function make_comp()
{
    $(".inp").click(function(){
        var parent = $(this).parent();
        var childs = parent.children(); 
        for(var i in childs){
            if(typeof childs[i].classList!=="undefined" && childs[i].classList.length>1){
                childs[i].className = "inp";
            }
        }
        $(this)[0].className = "inp selected";
    });
}

function make_form(clasa,type,append)
{
    nr_crit = nrs_of(clasa);
    arary_comb = return_combination(nr_crit);
    for(var i in arary_comb){
        var values = arary_comb[i].split("_");
        var newdiv = document.getElementById("comp");
        clone = newdiv.cloneNode(true);
        clone.id = "";
        clone.children[0].innerHTML = document.getElementsByName(type+values[0])[0].value;
        clone.children[18].innerHTML = document.getElementsByName(type+values[1])[0].value;
        append.append(clone);
    }
}

function return_combination(length)
{
    var array_ret = [];
    for(var i=1;i<length;i++){
        for(var j=i+1;j<length+1;j++){
            var vrb = i+'_'+j;
            array_ret.push(vrb);
        }
    }
    return array_ret;
}